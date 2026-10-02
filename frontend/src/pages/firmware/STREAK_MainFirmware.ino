/*
  STRËAK - Study Companion Firmware
  PIR-only session start, IR as tap sensor (also stops an active
  session on touch), WiFi + MQTT with proper reconnect handling,
  voice lines, environment monitoring, and the trained on-device
  anomaly detection model.
*/

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <HardwareSerial.h>
#include <DFRobotDFPlayerMini.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <The_Tell_inferencing.h>

const char* WIFI_SSID     = "Kamale's_Moto fusion";
const char* WIFI_PASSWORD = "Kamale6485";
const char* DEVICE_OWNER_EMAIL = "kamaleswari0615@gmail.com";

const char* MQTT_HOST = "hb67af32.ala.asia-southeast1.emqxsl.com";
const int   MQTT_PORT = 8883;
const char* MQTT_USER = "streak_esp32";
const char* MQTT_PASS = "KamaleStreakesp32";

#define DHTPIN      4
#define DHTTYPE     DHT22
#define MQ135_PIN   34
#define PIR_PIN     35
#define IR_PIN      32
#define TRIG_PIN    5
#define ECHO_PIN    18
#define BUZZER_PIN  19
#define LED_WHITE   13
#define LED_BLUE    14
#define LED_GREEN   27
#define LED_YELLOW  26
#define LED_RED     25

#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_ADDR     0x3C

const float PHONE_DETECT_DELTA = 5.0;
const float PHONE_CLEAR_DELTA  = 3.0;
const unsigned long PHONE_CONFIRM_MS = 2000UL;
const int   AQI_BAD_THRESHOLD  = 1800;
const unsigned long SESSION_START_GRACE_MS = 2000UL;
const unsigned long SETTLE_IN_MS = 60000UL;
const unsigned long PIR_ABSENCE_TIMEOUT_MS = 20000UL;

#define EI_WINDOW_SIZE 10
float eiBuffer[EI_WINDOW_SIZE];
int eiBufferIndex = 0;
bool eiBufferFull = false;
const float ANOMALY_THRESHOLD = 0.3;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
DHT dht(DHTPIN, DHTTYPE);
HardwareSerial dfSerial(2);
DFRobotDFPlayerMini myMP3;

WiFiClientSecure wifiSecureClient;
PubSubClient mqttClient(wifiSecureClient);
String topicPresence, topicPhone, topicBreak, topicEnvironment, topicStatus, topicTap, topicAnomaly;
unsigned long lastMqttReconnectAttempt = 0;
unsigned long lastStatusPublish = 0;

bool sessionActive = false;
bool settlingIn = false;
unsigned long settleStartMillis = 0;
unsigned long lastMotionMillis = 0;
int  introStep = 0;
unsigned long introStartMillis = 0;
unsigned long sessionStartMillis = 0;
unsigned long totalPausedMillis = 0;
unsigned long pauseStartMillis = 0;

float deskBaselineCm = 0;
unsigned long closeObjectSince = 0;
bool rawObjectPresent = false;
bool phoneAlerted = false;
bool aqiAlerted = false;
bool lastIrState = false;

int lastPlayedTrack = 0;
const char* voiceNames[] = {
  "", "Session started", "Building momentum", "Full flow",
  "First session completed", "Break's over", "Object detected",
  "Welcome back", "Air quality bad", "Session ended"
};

#define DIST_SAMPLES 5
float distBuffer[DIST_SAMPLES] = {0};
int   distIndex = 0;
bool  distFilled = false;

void connectWiFi() {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(100);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) { delay(500); attempts++; }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected.");
  } else {
    Serial.println("WiFi still not connected - will retry.");
  }
}
void connectMQTT() { mqttClient.connect("streak_esp32_client", MQTT_USER, MQTT_PASS); }
void publishEvent(String topic, String payload) {
  if (mqttClient.connected()) mqttClient.publish(topic.c_str(), payload.c_str());
}
void publishStatus(bool pir, bool ir, float dist, float temp, float hum, int aqi) {
  if (!mqttClient.connected() || millis() - lastStatusPublish < 1000) return;
  lastStatusPublish = millis();
  String sessionText;
  if (settlingIn) {
    unsigned long remaining = (SETTLE_IN_MS - (millis() - settleStartMillis)) / 1000;
    sessionText = "getting ready " + String(remaining) + "s";
  } else if (!sessionActive) sessionText = "standby";
  else if (phoneAlerted) sessionText = "phone detected";
  else {
    unsigned long e = getElapsedSec();
    sessionText = String(e / 60) + ":" + (e % 60 < 10 ? "0" : "") + String(e % 60) + " active";
  }
  String json = "{\"session\":\"" + sessionText + "\",\"ir\":" + String(ir) + ",\"pir\":" + String(pir) +
    ",\"dist\":" + String(dist,1) + ",\"gas\":" + String(aqi) + ",\"temp\":" + String(temp,1) +
    ",\"hum\":" + String(hum,0) + ",\"led\":\"" + String(currentLedName()) + "\",\"speaker\":\"" +
    String(lastPlayedTrack > 0 ? voiceNames[lastPlayedTrack] : "-") + "\",\"phoneAlerted\":" +
    String(phoneAlerted ? "true" : "false") + ",\"aqiAlerted\":" + String(aqiAlerted ? "true" : "false") + "}";
  mqttClient.publish(topicStatus.c_str(), json.c_str());
}

int eiGetData(size_t offset, size_t length, float *out_ptr) {
  memcpy(out_ptr, eiBuffer + offset, length * sizeof(float));
  return 0;
}

void checkAnomalyModel(float liveDist) {
  if (liveDist <= 0) return;
  eiBuffer[eiBufferIndex] = liveDist;
  eiBufferIndex = (eiBufferIndex + 1) % EI_WINDOW_SIZE;
  if (eiBufferIndex == 0) eiBufferFull = true;
  if (!eiBufferFull) return;

  signal_t signal;
  signal.total_length = EI_WINDOW_SIZE;
  signal.get_data = &eiGetData;

  ei_impulse_result_t result = { 0 };
  EI_IMPULSE_ERROR res = run_classifier(&signal, &result, false);
  if (res != EI_IMPULSE_OK) {
    Serial.print("Anomaly model error: "); Serial.println(res);
    return;
  }

  Serial.print("Anomaly score: "); Serial.println(result.anomaly);

  if (result.anomaly > ANOMALY_THRESHOLD) {
    publishEvent(topicAnomaly, "suggested");
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);
  Wire.begin(21, 22);

  pinMode(PIR_PIN, INPUT);
  pinMode(IR_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_WHITE, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  allLedsOff();

  dht.begin();
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) Serial.println("OLED not detected!");

  dfSerial.begin(9600, SERIAL_8N1, 16, 17);
  if (!myMP3.begin(dfSerial)) {
    Serial.println("DFPlayer NOT found.");
  } else {
    Serial.println("DFPlayer online.");
    myMP3.volume(30);
  }

  calibrateDesk();

  topicPresence    = "streak/" + String(DEVICE_OWNER_EMAIL) + "/presence";
  topicPhone       = "streak/" + String(DEVICE_OWNER_EMAIL) + "/phone";
  topicBreak       = "streak/" + String(DEVICE_OWNER_EMAIL) + "/break";
  topicEnvironment = "streak/" + String(DEVICE_OWNER_EMAIL) + "/environment";
  topicStatus      = "streak/" + String(DEVICE_OWNER_EMAIL) + "/status";
  topicTap         = "streak/" + String(DEVICE_OWNER_EMAIL) + "/tap";
  topicAnomaly     = "streak/" + String(DEVICE_OWNER_EMAIL) + "/anomaly";

  connectWiFi();
  wifiSecureClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  connectMQTT();

  bootAnimation();
  setLed(LED_WHITE);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastMqttReconnectAttempt > 10000) {
      lastMqttReconnectAttempt = millis();
      connectWiFi();
    }
  } else if (!mqttClient.connected()) {
    if (millis() - lastMqttReconnectAttempt > 5000) { lastMqttReconnectAttempt = millis(); connectMQTT(); }
  } else {
    mqttClient.loop();
  }

  bool livePIR = digitalRead(PIR_PIN) == HIGH;
  bool liveIR  = digitalRead(IR_PIN) == LOW;
  float liveDist = measureDistanceCm();
  updateDistBuffer(liveDist);
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  int aqi = analogRead(MQ135_PIN);

  if (liveIR && !lastIrState) {
    publishEvent(topicTap, "tap");
    Serial.println("Tap detected - sent I'm here signal.");
    if (sessionActive) {
      Serial.println("Tap during active session - ending session.");
      endSession();
    }
  }
  lastIrState = liveIR;

  if (livePIR) lastMotionMillis = millis();

  if (!sessionActive && !settlingIn && livePIR) {
    settlingIn = true;
    settleStartMillis = millis();
    lastMotionMillis = millis();
  }
  if (settlingIn && millis() - lastMotionMillis > PIR_ABSENCE_TIMEOUT_MS) settlingIn = false;
  if (settlingIn && millis() - settleStartMillis >= SETTLE_IN_MS) {
    settlingIn = false;
    startSession();
  }
  if (sessionActive && millis() - lastMotionMillis > PIR_ABSENCE_TIMEOUT_MS) endSession();

  if (sessionActive) {
    checkPhoneAndAir(liveDist, aqi);
    checkAnomalyModel(liveDist);
    if (!phoneAlerted) runIntroSequence();
  }
  updateLed(sessionActive || settlingIn);
  updateOLED(livePIR, liveIR, liveDist, temp, hum, aqi);
  printSerialStatus(livePIR, liveIR, liveDist, temp, hum, aqi);
  publishStatus(livePIR, liveIR, liveDist, temp, hum, aqi);
  delay(200);
}

void startSession() {
  sessionActive = true;
  sessionStartMillis = millis();
  totalPausedMillis = 0;
  introStep = 0;
  phoneAlerted = false;
  aqiAlerted = false;
  closeObjectSince = 0;
  rawObjectPresent = false;
  eiBufferIndex = 0;
  eiBufferFull = false;
  sayVoice(1);
  introStep = 1;
  introStartMillis = millis();
  publishEvent(topicPresence, "start");
}
void endSession() {
  sessionActive = false;
  settlingIn = false;
  introStep = 0;
  phoneAlerted = false;
  aqiAlerted = false;
  sayVoice(9);
  publishEvent(topicPresence, "end");
}
unsigned long getElapsedSec() { return (millis() - sessionStartMillis - totalPausedMillis) / 1000; }

void runIntroSequence() {
  unsigned long sinceStep = millis() - introStartMillis;
  if (introStep == 1 && sinceStep >= 15000) { sayVoice(3); introStep = 2; introStartMillis = millis(); }
  else if (introStep == 2 && sinceStep >= 15000) { sayVoice(4); introStep = 3; introStartMillis = millis(); publishEvent(topicBreak, "forced"); }
  else if (introStep == 3 && sinceStep >= 15000) { sayVoice(5); introStep = 4; }
}

void checkPhoneAndAir(float liveDist, int aqi) {
  float smoothed = getSmoothedDistance();
  float drop = (smoothed > 0) ? (deskBaselineCm - smoothed) : 0;
  if (!rawObjectPresent && drop > PHONE_DETECT_DELTA) rawObjectPresent = true;
  else if (rawObjectPresent && drop < PHONE_CLEAR_DELTA) rawObjectPresent = false;
  if (rawObjectPresent) { if (closeObjectSince == 0) closeObjectSince = millis(); } else closeObjectSince = 0;
  bool objectOnDesk = closeObjectSince != 0 && millis() - closeObjectSince >= PHONE_CONFIRM_MS;
  if (objectOnDesk && !phoneAlerted) { phoneAlerted = true; pauseStartMillis = millis(); sayVoice(6); publishEvent(topicPhone, "detected"); }
  else if (!objectOnDesk && phoneAlerted) { phoneAlerted = false; totalPausedMillis += millis() - pauseStartMillis; sayVoice(7); publishEvent(topicPhone, "cleared"); }

  bool pastGrace = millis() - sessionStartMillis > SESSION_START_GRACE_MS;
  if (!phoneAlerted && pastGrace) {
    if (aqi >= AQI_BAD_THRESHOLD && !aqiAlerted) { aqiAlerted = true; sayVoice(8); publishEvent(topicEnvironment, "danger"); }
    else if (aqi < AQI_BAD_THRESHOLD) aqiAlerted = false;
  }
}

void updateLed(bool presentOrSettling) {
  if (phoneAlerted) { setLed(LED_RED); return; }
  if (!presentOrSettling) { setLed(LED_WHITE); return; }
  if (settlingIn) { setLed(LED_WHITE); return; }
  if (introStep >= 4) { setLed(LED_GREEN); return; }
  if (introStep >= 3) { setLed(LED_BLUE); return; }
  setLed(LED_YELLOW);
}

void sayVoice(int track) {
  int realTrack = 10 - track;
  lastPlayedTrack = track;
  Serial.print("Voice line "); Serial.println(track);
  digitalWrite(BUZZER_PIN, HIGH); delay(100); digitalWrite(BUZZER_PIN, LOW); delay(100);
  myMP3.play(realTrack);
}

void bootAnimation() {
  unsigned long start = millis(); int frame = 0;
  while (millis() - start < 3000) {
    display.clearDisplay(); display.setTextSize(1); display.setTextColor(SSD1306_WHITE);
    display.setCursor(30, 40); display.println("booting...");
    int cx=64, cy=20, r=10; float a=(frame%8)*(2*PI/8);
    display.drawCircle(cx,cy,r,SSD1306_WHITE);
    display.fillCircle(cx+r*cos(a), cy+r*sin(a), 2, SSD1306_WHITE);
    display.display(); frame++; delay(150);
  }
  unsigned long t=millis();
  while (millis()-t<3000) {
    display.clearDisplay(); display.setTextSize(2); display.setTextColor(SSD1306_WHITE);
    display.setCursor(20,28); display.println("STREAK"); display.display(); delay(100);
  }
}

void setLed(int led) {
  digitalWrite(LED_WHITE, led==LED_WHITE); digitalWrite(LED_BLUE, led==LED_BLUE);
  digitalWrite(LED_GREEN, led==LED_GREEN); digitalWrite(LED_YELLOW, led==LED_YELLOW);
  digitalWrite(LED_RED, led==LED_RED);
}
void allLedsOff() { setLed(-1); }

float measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long dur = pulseIn(ECHO_PIN, HIGH, 30000);
  if (dur == 0) return -1;
  return dur * 0.0343 / 2.0;
}
void updateDistBuffer(float v) {
  if (v <= 0) return;
  distBuffer[distIndex] = v; distIndex = (distIndex+1)%DIST_SAMPLES;
  if (distIndex == 0) distFilled = true;
}
float getSmoothedDistance() {
  int count = distFilled ? DIST_SAMPLES : distIndex;
  if (count == 0) return -1;
  float sorted[DIST_SAMPLES];
  for (int i=0;i<count;i++) sorted[i]=distBuffer[i];
  for (int i=1;i<count;i++){float k=sorted[i];int j=i-1;while(j>=0&&sorted[j]>k){sorted[j+1]=sorted[j];j--;}sorted[j+1]=k;}
  return sorted[count/2];
}
void calibrateDesk() {
  float total=0; int valid=0;
  for(int i=0;i<8;i++){float d=measureDistanceCm(); if(d>0){total+=d;valid++;} delay(150);}
  deskBaselineCm = valid>0 ? total/valid : 40.0;
}
const char* currentLedName() {
  if (digitalRead(LED_RED)) return "red";
  if (digitalRead(LED_GREEN)) return "green";
  if (digitalRead(LED_BLUE)) return "blue";
  if (digitalRead(LED_YELLOW)) return "yellow";
  if (digitalRead(LED_WHITE)) return "white";
  return "off";
}
void updateOLED(bool pir, bool ir, float dist, float temp, float hum, int aqi) {
  display.clearDisplay(); display.setTextSize(1); display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0); display.print("session: ");
  if (settlingIn) { unsigned long r=(SETTLE_IN_MS-(millis()-settleStartMillis))/1000; display.print("getting ready "); display.println(r); }
  else if (!sessionActive) display.println("standby");
  else if (phoneAlerted) display.println("phone detected");
  else { unsigned long e=getElapsedSec(); display.print(e/60); display.print(":"); if(e%60<10)display.print("0"); display.print(e%60); display.println(" active"); }
  display.setCursor(0,12); display.print("ir(tap): "); display.print(ir); display.print("  pir: "); display.println(pir);
  display.setCursor(0,24); display.print("gas value: "); display.println(aqi);
  display.setCursor(0,36); display.print("temp: "); display.print(temp,1); display.print("  hum: "); display.println(hum,0);
  display.setCursor(0,48); display.print("led: "); display.println(currentLedName());
  display.setCursor(0,56); display.print("speaker: "); display.println(lastPlayedTrack>0?voiceNames[lastPlayedTrack]:"-");
  display.display();
}
void printSerialStatus(bool pir, bool ir, float dist, float temp, float hum, int aqi) {
  Serial.print("ir(tap):"); Serial.print(ir); Serial.print(" pir:"); Serial.println(pir);
}
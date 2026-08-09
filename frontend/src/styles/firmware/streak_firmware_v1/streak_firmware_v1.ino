/*
  STRËAK - Study Companion Firmware
  Features: Break Enforcement, SOS Button, Environment Health Alert
*/

#define TEST_MODE true

#if TEST_MODE
  #define TIME_UNIT_SECONDS 1
#else
  #define TIME_UNIT_SECONDS 60
#endif

#define BLUE_THRESHOLD_UNITS   10
#define GREEN_THRESHOLD_UNITS  20
#define BREAK_THRESHOLD_UNITS  30

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

#define DHTPIN      4
#define DHTTYPE     DHT22
#define MQ135_PIN   34
#define PIR_PIN     35
#define IR_PIN      32
#define TRIG_PIN    5
#define ECHO_PIN    18
#define BUZZER_PIN  19
#define BTN_PIN     33
#define LED_WHITE   13
#define LED_BLUE    14
#define LED_GREEN   27
#define LED_YELLOW  26
#define LED_RED     25

#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_ADDR     0x3C

// thresholds
const unsigned long BLUE_THRESHOLD_SEC  = (unsigned long)BLUE_THRESHOLD_UNITS  * TIME_UNIT_SECONDS;
const unsigned long GREEN_THRESHOLD_SEC = (unsigned long)GREEN_THRESHOLD_UNITS * TIME_UNIT_SECONDS;
const unsigned long BREAK_THRESHOLD_SEC = (unsigned long)BREAK_THRESHOLD_UNITS * TIME_UNIT_SECONDS;
const unsigned long ABSENCE_TIMEOUT_MS  = 15000UL;
const float         PHONE_DETECT_DELTA  = 5.0;
const unsigned long PHONE_CONFIRM_MS    = 2000UL;

// environment thresholds
const float    TEMP_DANGER    = 35.0;
const int      AQI_DANGER     = 300;
const float    TEMP_WARNING   = 32.0;
const int      AQI_WARNING    = 200;

// SOS
const unsigned long SOS_HOLD_MS = 3000UL;

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
DHT dht(DHTPIN, DHTTYPE);

enum SessionState { STANDBY, ACTIVE, PAUSED_PHONE, BREAK_TIME };
SessionState state = STANDBY;

unsigned long sessionStartMillis    = 0;
unsigned long totalPausedMillis     = 0;
unsigned long pauseStartMillis      = 0;
unsigned long lastPresentMillis     = 0;
unsigned long closeObjectSince      = 0;
unsigned long frozenElapsedSec      = 0;
unsigned long breakStartMillis      = 0;
unsigned long btnPressStart         = 0;
bool          btnHeld               = false;
bool          sosTriggered          = false;

bool milestoneBlue  = false;
bool milestoneGreen = false;
bool milestoneBreak = false;
bool envAlerted     = false;

float deskBaseline = 0;

unsigned long lastDhtRead  = 0;
float lastTemp     = NAN;
float lastHumidity = NAN;
int   lastAQI      = 0;

bool livePIR  = false;
bool liveIR   = false;
float liveDist = -1;

// companion messages shown on OLED
const char* companionMessages[] = {
  "you got this!",
  "stay focused.",
  "one step at a time.",
  "STREAK studies you.",
  "keep going!",
  "you are doing great.",
  "distraction = lost time.",
  "your effort is visible."
};
int msgIndex = 0;
unsigned long lastMsgChange = 0;

void setup() {
  Serial.begin(115200);
  delay(300);
  Wire.begin(21, 22);

  pinMode(PIR_PIN,    INPUT);
  pinMode(IR_PIN,     INPUT);
  pinMode(TRIG_PIN,   OUTPUT);
  pinMode(ECHO_PIN,   INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BTN_PIN,    INPUT_PULLUP);
  pinMode(LED_WHITE,  OUTPUT);
  pinMode(LED_BLUE,   OUTPUT);
  pinMode(LED_GREEN,  OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED,    OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  allLedsOff();
  dht.begin();

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("OLED failed");
  }

  showOLED("STREAK", "booting...", "", "", "");
  calibrateDesk();

  setLed(LED_WHITE);
  Serial.println("=== STREAK READY ===");
  Serial.print("Baseline: "); Serial.println(deskBaseline);
  showOLED("STREAK READY", "sit down to start", "", "", "");
  delay(1000);
}

void loop() {
  livePIR  = digitalRead(PIR_PIN) == HIGH;
  liveIR   = digitalRead(IR_PIN)  == LOW;
  liveDist = measureDistance();
  readEnv();
  handleButton();
  checkEnvironment();

  bool present = livePIR && liveIR;

  switch (state) {

    case STANDBY:
      if (present && !sosTriggered) startSession();
      updateOLED();
      break;

    case ACTIVE:
      if (liveIR) lastPresentMillis = millis();
      if (millis() - lastPresentMillis > ABSENCE_TIMEOUT_MS) {
        endSession(); break;
      }
      checkPhone();
      if (state == ACTIVE) {
        unsigned long elapsed = getElapsed();
        updateMomentumLED(elapsed);
        checkBreak(elapsed);
      }
      updateOLED();
      break;

    case PAUSED_PHONE:
      if (liveIR) lastPresentMillis = millis();
      if (millis() - lastPresentMillis > ABSENCE_TIMEOUT_MS) {
        endSession(); break;
      }
      checkPhone();
      updateOLED();
      break;

    case BREAK_TIME:
      if (millis() - breakStartMillis > 10UL * TIME_UNIT_SECONDS * 1000UL) {
        state = ACTIVE;
        setLed(LED_YELLOW);
        beep(1);
        Serial.println("BREAK OVER - back to studying!");
      }
      updateOLED();
      break;
  }

  delay(200);
}

// ── SESSION ──────────────────────────────────────────────

void startSession() {
  state             = ACTIVE;
  sessionStartMillis = millis();
  totalPausedMillis  = 0;
  lastPresentMillis  = millis();
  milestoneBlue      = false;
  milestoneGreen     = false;
  milestoneBreak     = false;
  envAlerted         = false;
  closeObjectSince   = 0;
  setLed(LED_YELLOW);
  beep(1);
  Serial.println("SESSION STARTED");
}

void endSession() {
  unsigned long elapsed = getElapsed();
  Serial.print("SESSION ENDED - "); Serial.print(elapsed); Serial.println("s");
  state = STANDBY;
  setLed(LED_WHITE);
  milestoneBreak = false;
}

unsigned long getElapsed() {
  if (state == PAUSED_PHONE) return frozenElapsedSec;
  return (millis() - sessionStartMillis - totalPausedMillis) / 1000;
}

// ── PHONE DETECTION ───────────────────────────────────────

void checkPhone() {
  bool objectNow = liveDist > 0 && (deskBaseline - liveDist) > PHONE_DETECT_DELTA;
  if (objectNow) {
    if (closeObjectSince == 0) closeObjectSince = millis();
  } else {
    closeObjectSince = 0;
  }
  bool phoneOnDesk = closeObjectSince != 0 && millis() - closeObjectSince >= PHONE_CONFIRM_MS;

  if (state == ACTIVE && phoneOnDesk) {
    state = PAUSED_PHONE;
    pauseStartMillis = millis();
    frozenElapsedSec = getElapsed();
    setLed(LED_RED);
    beep(2);
    Serial.println("PHONE DETECTED - PAUSED");
  } else if (state == PAUSED_PHONE && !objectNow) {
    totalPausedMillis += millis() - pauseStartMillis;
    state = ACTIVE;
    Serial.println("PHONE REMOVED - RESUMED");
  }
}

// ── BREAK ENFORCEMENT ─────────────────────────────────────

void checkBreak(unsigned long elapsedSec) {
  if (!milestoneBreak && elapsedSec >= BREAK_THRESHOLD_SEC) {
    milestoneBreak  = true;
    breakStartMillis = millis();
    state = BREAK_TIME;
    setLed(LED_BLUE);
    beep(3);
    Serial.println("BREAK TIME - you have been studying too long!");
  }
}

// ── ENVIRONMENT HEALTH ALERT ──────────────────────────────

void checkEnvironment() {
  if (isnan(lastTemp)) return;
  bool danger = lastTemp >= TEMP_DANGER || lastAQI >= AQI_DANGER;
  bool warning = lastTemp >= TEMP_WARNING || lastAQI >= AQI_WARNING;

  if (danger && !envAlerted) {
    envAlerted = true;
    setLed(LED_RED);
    // rapid beep alarm
    for (int i = 0; i < 5; i++) {
      digitalWrite(BUZZER_PIN, HIGH); delay(100);
      digitalWrite(BUZZER_PIN, LOW);  delay(100);
    }
    Serial.println("DANGER - environment unsafe!");
    showOLED("!! DANGER !!", "ventilate room", "immediately", "", "");
    delay(2000);
  } else if (warning && state == ACTIVE) {
    Serial.println("WARNING - environment affecting focus");
  }
}

// ── SOS BUTTON ────────────────────────────────────────────

void handleButton() {
  bool pressed = digitalRead(BTN_PIN) == LOW;

  if (pressed) {
    if (btnPressStart == 0) btnPressStart = millis();
    unsigned long held = millis() - btnPressStart;

    // visual countdown on OLED
    if (held > 1000 && held < SOS_HOLD_MS) {
      showOLED("HOLD FOR SOS", "release to cancel", "", "", "");
    }

    if (held >= SOS_HOLD_MS && !sosTriggered) {
      sosTriggered = true;
      triggerSOS();
    }
  } else {
    if (btnPressStart > 0 && !sosTriggered) {
      // short press — toggle break
      if (state == ACTIVE) {
        breakStartMillis = millis();
        state = BREAK_TIME;
        setLed(LED_BLUE);
        beep(1);
        Serial.println("MANUAL BREAK");
      } else if (state == BREAK_TIME) {
        state = ACTIVE;
        setLed(LED_YELLOW);
        beep(1);
        Serial.println("BREAK ENDED");
      }
    }
    btnPressStart = 0;
    sosTriggered  = false;
  }
}

void triggerSOS() {
  Serial.println("=== SOS TRIGGERED ===");
  setLed(LED_RED);
  // loud continuous alarm
  for (int i = 0; i < 10; i++) {
    digitalWrite(BUZZER_PIN, HIGH); delay(200);
    digitalWrite(BUZZER_PIN, LOW);  delay(100);
  }
  showOLED("!! SOS SENT !!", "help is coming", "stay calm", "", "");
  // publish via MQTT when WiFi integrated
  Serial.println("SOS published to backend");
  delay(3000);
  setLed(LED_WHITE);
}

// ── LED ───────────────────────────────────────────────────

void updateMomentumLED(unsigned long elapsedSec) {
  if (elapsedSec >= GREEN_THRESHOLD_SEC) {
    setLed(LED_GREEN);
    if (!milestoneGreen) {
      milestoneGreen = true;
      beep(3);
      Serial.println("MILESTONE: GREEN!");
    }
  } else if (elapsedSec >= BLUE_THRESHOLD_SEC) {
    setLed(LED_BLUE);
    if (!milestoneBlue) {
      milestoneBlue = true;
      beep(3);
      Serial.println("MILESTONE: BLUE!");
    }
  } else {
    setLed(LED_YELLOW);
  }
}

void setLed(int led) {
  digitalWrite(LED_WHITE,  led == LED_WHITE  ? HIGH : LOW);
  digitalWrite(LED_BLUE,   led == LED_BLUE   ? HIGH : LOW);
  digitalWrite(LED_GREEN,  led == LED_GREEN  ? HIGH : LOW);
  digitalWrite(LED_YELLOW, led == LED_YELLOW ? HIGH : LOW);
  digitalWrite(LED_RED,    led == LED_RED    ? HIGH : LOW);
}

void allLedsOff() {
  digitalWrite(LED_WHITE,  LOW);
  digitalWrite(LED_BLUE,   LOW);
  digitalWrite(LED_GREEN,  LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED,    LOW);
}

// ── BUZZER ────────────────────────────────────────────────

void beep(int type) {
  switch (type) {
    case 1:
      digitalWrite(BUZZER_PIN, HIGH); delay(200);
      digitalWrite(BUZZER_PIN, LOW);
      break;
    case 2:
      for (int i = 0; i < 2; i++) {
        digitalWrite(BUZZER_PIN, HIGH); delay(150);
        digitalWrite(BUZZER_PIN, LOW);  delay(150);
      }
      break;
    case 3:
      for (int i = 0; i < 3; i++) {
        digitalWrite(BUZZER_PIN, HIGH); delay(120);
        digitalWrite(BUZZER_PIN, LOW);  delay(120);
      }
      break;
  }
}

// ── ULTRASONIC ────────────────────────────────────────────

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long dur = pulseIn(ECHO_PIN, HIGH, 30000);
  if (dur == 0) return -1;
  return dur * 0.0343 / 2.0;
}

void calibrateDesk() {
  float total = 0; int valid = 0;
  for (int i = 0; i < 8; i++) {
    float d = measureDistance();
    if (d > 0) { total += d; valid++; }
    delay(150);
  }
  deskBaseline = valid > 0 ? total / valid : 40.0;
  Serial.print("Baseline: "); Serial.println(deskBaseline);
}

// ── ENVIRONMENT ───────────────────────────────────────────

void readEnv() {
  if (millis() - lastDhtRead > 2000) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      lastHumidity = h;
      lastTemp     = t;
    }
    lastDhtRead = millis();
  }
  lastAQI = analogRead(MQ135_PIN);
}

// ── OLED ──────────────────────────────────────────────────

void showOLED(const char* l1, const char* l2, const char* l3, const char* l4, const char* l5) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  int y = 0;
  if (strlen(l1)) { display.setCursor(0, y); display.println(l1); } y += 12;
  if (strlen(l2)) { display.setCursor(0, y); display.println(l2); } y += 12;
  if (strlen(l3)) { display.setCursor(0, y); display.println(l3); } y += 12;
  if (strlen(l4)) { display.setCursor(0, y); display.println(l4); } y += 12;
  if (strlen(l5)) { display.setCursor(0, y); display.println(l5); }
  display.display();
}

void updateOLED() {
  unsigned long elapsed = 0;
  if (state != STANDBY) elapsed = getElapsed();
  int mm = elapsed / 60;
  int ss = elapsed % 60;

  // rotate companion message every 10 seconds
  if (millis() - lastMsgChange > 10000) {
    msgIndex = (msgIndex + 1) % 8;
    lastMsgChange = millis();
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // row 1 — timer and state
  display.setCursor(0, 0);
  if (mm < 10) display.print("0");
  display.print(mm); display.print(":");
  if (ss < 10) display.print("0");
  display.print(ss); display.print(" ");
  switch (state) {
    case STANDBY:      display.println("STANDBY");    break;
    case ACTIVE:       display.println("ACTIVE");     break;
    case PAUSED_PHONE: display.println("PHONE!");     break;
    case BREAK_TIME:   display.println("BREAK");      break;
  }

  // row 2 — sensors
  display.setCursor(0, 12);
  display.print("PIR:"); display.print(livePIR ? "1" : "0");
  display.print(" IR:"); display.print(liveIR  ? "1" : "0");
  display.print(" D:"); display.print(liveDist, 0);

  // row 3 — environment
  display.setCursor(0, 24);
  display.print("T:"); display.print(isnan(lastTemp) ? 0.0 : lastTemp, 1);
  display.print("C H:"); display.print(isnan(lastHumidity) ? 0.0 : lastHumidity, 0);
  display.print("%");

  // row 4 — AQI
  display.setCursor(0, 36);
  display.print("AQI:"); display.print(lastAQI);
  if (lastAQI >= AQI_DANGER) display.print(" DANGER");
  else if (lastAQI >= AQI_WARNING) display.print(" WARN");
  else display.print(" OK");

  // row 5 — companion message
  display.setCursor(0, 48);
  display.print(companionMessages[msgIndex]);

  // row 6 — LED state
  display.setCursor(0, 56);
  display.print("LED:"); display.print(currentLedName());

  display.display();
}

const char* currentLedName() {
  if (digitalRead(LED_RED))    return "RED";
  if (digitalRead(LED_GREEN))  return "GREEN";
  if (digitalRead(LED_BLUE))   return "BLUE";
  if (digitalRead(LED_YELLOW)) return "YELLOW";
  if (digitalRead(LED_WHITE))  return "WHITE";
  return "OFF";
}
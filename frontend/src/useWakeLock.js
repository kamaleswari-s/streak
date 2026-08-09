import { useRef, useCallback } from 'react'

function useWakeLock() {
  const wakeLockRef = useRef(null)

  const requestWakeLock = useCallback(async () => {
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch (err) {
      console.log('Wake Lock not available:', err.message)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }, [])

  return { requestWakeLock, releaseWakeLock }
}

export default useWakeLock
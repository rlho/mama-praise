import { useState, useEffect, useCallback } from 'react'

const NOTIFICATION_KEY = 'mama-praise-notification'

const isNotificationSupported = typeof Notification !== 'undefined'
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone === true

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(
    isNotificationSupported ? Notification.permission : 'default'
  )
  const [enabled, setEnabledState] = useState(() => {
    return localStorage.getItem(NOTIFICATION_KEY) === 'enabled'
  })

  // iOSでPWAとしてインストールされていない場合は通知不可
  const notSupported = !isNotificationSupported || (isIOS && !isStandalone)

  const requestAndEnable = useCallback(async () => {
    if (!isNotificationSupported) return false

    let perm = Notification.permission
    if (perm === 'default') {
      perm = await Notification.requestPermission()
    }
    setPermission(perm)

    if (perm === 'granted') {
      localStorage.setItem(NOTIFICATION_KEY, 'enabled')
      setEnabledState(true)
      const reg = await navigator.serviceWorker?.ready
      reg?.active?.postMessage({ type: 'SCHEDULE_NOTIFICATION' })
      return true
    }
    return false
  }, [])

  const disable = useCallback(() => {
    localStorage.setItem(NOTIFICATION_KEY, 'disabled')
    setEnabledState(false)
  }, [])

  useEffect(() => {
    if (enabled && permission === 'granted') {
      navigator.serviceWorker?.ready.then(reg => {
        reg?.active?.postMessage({ type: 'SCHEDULE_NOTIFICATION' })
      })
    }
  }, [enabled, permission])

  return { permission, enabled, notSupported, requestAndEnable, disable }
}

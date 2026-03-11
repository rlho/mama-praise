import { useState, useEffect, useCallback } from 'react'

const NOTIFICATION_KEY = 'mama-praise-notification'

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [enabled, setEnabledState] = useState(() => {
    return localStorage.getItem(NOTIFICATION_KEY) === 'enabled'
  })

  const requestAndEnable = useCallback(async () => {
    if (typeof Notification === 'undefined') return false

    let perm = Notification.permission
    if (perm === 'default') {
      perm = await Notification.requestPermission()
    }
    setPermission(perm)

    if (perm === 'granted') {
      localStorage.setItem(NOTIFICATION_KEY, 'enabled')
      setEnabledState(true)
      // Service Workerに通知スケジュールを依頼
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

  // アプリ起動時に通知が有効なら再スケジュール
  useEffect(() => {
    if (enabled && permission === 'granted') {
      navigator.serviceWorker?.ready.then(reg => {
        reg?.active?.postMessage({ type: 'SCHEDULE_NOTIFICATION' })
      })
    }
  }, [enabled, permission])

  return { permission, enabled, requestAndEnable, disable }
}

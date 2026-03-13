import { useState, useEffect, useCallback } from 'react'

const NOTIFICATION_KEY = 'mama-praise-notification'

const isNotificationSupported = typeof Notification !== 'undefined'
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone === true

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>(
    isNotificationSupported ? Notification.permission : 'default'
  )
  const [enabled, setEnabledState] = useState(() => {
    return localStorage.getItem(NOTIFICATION_KEY) === 'enabled'
  })

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

      // Push Managerに購読
      const reg = await navigator.serviceWorker?.ready
      if (reg) {
        try {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              import.meta.env.VITE_VAPID_PUBLIC_KEY
            ),
          })
          // サーバーに購読情報を送信
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub.toJSON() }),
          })
        } catch (e) {
          console.error('Push subscription failed:', e)
        }
      }
      return true
    }
    return false
  }, [])

  const disable = useCallback(async () => {
    localStorage.setItem(NOTIFICATION_KEY, 'disabled')
    setEnabledState(false)

    // Push購読解除
    const reg = await navigator.serviceWorker?.ready
    if (reg) {
      try {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          const endpoint = sub.endpoint
          await sub.unsubscribe()
          // サーバーから削除
          await fetch('/api/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint }),
          })
        }
      } catch (e) {
        console.error('Push unsubscribe failed:', e)
      }
    }
  }, [])

  // 起動時に購読が有効ならサーバーに再登録
  useEffect(() => {
    if (enabled && permission === 'granted' && !notSupported) {
      navigator.serviceWorker?.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub.toJSON() }),
          }).catch(() => {})
        }
      })
    }
  }, [enabled, permission, notSupported])

  return { permission, enabled, notSupported, requestAndEnable, disable }
}

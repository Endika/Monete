import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function getOnlineStatus(): boolean {
  // Guard for jsdom / SSR environments where navigator may not exist
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function OfflineBanner() {
  const { t } = useTranslation()
  const [online, setOnline] = useState(getOnlineStatus)

  useEffect(() => {
    function handleOnline() {
      setOnline(true)
    }
    function handleOffline() {
      setOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      className="bg-banana/80 px-4 py-2 text-center text-sm font-bold font-display text-cocoa"
    >
      {t('pwa.offline')}
    </div>
  )
}

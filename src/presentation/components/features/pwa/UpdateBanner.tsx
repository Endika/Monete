import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/presentation/components/common/Button'

const UPDATE_CHECK_INTERVAL_MS = 60_000

/**
 * With registerType: 'autoUpdate' a new service worker activates silently and
 * is picked up on the next navigation. This banner handles the edge case where
 * the SW is waiting (e.g. the page stayed open across an update cycle) and
 * surfaces a reload prompt so the user can get the latest build immediately.
 */
export function UpdateBanner() {
  const { t } = useTranslation()
  const [needRefresh, setNeedRefresh] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh: () => setNeedRefresh(true),
    onRegisteredSW: (_swUrl, reg) => setRegistration(reg ?? null),
  })

  // Poll for a waiting SW while the tab stays open, so long-lived sessions
  // eventually prompt the user after a background update.
  useEffect(() => {
    if (!registration) return
    const id = setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [registration])

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      className="fixed left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-raspberry px-5 py-3 text-sm font-bold font-display text-cream shadow-lg shadow-raspberry/30"
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <span>{t('pwa.updateAvailable')}</span>
      <Button variant="ghost" onClick={() => updateServiceWorker(true)}>
        {t('pwa.updateNow')}
      </Button>
    </div>
  )
}

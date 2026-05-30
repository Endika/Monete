import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/presentation/components/common/Button'
import { useInstallPrompt } from '@/presentation/hooks/useInstallPrompt'

const DISMISS_KEY = 'monete.installDismissed'

export function InstallPrompt() {
  const { t } = useTranslation()
  const { canInstall, isIos, isStandalone, promptInstall } = useInstallPrompt()

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true'
    } catch {
      return false
    }
  })

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // ignore storage errors in restricted environments
    }
  }

  async function install() {
    await promptInstall()
    dismiss()
  }

  if (dismissed || isStandalone) return null

  // Android / desktop Chromium: native prompt available
  if (canInstall) {
    return (
      <div
        role="region"
        aria-label={t('pwa.installTitle')}
        className="flex items-center gap-3 bg-mint/90 px-4 py-2.5 text-sm text-cocoa"
      >
        <span className="flex-1 font-display font-bold">{t('pwa.installTitle')}</span>
        <Button variant="primary" onClick={() => void install()}>
          {t('pwa.installButton')}
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('pwa.installDismiss')}
          className="rounded-full px-2 py-1 text-cocoa/60 hover:bg-cocoa/10"
        >
          ✕
        </button>
      </div>
    )
  }

  // iOS: share-sheet instructions only (no programmatic install)
  if (isIos) {
    return (
      <div
        role="region"
        aria-label={t('pwa.installTitle')}
        className="flex items-start gap-3 bg-sky/80 px-4 py-2.5 text-xs text-cocoa"
      >
        <span className="flex-1 font-display font-medium">{t('pwa.installIosHint')}</span>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('pwa.installDismiss')}
          className="rounded-full px-2 py-1 text-cocoa/50 hover:bg-cocoa/10"
        >
          ✕
        </button>
      </div>
    )
  }

  return null
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/presentation/components/common/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'monete.installDismissed'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const standaloneViaMatchMedia =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  // iOS Safari
  const standaloneViaNavigator =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return standaloneViaMatchMedia || standaloneViaNavigator
}

function isIos(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function InstallPrompt() {
  const { t } = useTranslation()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true'
    } catch {
      return false
    }
  })
  // iOS: no beforeinstallprompt — show the hint if it's iOS Safari and not installed
  const [showIosHint] = useState(() => isIos() && !isStandalone())

  useEffect(() => {
    if (isStandalone()) return
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // ignore storage errors in restricted environments
    }
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (dismissed || isStandalone()) return null

  // Android / desktop Chromium: native prompt available
  if (deferred) {
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
  if (showIosHint) {
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

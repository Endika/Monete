import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/presentation/components/common/LanguageSwitcher'
import { useInstallPrompt } from '@/presentation/hooks/useInstallPrompt'

export function Footer() {
  const { t } = useTranslation()
  const { canInstall, isIos, isStandalone, promptInstall } = useInstallPrompt()
  const [showIosHint, setShowIosHint] = useState(false)

  const showInstall = !isStandalone && (canInstall || isIos)

  return (
    <footer className="mt-12 flex flex-col items-center gap-3 pb-6 text-xs text-cocoa/50">
      <LanguageSwitcher />
      {showInstall && (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={canInstall ? () => void promptInstall() : () => setShowIosHint((v) => !v)}
            className="font-display font-bold text-cocoa/40 underline-offset-2 hover:text-cocoa/60 hover:underline"
          >
            📲 {t('pwa.installApp')}
          </button>
          {showIosHint && (
            <p className="max-w-xs text-center text-cocoa/40">{t('pwa.installIosHint')}</p>
          )}
        </div>
      )}
      <div className="font-display font-bold tracking-wide text-cocoa/30">
        Monete <span className="font-body font-normal text-cocoa/20">v{__APP_VERSION__}</span>
      </div>
    </footer>
  )
}

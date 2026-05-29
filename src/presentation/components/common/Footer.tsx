import { useTranslation } from 'react-i18next'

const LANGUAGES: { code: string; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'gl', label: 'Galego', short: 'GL' },
  { code: 'eu', label: 'Euskara', short: 'EU' },
  { code: 'ca', label: 'Català', short: 'CA' },
  { code: 'va', label: 'Valencià', short: 'VA' },
]

export function Footer() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  function changeTo(code: string) {
    void i18n.changeLanguage(code)
  }

  return (
    <footer className="mt-12 flex flex-col items-center gap-3 pb-6 text-xs text-cocoa/50">
      <div className="flex flex-wrap justify-center gap-1" role="group" aria-label="Language">
        {LANGUAGES.map((lang) => {
          const active = current.startsWith(lang.code)
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeTo(lang.code)}
              className={`rounded-full px-3 py-1 text-xs font-bold font-display transition-all duration-150 ${
                active
                  ? 'bg-raspberry text-cream shadow-sm'
                  : 'text-cocoa/60 hover:bg-raspberry/10 hover:text-raspberry'
              }`}
              aria-pressed={active}
              title={lang.label}
            >
              {lang.short}
            </button>
          )
        })}
      </div>
      <div className="font-display font-bold tracking-wide text-cocoa/30">
        Monete <span className="font-body font-normal text-cocoa/20">v{__APP_VERSION__}</span>
      </div>
    </footer>
  )
}

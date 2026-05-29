import { useTranslation } from 'react-i18next'

const LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'gl', label: 'Galego' },
  { code: 'eu', label: 'Euskara' },
  { code: 'ca', label: 'Català' },
  { code: 'va', label: 'Valencià' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    void i18n.changeLanguage(e.target.value)
  }

  return (
    <select
      value={LANGUAGES.find((l) => current.startsWith(l.code))?.code ?? 'en'}
      onChange={handleChange}
      aria-label="Language"
      className="rounded-full border-2 border-cocoa/20 bg-cream px-3 py-1 text-xs font-bold font-display text-cocoa/70 focus:border-raspberry focus:outline-none"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}

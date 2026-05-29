import { LanguageSwitcher } from '@/presentation/components/common/LanguageSwitcher'

export function Footer() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-3 pb-6 text-xs text-cocoa/50">
      <LanguageSwitcher />
      <div className="font-display font-bold tracking-wide text-cocoa/30">
        Monete <span className="font-body font-normal text-cocoa/20">v{__APP_VERSION__}</span>
      </div>
    </footer>
  )
}

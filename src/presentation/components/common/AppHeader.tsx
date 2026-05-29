import { MonkeyMascot } from './MonkeyMascot'

interface AppHeaderProps {
  onHome?: () => void
}

export function AppHeader({ onHome }: AppHeaderProps) {
  return (
    <header className="max-w-lg mx-auto px-4 py-4">
      <button
        type="button"
        aria-label="Monete"
        onClick={onHome}
        className="flex flex-row items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
      >
        <MonkeyMascot className="w-8 h-8" />
        <span className="font-display text-xl font-extrabold text-cocoa">Monete</span>
      </button>
    </header>
  )
}

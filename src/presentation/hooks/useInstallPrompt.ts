import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ─── Module-level singleton ───────────────────────────────────────────────────

let deferred: BeforeInstallPromptEvent | null = null
const subscribers = new Set<() => void>()

function notify() {
  subscribers.forEach((cb) => cb())
}

function subscribe(cb: () => void): () => void {
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

function getSnapshot(): BeforeInstallPromptEvent | null {
  return deferred
}

// Capture the event once at module scope so it is never lost regardless of
// which component mounts first. Guarded for SSR / jsdom environments.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    notify()
  })
}

// ─── Environment helpers (all guarded for jsdom) ──────────────────────────────

function detectIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return true
  // iPadOS 13+ reports as MacIntel with touch support
  return (
    (navigator as unknown as { platform?: string }).platform === 'MacIntel' &&
    navigator.maxTouchPoints > 1
  )
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const viaMatchMedia =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  const viaNavigator = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return viaMatchMedia || viaNavigator
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInstallPrompt(): {
  canInstall: boolean
  isIos: boolean
  isStandalone: boolean
  promptInstall: () => Promise<void>
} {
  const deferredEvent = useSyncExternalStore(subscribe, getSnapshot, () => null)

  const canInstall = deferredEvent !== null
  const isIos = detectIos()
  const isStandalone = detectStandalone()

  async function promptInstall(): Promise<void> {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    await deferredEvent.userChoice
    deferred = null
    notify()
  }

  return { canInstall, isIos, isStandalone, promptInstall }
}

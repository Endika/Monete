import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

const KEY_PREFIX = 'monete:pin:'

// A private window, blocked storage, or a third-party iframe context can make every
// localStorage call throw. Without this, a PIN verified moments ago would never actually
// persist, and the very next read (PartyContext's refresh right after unlocking) would send
// null again and find the party still locked. Every read/write goes through this map too, so
// the PIN still works for the rest of this session even when storage never accepts it.
const memoryFallback = new Map<string, string>()

/** Read the PIN remembered for this party on this device, if any. */
// eslint-disable-next-line react-refresh/only-export-components
export function readStoredPin(partyId: string): string | null {
  try {
    const stored = window.localStorage.getItem(KEY_PREFIX + partyId)
    if (stored !== null) return stored
  } catch {
    // fall through to the in-memory fallback
  }
  return memoryFallback.get(partyId) ?? null
}

function writeStoredPin(partyId: string, pin: string | null): void {
  if (pin === null) memoryFallback.delete(partyId)
  else memoryFallback.set(partyId, pin)
  try {
    if (pin === null) window.localStorage.removeItem(KEY_PREFIX + partyId)
    else window.localStorage.setItem(KEY_PREFIX + partyId, pin)
  } catch {
    /* storage full / unavailable — the in-memory fallback above still works this session */
  }
}

/** Party deletion, or removing a party from recents, forgets its remembered PIN too. */
// eslint-disable-next-line react-refresh/only-export-components
export function clearStoredPin(partyId: string): void {
  writeStoredPin(partyId, null)
}

/**
 * Holds the edit PIN unlocked at the PinGate for the lifetime of the host/guest session,
 * so privileged actions can pass it to the server (which enforces it). null = no PIN
 * in play (PIN-less party, or not yet unlocked). Remembered per party in localStorage,
 * so a returning visitor with the right PIN is not asked again on this device.
 */
interface EditPinState {
  pin: string | null
  setPin: (pin: string | null) => void
}

const Ctx = createContext<EditPinState | null>(null)

export function EditPinProvider({ partyId, children }: { partyId: string; children: ReactNode }) {
  const [pin, setPinState] = useState<string | null>(() => readStoredPin(partyId))
  const setPin = useCallback(
    (next: string | null) => {
      setPinState(next)
      writeStoredPin(partyId, next)
    },
    [partyId],
  )
  return <Ctx.Provider value={{ pin, setPin }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditPin(): EditPinState {
  const s = useContext(Ctx)
  if (!s) throw new Error('useEditPin must be used within EditPinProvider')
  return s
}

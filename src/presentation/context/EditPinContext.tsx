import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

const KEY_PREFIX = 'monete:pin:'

/** Read the PIN remembered for this party on this device, if any. */
// eslint-disable-next-line react-refresh/only-export-components
export function readStoredPin(partyId: string): string | null {
  try {
    return window.localStorage.getItem(KEY_PREFIX + partyId)
  } catch {
    return null // private window / blocked storage: behave as if nothing was remembered
  }
}

function writeStoredPin(partyId: string, pin: string | null): void {
  try {
    if (pin === null) window.localStorage.removeItem(KEY_PREFIX + partyId)
    else window.localStorage.setItem(KEY_PREFIX + partyId, pin)
  } catch {
    /* storage full / unavailable — non-fatal, the in-memory value still works this session */
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

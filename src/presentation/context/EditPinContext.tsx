import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * Holds the edit PIN unlocked at the PinGate for the lifetime of the host session,
 * so privileged actions can pass it to the server (which enforces it). null = no PIN
 * in play (PIN-less party, or not yet unlocked).
 */
interface EditPinState {
  pin: string | null
  setPin: (pin: string | null) => void
}

const Ctx = createContext<EditPinState | null>(null)

export function EditPinProvider({ children }: { children: ReactNode }) {
  const [pin, setPin] = useState<string | null>(null)
  return <Ctx.Provider value={{ pin, setPin }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditPin(): EditPinState {
  const s = useContext(Ctx)
  if (!s) throw new Error('useEditPin must be used within EditPinProvider')
  return s
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PartySnapshot } from '@/domain/entities/Party'
import { useContainer } from '@/presentation/context/ContainerProvider'
import { RefreshPartyHandler } from '@/application/handlers/RefreshPartyHandler'

interface PartyState {
  snapshot: PartySnapshot | null
  version: number
  hasPin: boolean
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const Ctx = createContext<PartyState | null>(null)

export function PartyProvider({ partyId, children }: { partyId: string; children: ReactNode }) {
  const container = useContainer()
  const [snapshot, setSnapshot] = useState<PartySnapshot | null>(null)
  const [version, setVersion] = useState(0)
  const [hasPin, setHasPin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refreshRef = useRef<(() => Promise<void>) | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const handler = container.resolve<RefreshPartyHandler>('refreshParty')

    const doRefresh = async () => {
      try {
        const row = await handler.execute(partyId)
        if (cancelled) return
        setSnapshot(row?.snapshot ?? null)
        setVersion(row?.version ?? 0)
        setHasPin(row?.hasPin ?? false)
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    refreshRef.current = doRefresh
    void doRefresh()

    return () => {
      cancelled = true
    }
  }, [container, partyId])

  const refresh = useCallback(async () => {
    if (refreshRef.current) await refreshRef.current()
  }, [])

  return (
    <Ctx.Provider value={{ snapshot, version, hasPin, loading, error, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useParty(): PartyState {
  const s = useContext(Ctx)
  if (!s) throw new Error('useParty must be used within PartyProvider')
  return s
}

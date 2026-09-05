import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PartySnapshot } from '@/domain/entities/Party'
import { useContainer } from '@/presentation/context/ContainerProvider'
import { RefreshPartyHandler } from '@/application/handlers/RefreshPartyHandler'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'

/**
 * `deleted` and `unavailable` must never be confused: only a successful round trip can
 * report absence (`get_party` is a plain select, so "no row" arrives as HTTP 200 + null).
 * Anything that throws — paused project, no network, bad key — proves nothing about the
 * party. Even a confirmed `deleted` only offers to forget the party: the removal from this
 * device is the user's call, so a false positive can never wipe a list on its own.
 */
export type PartyStatus = 'loading' | 'ready' | 'deleted' | 'unavailable'

interface PartyState {
  snapshot: PartySnapshot | null
  version: number
  hasPin: boolean
  status: PartyStatus
  error: string | null
  refresh: () => Promise<void>
  /** Drop this party from this device's lists. User-driven only — never automatic. */
  forget: () => void
}

const Ctx = createContext<PartyState | null>(null)

export function PartyProvider({
  partyId,
  recents,
  children,
}: {
  partyId: string
  recents?: RecentsStore
  children: ReactNode
}) {
  const container = useContainer()
  const defaultRecents = useMemo(() => new RecentsStore(), [])
  const recentsStore = recents ?? defaultRecents
  const [snapshot, setSnapshot] = useState<PartySnapshot | null>(null)
  const [version, setVersion] = useState(0)
  const [hasPin, setHasPin] = useState(false)
  const [status, setStatus] = useState<PartyStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const refreshRef = useRef<(() => Promise<void>) | undefined>(undefined)
  const [loadedId, setLoadedId] = useState(partyId)

  // A new id starts from scratch, before anything renders: carrying the previous party's
  // status and hasPin over would mount the host dashboard unlocked around stale data
  // until the fetch lands.
  if (loadedId !== partyId) {
    setLoadedId(partyId)
    setStatus('loading')
    setSnapshot(null)
    setHasPin(false)
  }

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
        setStatus(row ? 'ready' : 'deleted')
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        // A failed refresh of a party already on screen must not blank it.
        setStatus((s) => (s === 'ready' ? 'ready' : 'unavailable'))
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

  // Only this id: a build pointed at the wrong project would report every party absent,
  // and a blanket purge would then empty the whole list behind the user's back.
  const forget = useCallback(() => {
    recentsStore.removeJoined(partyId)
    recentsStore.removeHosted(partyId)
  }, [recentsStore, partyId])

  return (
    <Ctx.Provider value={{ snapshot, version, hasPin, status, error, refresh, forget }}>
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

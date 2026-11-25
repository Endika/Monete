export interface HostedEntry {
  id: string
  title: string
  startsAt: string
  /** Set by blankLocked, cleared by refreshEntry. Absent (old entries) reads as unlocked. */
  locked?: boolean
}
export interface JoinedEntry {
  id: string
  title: string
  startsAt: string
  rsvpId?: string
  /** Set by blankLocked, cleared by refreshEntry. Absent (old entries) reads as unlocked. */
  locked?: boolean
}

const HOSTED_KEY = 'monete:hosted'
const JOINED_KEY = 'monete:joined'
const CAP = 50

export class RecentsStore {
  constructor(private readonly storage: Storage = window.localStorage) {}

  /**
   * Unreadable (parse error, or valid JSON that isn't an array) reads as empty, same as
   * missing — never throws, and never lets a caller mistake a non-array for a list to
   * iterate. Load-time callers (blankLocked, refreshEntry) rely on the resulting empty
   * list to find no matching id and skip their write, so an unreadable stored value is
   * never overwritten just because the app read it.
   */
  private read<T>(key: string): T[] {
    try {
      const raw = this.storage.getItem(key)
      const parsed: unknown = JSON.parse(String(raw))
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }

  private persist(key: string, list: { id: string }[]): void {
    try {
      this.storage.setItem(key, JSON.stringify(list))
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }

  private add<T extends { id: string }>(key: string, entry: T): void {
    const rest = this.read<T>(key).filter((e) => e.id !== entry.id)
    this.persist(key, [entry, ...rest].slice(0, CAP))
  }

  private patch<T extends { id: string }>(key: string, id: string, patch: Partial<T>): void {
    const list = this.read<T>(key)
    const index = list.findIndex((e) => e.id === id)
    if (index === -1) return
    list[index] = { ...list[index]!, ...patch }
    this.persist(key, list)
  }

  private remove(key: string, id: string): void {
    this.persist(
      key,
      this.read<{ id: string }>(key).filter((e) => e.id !== id),
    )
  }

  listHosted(): HostedEntry[] {
    return this.read<HostedEntry>(HOSTED_KEY)
  }
  listJoined(): JoinedEntry[] {
    return this.read<JoinedEntry>(JOINED_KEY)
  }
  addHosted(e: HostedEntry): void {
    this.add(HOSTED_KEY, e)
  }

  updateHosted(id: string, patch: Partial<Omit<HostedEntry, 'id'>>): void {
    this.patch<HostedEntry>(HOSTED_KEY, id, patch)
  }

  addJoined(e: JoinedEntry): void {
    this.add(JOINED_KEY, e)
  }

  updateJoined(id: string, patch: Partial<Omit<JoinedEntry, 'id'>>): void {
    this.patch<JoinedEntry>(JOINED_KEY, id, patch)
  }

  getJoined(partyId: string): JoinedEntry | undefined {
    return this.listJoined().find((e) => e.id === partyId)
  }
  /**
   * A locked read must not go on showing a cached party's real title/date — blank both
   * fields (in whichever list has the entry) but keep the entry, its link and rsvpId, so
   * the family can still reopen it and enter the PIN. `locked: true` is what the UI (and
   * refreshEntry below) key off of, since a blank title/date can't be told apart from an
   * entry that was simply never given one.
   */
  blankLocked(id: string): void {
    this.updateHosted(id, { title: '', startsAt: '', locked: true })
    this.updateJoined(id, { title: '', startsAt: '', locked: true })
  }
  /** An unlocked read repopulates whichever list has the entry and clears `locked`. */
  refreshEntry(id: string, patch: { title: string; startsAt: string }): void {
    this.updateHosted(id, { ...patch, locked: false })
    this.updateJoined(id, { ...patch, locked: false })
  }
  removeJoined(partyId: string): void {
    this.remove(JOINED_KEY, partyId)
  }

  removeHosted(partyId: string): void {
    this.remove(HOSTED_KEY, partyId)
  }
}

export interface HostedEntry {
  id: string
  title: string
  startsAt: string
}
export interface JoinedEntry {
  id: string
  title: string
  startsAt: string
  rsvpId?: string
}

const HOSTED_KEY = 'monete:hosted'
const JOINED_KEY = 'monete:joined'
const CAP = 50

export class RecentsStore {
  constructor(private readonly storage: Storage = window.localStorage) {}

  private read<T>(key: string): T[] {
    try {
      const raw = this.storage.getItem(key)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  private write<T extends { id: string }>(key: string, entry: T): void {
    const rest = this.read<T>(key).filter((e) => e.id !== entry.id)
    const next = [entry, ...rest].slice(0, CAP)
    try {
      this.storage.setItem(key, JSON.stringify(next))
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }

  listHosted(): HostedEntry[] {
    return this.read<HostedEntry>(HOSTED_KEY)
  }
  listJoined(): JoinedEntry[] {
    return this.read<JoinedEntry>(JOINED_KEY)
  }
  addHosted(e: HostedEntry): void {
    this.write(HOSTED_KEY, e)
  }
  updateHosted(id: string, patch: Partial<Omit<HostedEntry, 'id'>>): void {
    const list = this.read<HostedEntry>(HOSTED_KEY)
    const index = list.findIndex((e) => e.id === id)
    if (index === -1) return
    list[index] = { ...list[index]!, ...patch }
    try {
      this.storage.setItem(HOSTED_KEY, JSON.stringify(list))
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }
  addJoined(e: JoinedEntry): void {
    this.write(JOINED_KEY, e)
  }
  updateJoined(id: string, patch: Partial<Omit<JoinedEntry, 'id'>>): void {
    const list = this.read<JoinedEntry>(JOINED_KEY)
    const index = list.findIndex((e) => e.id === id)
    if (index === -1) return
    list[index] = { ...list[index]!, ...patch }
    try {
      this.storage.setItem(JOINED_KEY, JSON.stringify(list))
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }
  getJoined(partyId: string): JoinedEntry | undefined {
    return this.listJoined().find((e) => e.id === partyId)
  }
  /**
   * A locked read must not go on showing a cached party's real title/date — blank both
   * fields (in whichever list has the entry) but keep the entry, its link and rsvpId, so
   * the family can still reopen it and enter the PIN. A successful unlock's normal save/
   * claim flow repopulates them.
   */
  blankLocked(id: string): void {
    this.updateHosted(id, { title: '', startsAt: '' })
    this.updateJoined(id, { title: '', startsAt: '' })
  }
  removeJoined(partyId: string): void {
    const filtered = this.read<JoinedEntry>(JOINED_KEY).filter((e) => e.id !== partyId)
    try {
      this.storage.setItem(JOINED_KEY, JSON.stringify(filtered))
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }
  removeHosted(partyId: string): void {
    const filtered = this.read<HostedEntry>(HOSTED_KEY).filter((e) => e.id !== partyId)
    try {
      this.storage.setItem(HOSTED_KEY, JSON.stringify(filtered))
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }
}

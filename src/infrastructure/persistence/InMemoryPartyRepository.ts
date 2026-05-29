import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'
import {
  type IPartyRepository,
  type SaveResult,
  VersionConflictError,
} from '@/domain/repositories/IPartyRepository'

interface Row {
  snapshot: PartySnapshot
  version: number
}

export class InMemoryPartyRepository implements IPartyRepository {
  private rows = new Map<string, Row>()
  findByIdCalls = 0

  async findById(id: string): Promise<Row | null> {
    this.findByIdCalls++
    const row = this.rows.get(id)
    return row ? { snapshot: structuredClone(row.snapshot), version: row.version } : null
  }

  async getVersion(id: string): Promise<number | null> {
    return this.rows.get(id)?.version ?? null
  }

  async create(snapshot: PartySnapshot): Promise<SaveResult> {
    if (this.rows.has(snapshot.id)) throw new Error('Party already exists')
    const row: Row = { snapshot: structuredClone(snapshot), version: 1 }
    this.rows.set(snapshot.id, row)
    return { snapshot: structuredClone(row.snapshot), version: row.version }
  }

  async update(id: string, snapshot: PartySnapshot, expectedVersion: number): Promise<SaveResult> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    if (row.version !== expectedVersion) throw new VersionConflictError(row.version)
    row.snapshot = structuredClone(snapshot)
    row.version += 1
    return { snapshot: structuredClone(row.snapshot), version: row.version }
  }

  async appendRsvp(id: string, rsvp: Rsvp): Promise<void> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    // Mirrors the atomic SQL append: only touches the rsvps array, never the rest.
    row.snapshot = { ...row.snapshot, rsvps: [...row.snapshot.rsvps, structuredClone(rsvp)] }
  }

  async updateRsvp(id: string, rsvpId: string, rsvp: Rsvp): Promise<void> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    row.snapshot = {
      ...row.snapshot,
      rsvps: row.snapshot.rsvps.map((r) => (r.id === rsvpId ? structuredClone(rsvp) : r)),
    }
  }

  async removeRsvp(id: string, rsvpId: string): Promise<void> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    row.snapshot = { ...row.snapshot, rsvps: row.snapshot.rsvps.filter((r) => r.id !== rsvpId) }
  }
}

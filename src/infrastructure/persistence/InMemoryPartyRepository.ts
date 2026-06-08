import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'
import {
  type IPartyRepository,
  type ReadResult,
  type SaveResult,
  VersionConflictError,
  WrongPinError,
  PayloadTooLargeError,
  RateLimitedError,
} from '@/domain/repositories/IPartyRepository'

// Mirror of the SQL caps in 0004_harden_access.sql — keep in sync.
const MAX_PARTY_BYTES = 262144
const MAX_RSVP_BYTES = 8192
const MAX_RSVPS = 300
// Mirror of the PIN throttle in 0005_pin_rate_limit.sql (count-based; the SQL adds a
// 15-minute sliding window the fake doesn't model — the observable contract is the cap).
const PIN_ATTEMPT_LIMIT = 10

interface Row {
  snapshot: PartySnapshot
  version: number
  pin: string | null
}

function byteLen(value: unknown): number {
  return JSON.stringify(value).length
}

/**
 * In-memory fake mirroring the server-side RPC semantics (PIN enforcement + caps)
 * so application-layer integration tests exercise real behavior, not a passthrough.
 */
export class InMemoryPartyRepository implements IPartyRepository {
  private rows = new Map<string, Row>()
  private pinFails = new Map<string, number>()
  findByIdCalls = 0

  /** Throttle gate: raise once the failed-attempt cap is hit (mirrors monete_pin_guard). */
  private pinGuard(id: string): void {
    if ((this.pinFails.get(id) ?? 0) >= PIN_ATTEMPT_LIMIT) throw new RateLimitedError()
  }

  /** Verify the supplied pin against a PIN-protected row, recording the attempt. */
  private checkPin(row: Row, id: string, pin: string | null): void {
    if (row.pin === null) return
    this.pinGuard(id)
    if (pin !== row.pin) {
      this.pinFails.set(id, (this.pinFails.get(id) ?? 0) + 1)
      throw new WrongPinError()
    }
    this.pinFails.delete(id)
  }

  async findById(id: string): Promise<ReadResult | null> {
    this.findByIdCalls++
    const row = this.rows.get(id)
    return row
      ? { snapshot: structuredClone(row.snapshot), version: row.version, hasPin: row.pin !== null }
      : null
  }

  async getVersion(id: string): Promise<number | null> {
    return this.rows.get(id)?.version ?? null
  }

  async create(snapshot: PartySnapshot): Promise<SaveResult> {
    if (this.rows.has(snapshot.id)) throw new Error('Party already exists')
    if (byteLen(snapshot) > MAX_PARTY_BYTES) throw new PayloadTooLargeError()
    const row: Row = { snapshot: structuredClone(snapshot), version: 1, pin: null }
    this.rows.set(snapshot.id, row)
    return { snapshot: structuredClone(row.snapshot), version: row.version }
  }

  async update(
    id: string,
    snapshot: PartySnapshot,
    expectedVersion: number,
    pin: string | null,
  ): Promise<SaveResult> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    this.checkPin(row, id, pin)
    if (row.version !== expectedVersion) throw new VersionConflictError(row.version)
    if (byteLen(snapshot) > MAX_PARTY_BYTES) throw new PayloadTooLargeError()
    row.snapshot = structuredClone(snapshot)
    row.version += 1
    return { snapshot: structuredClone(row.snapshot), version: row.version }
  }

  async setPin(id: string, newPin: string | null, currentPin: string | null): Promise<void> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    this.checkPin(row, id, currentPin)
    if (newPin !== null && !/^\d{4,6}$/.test(newPin)) throw new Error('Invalid PIN format')
    row.pin = newPin
    row.version += 1
  }

  async verifyPin(id: string, pin: string): Promise<boolean> {
    const row = this.rows.get(id)
    if (!row) return false
    if (row.pin === null) return true
    this.pinGuard(id)
    if (row.pin === pin) {
      this.pinFails.delete(id)
      return true
    }
    this.pinFails.set(id, (this.pinFails.get(id) ?? 0) + 1)
    return false
  }

  async appendRsvp(id: string, rsvp: Rsvp): Promise<void> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    if (byteLen(rsvp) > MAX_RSVP_BYTES) throw new PayloadTooLargeError()
    if (row.snapshot.rsvps.length >= MAX_RSVPS) throw new PayloadTooLargeError()
    const next = { ...row.snapshot, rsvps: [...row.snapshot.rsvps, structuredClone(rsvp)] }
    if (byteLen(next) > MAX_PARTY_BYTES) throw new PayloadTooLargeError()
    // Mirrors the atomic SQL append: only touches the rsvps array, never the rest.
    row.snapshot = next
  }

  async updateRsvp(id: string, rsvpId: string, rsvp: Rsvp): Promise<void> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    if (byteLen(rsvp) > MAX_RSVP_BYTES) throw new PayloadTooLargeError()
    const next = {
      ...row.snapshot,
      rsvps: row.snapshot.rsvps.map((r) => (r.id === rsvpId ? structuredClone(rsvp) : r)),
    }
    if (byteLen(next) > MAX_PARTY_BYTES) throw new PayloadTooLargeError()
    row.snapshot = next
  }

  async removeRsvp(id: string, rsvpId: string): Promise<void> {
    const row = this.rows.get(id)
    if (!row) throw new Error('Party not found')
    row.snapshot = { ...row.snapshot, rsvps: row.snapshot.rsvps.filter((r) => r.id !== rsvpId) }
  }
}

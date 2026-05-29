import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'

export interface SaveResult {
  snapshot: PartySnapshot
  version: number
}

export class VersionConflictError extends Error {
  constructor(readonly currentVersion: number) {
    super(`Version conflict: server is at ${currentVersion}`)
  }
}

export class StaleClientError extends Error {
  readonly code = 'STALE_CLIENT'
  constructor() {
    super('Client schema is older than the stored party; an update is required')
    this.name = 'StaleClientError'
  }
}

export interface IPartyRepository {
  findById(id: string): Promise<{ snapshot: PartySnapshot; version: number } | null>
  getVersion(id: string): Promise<number | null>
  create(snapshot: PartySnapshot): Promise<SaveResult>
  /** Host config edits — optimistic concurrency. Throws VersionConflictError / StaleClientError. */
  update(id: string, snapshot: PartySnapshot, expectedVersion: number): Promise<SaveResult>
  /** Guest RSVP submit — atomic append, never clobbers config or other rsvps. */
  appendRsvp(id: string, rsvp: Rsvp): Promise<void>
  /** Atomic replace of one rsvp by id (guest/host edit). */
  updateRsvp(id: string, rsvpId: string, rsvp: Rsvp): Promise<void>
  /** Atomic remove of one rsvp by id. */
  removeRsvp(id: string, rsvpId: string): Promise<void>
}

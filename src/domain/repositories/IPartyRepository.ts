import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'

export interface SaveResult {
  snapshot: PartySnapshot
  version: number
}

/** Read result. `hasPin` replaces the old shipped PIN hash — the hash never leaves the server. */
export interface ReadResult {
  snapshot: PartySnapshot
  version: number
  hasPin: boolean
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

/** Server rejected a privileged write because the supplied edit PIN was wrong or missing. */
export class WrongPinError extends Error {
  readonly code = 'WRONG_PIN'
  constructor() {
    super('Wrong or missing edit PIN')
    this.name = 'WrongPinError'
  }
}

/** Server rejected a write because it would exceed the RSVP / blob size caps. */
export class PayloadTooLargeError extends Error {
  readonly code = 'PAYLOAD_TOO_LARGE'
  constructor() {
    super('Payload exceeds the allowed size or count limit')
    this.name = 'PayloadTooLargeError'
  }
}

/** Server rejected a PIN attempt because too many failures happened in the window. */
export class RateLimitedError extends Error {
  readonly code = 'RATE_LIMITED'
  constructor() {
    super('Too many PIN attempts; try again later')
    this.name = 'RateLimitedError'
  }
}

export interface IPartyRepository {
  findById(id: string): Promise<ReadResult | null>
  getVersion(id: string): Promise<number | null>
  create(snapshot: PartySnapshot): Promise<SaveResult>
  /**
   * Host config edits — optimistic concurrency, PIN-gated server-side.
   * `pin` is the unlocked edit PIN (null for a PIN-less party).
   * Throws VersionConflictError / StaleClientError / WrongPinError / PayloadTooLargeError.
   */
  update(
    id: string,
    snapshot: PartySnapshot,
    expectedVersion: number,
    pin: string | null,
  ): Promise<SaveResult>
  /** Set / change / remove the edit PIN. Changing or removing requires `currentPin`. */
  setPin(id: string, newPin: string | null, currentPin: string | null): Promise<void>
  /** UX unlock check: true when there is no PIN or `pin` matches. */
  verifyPin(id: string, pin: string): Promise<boolean>
  /** Guest RSVP submit — atomic append, never clobbers config or other rsvps. Bounded. */
  appendRsvp(id: string, rsvp: Rsvp): Promise<void>
  /** Atomic replace of one rsvp by id (guest/host edit). Bounded. */
  updateRsvp(id: string, rsvpId: string, rsvp: Rsvp): Promise<void>
  /** Atomic remove of one rsvp by id. */
  removeRsvp(id: string, rsvpId: string): Promise<void>
}

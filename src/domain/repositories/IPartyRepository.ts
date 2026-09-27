import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'

export interface SaveResult {
  snapshot: PartySnapshot
  version: number
}

/** Read result. `hasPin` replaces the old shipped PIN hash — the hash never leaves the server. */
export interface UnlockedRead {
  locked: false
  snapshot: PartySnapshot
  version: number
  hasPin: boolean
}

/** A PIN-protected party read without (or with a wrong) PIN: no data, no version, no fail counted. */
export interface LockedRead {
  locked: true
  hasPin: true
}

export type ReadResult = UnlockedRead | LockedRead

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
  /**
   * `pin` is forwarded to the server-side gate: no active row -> null; no PIN -> the full
   * object; PIN set and no/wrong pin -> a {@link LockedRead} (no fail counted for a missing
   * pin); PIN set and the right pin -> the full object with `hasPin: true`.
   */
  findById(id: string, pin?: string | null): Promise<ReadResult | null>
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
  /** Erasure: hard-delete the party (PIN-gated server-side when a PIN is set). */
  deleteParty(id: string, pin: string | null): Promise<void>
  /** Guest RSVP submit — atomic append, never clobbers config or other rsvps. Bounded. */
  appendRsvp(id: string, rsvp: Rsvp, pin: string | null): Promise<void>
  /** Atomic replace of one rsvp by id (guest/host edit). Bounded. */
  updateRsvp(id: string, rsvpId: string, rsvp: Rsvp, pin: string | null): Promise<void>
  /** Atomic remove of one rsvp by id. */
  removeRsvp(id: string, rsvpId: string, pin: string | null): Promise<void>
}

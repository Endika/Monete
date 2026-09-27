import type { MoneteClient } from '@/infrastructure/sync/SupabaseClient'
import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'
import {
  type IPartyRepository,
  type ReadResult,
  type SaveResult,
  VersionConflictError,
  StaleClientError,
  WrongPinError,
  PayloadTooLargeError,
  RateLimitedError,
} from '@/domain/repositories/IPartyRepository'
import { parsePartySnapshot } from '@/infrastructure/persistence/PartySnapshotSchema'
import { SCHEMA_VERSION } from '@/infrastructure/persistence/schemaVersion'

/** Map a PostgREST error (PTxyz SQLSTATE) raised by the RPCs to a domain error. */
function mapRpcError(error: { code?: string } | null): Error | null {
  if (!error) return null
  switch (error.code) {
    case 'PT401':
      return new WrongPinError()
    case 'PT413':
      return new PayloadTooLargeError()
    case 'PT429':
      return new RateLimitedError()
    case 'PT426':
      return new StaleClientError()
    default:
      return error as unknown as Error
  }
}

interface GetPartyPayload {
  locked?: boolean
  data?: unknown
  version?: number
  hasPin: boolean
}

export class SupabasePartyRepository implements IPartyRepository {
  constructor(private readonly client: MoneteClient) {}

  async findById(id: string, pin: string | null = null): Promise<ReadResult | null> {
    const { data, error } = await this.client.rpc('get_party', { p_id: id, p_pin: pin })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    if (!data) return null
    const payload = data as GetPartyPayload
    if (payload.locked) return { locked: true, hasPin: true }
    return {
      locked: false,
      snapshot: parsePartySnapshot(payload.data),
      version: payload.version as number,
      hasPin: payload.hasPin,
    }
  }

  async getVersion(id: string): Promise<number | null> {
    const { data, error } = await this.client.rpc('get_party_version', { p_id: id })
    if (error) throw error
    return (data as number | null) ?? null
  }

  async create(snapshot: PartySnapshot): Promise<SaveResult> {
    const { data, error } = await this.client.rpc('create_party', {
      p_id: snapshot.id,
      p_data: { ...snapshot, _schemaVersion: SCHEMA_VERSION },
      p_pin_hash: null,
    })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    return { snapshot, version: (data as number) ?? 1 }
  }

  async update(
    id: string,
    snapshot: PartySnapshot,
    expectedVersion: number,
    pin: string | null,
  ): Promise<SaveResult> {
    const { data, error } = await this.client.rpc('update_party', {
      p_id: id,
      p_data: { ...snapshot, _schemaVersion: SCHEMA_VERSION },
      p_expected_version: expectedVersion,
      p_pin: pin,
    })
    if (error) {
      if ((error as { code?: string }).code === 'PT409') {
        const version = await this.getVersion(id)
        throw new VersionConflictError(version ?? -1)
      }
      const mapped = mapRpcError(error)
      if (mapped) throw mapped
    }
    // 0 is never a real version (they start at 1): a wrong-PIN sentinel that never raises,
    // so the recorded fail can't be rolled back with it (see monete_pin_fails_stick).
    if (data === 0) throw new WrongPinError()
    return { snapshot, version: (data as number) ?? expectedVersion + 1 }
  }

  async setPin(id: string, newPin: string | null, currentPin: string | null): Promise<void> {
    const { data, error } = await this.client.rpc('set_party_pin', {
      p_id: id,
      p_new_pin: newPin,
      p_current_pin: currentPin,
    })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    if (data === false) throw new WrongPinError()
  }

  async verifyPin(id: string, pin: string): Promise<boolean> {
    const { data, error } = await this.client.rpc('verify_party_pin', { p_id: id, p_pin: pin })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    return data === true
  }

  async deleteParty(id: string, pin: string | null): Promise<void> {
    const { data, error } = await this.client.rpc('delete_party', { p_id: id, p_pin: pin })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    if (data === false) throw new WrongPinError()
  }

  async appendRsvp(id: string, rsvp: Rsvp, pin: string | null): Promise<void> {
    const { data, error } = await this.client.rpc('append_rsvp', {
      p_id: id,
      p_rsvp: rsvp,
      p_pin: pin,
    })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    if (data === false) throw new WrongPinError()
  }

  async updateRsvp(id: string, rsvpId: string, rsvp: Rsvp, pin: string | null): Promise<void> {
    const { data, error } = await this.client.rpc('update_rsvp', {
      p_id: id,
      p_rsvp_id: rsvpId,
      p_rsvp: rsvp,
      p_pin: pin,
    })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    if (data === false) throw new WrongPinError()
  }

  async removeRsvp(id: string, rsvpId: string, pin: string | null): Promise<void> {
    const { data, error } = await this.client.rpc('remove_rsvp', {
      p_id: id,
      p_rsvp_id: rsvpId,
      p_pin: pin,
    })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
    if (data === false) throw new WrongPinError()
  }
}

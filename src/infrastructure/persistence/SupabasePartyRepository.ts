import type { SupabaseClient } from '@supabase/supabase-js'
import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'
import {
  type IPartyRepository,
  type ReadResult,
  type SaveResult,
  VersionConflictError,
  StaleClientError,
  WrongPinError,
  PayloadTooLargeError,
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
    case 'PT426':
      return new StaleClientError()
    default:
      return error as unknown as Error
  }
}

interface GetPartyPayload {
  data: unknown
  version: number
  hasPin: boolean
}

export class SupabasePartyRepository implements IPartyRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<ReadResult | null> {
    const { data, error } = await this.client.rpc('get_party', { p_id: id })
    if (error) throw error
    if (!data) return null
    const payload = data as GetPartyPayload
    return {
      snapshot: parsePartySnapshot(payload.data),
      version: payload.version,
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
    return { snapshot, version: (data as number) ?? expectedVersion + 1 }
  }

  async setPin(id: string, newPin: string | null, currentPin: string | null): Promise<void> {
    const { error } = await this.client.rpc('set_party_pin', {
      p_id: id,
      p_new_pin: newPin,
      p_current_pin: currentPin,
    })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
  }

  async verifyPin(id: string, pin: string): Promise<boolean> {
    const { data, error } = await this.client.rpc('verify_party_pin', { p_id: id, p_pin: pin })
    if (error) throw error
    return data === true
  }

  async appendRsvp(id: string, rsvp: Rsvp): Promise<void> {
    const { error } = await this.client.rpc('append_rsvp', { p_id: id, p_rsvp: rsvp })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
  }

  async updateRsvp(id: string, rsvpId: string, rsvp: Rsvp): Promise<void> {
    const { error } = await this.client.rpc('update_rsvp', {
      p_id: id,
      p_rsvp_id: rsvpId,
      p_rsvp: rsvp,
    })
    const mapped = mapRpcError(error)
    if (mapped) throw mapped
  }

  async removeRsvp(id: string, rsvpId: string): Promise<void> {
    const { error } = await this.client.rpc('remove_rsvp', { p_id: id, p_rsvp_id: rsvpId })
    if (error) throw error
  }
}

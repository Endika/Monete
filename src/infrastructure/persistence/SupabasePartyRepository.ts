import type { SupabaseClient } from '@supabase/supabase-js'
import type { PartySnapshot, Rsvp } from '@/domain/entities/Party'
import {
  type IPartyRepository,
  type SaveResult,
  VersionConflictError,
  StaleClientError,
} from '@/domain/repositories/IPartyRepository'
import { parsePartySnapshot } from '@/infrastructure/persistence/PartySnapshotSchema'
import { SCHEMA_VERSION } from '@/infrastructure/persistence/schemaVersion'

export class SupabasePartyRepository implements IPartyRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<{ snapshot: PartySnapshot; version: number } | null> {
    const { data, error } = await this.client
      .from('parties')
      .select('data, version, active')
      .eq('id', id)
      .maybeSingle<{ data: unknown; version: number; active: boolean }>()
    if (error) throw error
    if (!data || !data.active) return null
    return { snapshot: parsePartySnapshot(data.data), version: data.version }
  }

  async getVersion(id: string): Promise<number | null> {
    const { data, error } = await this.client
      .from('parties')
      .select('version, active')
      .eq('id', id)
      .maybeSingle<{ version: number; active: boolean }>()
    if (error) throw error
    if (!data || !data.active) return null
    return data.version
  }

  async create(snapshot: PartySnapshot): Promise<SaveResult> {
    const row = {
      id: snapshot.id,
      version: 1,
      schema_version: SCHEMA_VERSION,
      pin_hash: snapshot.editPin,
      data: { ...snapshot, _schemaVersion: SCHEMA_VERSION },
    }
    const { data, error } = await this.client
      .from('parties')
      .insert(row)
      .select('version')
      .single<{ version: number }>()
    if (error) throw error
    return { snapshot, version: data.version }
  }

  async update(id: string, snapshot: PartySnapshot, expectedVersion: number): Promise<SaveResult> {
    const { data, error } = await this.client
      .from('parties')
      .update({
        data: { ...snapshot, _schemaVersion: SCHEMA_VERSION },
        pin_hash: snapshot.editPin,
        schema_version: SCHEMA_VERSION,
        version: expectedVersion + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('version', expectedVersion)
      .select('version')
      .maybeSingle<{ version: number }>()
    if (error) {
      if ((error as { code?: string }).code === 'PT426') throw new StaleClientError()
      throw error
    }
    if (!data) {
      const version = await this.getVersion(id)
      throw new VersionConflictError(version ?? -1)
    }
    return { snapshot, version: data.version }
  }

  async appendRsvp(id: string, rsvp: Rsvp): Promise<void> {
    const { error } = await this.client.rpc('append_rsvp', { p_id: id, p_rsvp: rsvp })
    if (error) throw error
  }

  async updateRsvp(id: string, rsvpId: string, rsvp: Rsvp): Promise<void> {
    const { error } = await this.client.rpc('update_rsvp', {
      p_id: id,
      p_rsvp_id: rsvpId,
      p_rsvp: rsvp,
    })
    if (error) throw error
  }

  async removeRsvp(id: string, rsvpId: string): Promise<void> {
    const { error } = await this.client.rpc('remove_rsvp', { p_id: id, p_rsvp_id: rsvpId })
    if (error) throw error
  }
}

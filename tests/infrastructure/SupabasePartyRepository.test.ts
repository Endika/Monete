import { describe, it, expect } from 'vitest'
import { SupabasePartyRepository } from '@/infrastructure/persistence/SupabasePartyRepository'
import {
  VersionConflictError,
  StaleClientError,
  WrongPinError,
  PayloadTooLargeError,
} from '@/domain/repositories/IPartyRepository'
import { Party } from '@/domain/entities/Party'
import { unlocked } from '../helpers/partyRead'

type RpcResult = { data: unknown; error: unknown }

// Fake supabase-js client that routes rpc() calls by function name.
function fakeClient(byFn: Record<string, RpcResult>) {
  return {
    rpc: async (fn: string) => byFn[fn] ?? { data: null, error: null },
  } as never
}

const snap = () =>
  Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  }).toSnapshot()

describe('SupabasePartyRepository', () => {
  it('maps a version-conflict (PT409) to VersionConflictError carrying the server version', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({
        update_party: { data: null, error: { code: 'PT409' } },
        get_party_version: { data: 7, error: null },
      }),
    )
    await expect(repo.update(snap().id, snap(), 1, null)).rejects.toBeInstanceOf(
      VersionConflictError,
    )
  })

  it('maps PT426 to StaleClientError', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({ update_party: { data: null, error: { code: 'PT426' } } }),
    )
    await expect(repo.update(snap().id, snap(), 1, null)).rejects.toBeInstanceOf(StaleClientError)
  })

  it('maps PT401 to WrongPinError', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({ update_party: { data: null, error: { code: 'PT401' } } }),
    )
    await expect(repo.update(snap().id, snap(), 1, '0000')).rejects.toBeInstanceOf(WrongPinError)
  })

  it('maps PT413 to PayloadTooLargeError on append', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({ append_rsvp: { data: null, error: { code: 'PT413' } } }),
    )
    await expect(
      repo.appendRsvp('abc1234', { id: 'r', parentsLabel: 'P' } as never, null),
    ).rejects.toBeInstanceOf(PayloadTooLargeError)
  })

  it('get_party returns null when the party does not exist', async () => {
    const repo = new SupabasePartyRepository(fakeClient({ get_party: { data: null, error: null } }))
    expect(await repo.findById('missing')).toBeNull()
  })

  it('get_party maps the payload to a read result with hasPin', async () => {
    const s = snap()
    const repo = new SupabasePartyRepository(
      fakeClient({
        get_party: { data: { data: s, version: 3, hasPin: true }, error: null },
      }),
    )
    const row = unlocked(await repo.findById(s.id))
    expect(row.version).toBe(3)
    expect(row.hasPin).toBe(true)
    expect(row.snapshot.id).toBe(s.id)
  })

  it('get_party returns a locked marker with no data when the party is PIN-locked', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({
        get_party: { data: { locked: true, hasPin: true }, error: null },
      }),
    )
    expect(await repo.findById('abc1234', 'wrong')).toEqual({ locked: true, hasPin: true })
  })

  it('always sends p_pin, even when no pin is supplied, so PostgREST resolves the gated overload', async () => {
    const calls: unknown[] = []
    const repo = new SupabasePartyRepository({
      rpc: async (_fn: string, args: unknown) => {
        calls.push(args)
        return { data: null, error: null }
      },
    } as never)
    await repo.findById('abc1234')
    expect(calls[0]).toEqual({ p_id: 'abc1234', p_pin: null })
  })
})

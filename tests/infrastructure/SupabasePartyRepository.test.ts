import { describe, it, expect } from 'vitest'
import { SupabasePartyRepository } from '@/infrastructure/persistence/SupabasePartyRepository'
import {
  StaleClientError,
  WrongPinError,
  PayloadTooLargeError,
  RateLimitedError,
} from '@/domain/repositories/IPartyRepository'
import { SCHEMA_VERSION } from '@/infrastructure/persistence/schemaVersion'
import { Party, type Rsvp } from '@/domain/entities/Party'
import { unlocked } from '../helpers/partyRead'

type RpcResult = { data: unknown; error: unknown }

// Fake supabase-js client that routes rpc() calls by function name.
function fakeClient(byFn: Record<string, RpcResult>, calls: [string, unknown][] = []) {
  return {
    rpc: async (fn: string, args: unknown) => {
      calls.push([fn, args])
      return byFn[fn] ?? { data: null, error: null }
    },
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
  it.each([
    [7, 7],
    [null, -1],
  ])(
    'maps PT409 to VersionConflictError carrying the server version (%s -> %s)',
    async (server, carried) => {
      const repo = new SupabasePartyRepository(
        fakeClient({
          update_party: { data: null, error: { code: 'PT409' } },
          get_party_version: { data: server, error: null },
        }),
      )
      await expect(repo.update(snap().id, snap(), 1, null)).rejects.toMatchObject({
        currentVersion: carried,
      })
    },
  )

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

  it('maps a wrong-pin sentinel (0) from update_party to WrongPinError without raising', async () => {
    const repo = new SupabasePartyRepository(fakeClient({ update_party: { data: 0, error: null } }))
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

  it('always sends p_pin (also when null), and maps a locked payload and a PT429 error', async () => {
    // A stub that errors if get_party is ever called without a p_pin key at all — the
    // behavioural proof that findById includes it (even as null) is that this never fires.
    const strictClient = {
      rpc: async (fn: string, args: Record<string, unknown>) => {
        if (fn === 'get_party' && !('p_pin' in args)) {
          throw new Error('get_party called without p_pin: PostgREST could pick either overload')
        }
        if (args.p_pin === 'throttled') return { data: null, error: { code: 'PT429' } }
        return { data: { locked: true, hasPin: true }, error: null }
      },
    } as never
    const repo = new SupabasePartyRepository(strictClient)

    expect(await repo.findById('abc1234')).toEqual({ locked: true, hasPin: true })
    await expect(repo.findById('abc1234', 'throttled')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('rethrows an unmapped rpc error untouched', async () => {
    const error = { code: 'XX000', message: 'boom' }
    const repo = new SupabasePartyRepository(
      fakeClient({
        get_party_version: { data: null, error },
        create_party: { data: null, error },
        update_party: { data: null, error },
      }),
    )
    await expect(repo.getVersion('abc1234')).rejects.toBe(error)
    await expect(repo.create(snap())).rejects.toBe(error)
    await expect(repo.update('abc1234', snap(), 1, null)).rejects.toBe(error)
  })

  it('reads the version, null when the party is missing', async () => {
    const calls: [string, unknown][] = []
    const repo = new SupabasePartyRepository(
      fakeClient({ get_party_version: { data: 7, error: null } }, calls),
    )
    expect(await repo.getVersion('abc1234')).toBe(7)
    expect(calls).toEqual([['get_party_version', { p_id: 'abc1234' }]])
    expect(await new SupabasePartyRepository(fakeClient({})).getVersion('abc1234')).toBeNull()
  })

  it.each([
    [5, 5],
    [null, 1],
  ])(
    'create sends the stamped blob without a PIN hash and returns version %s -> %s',
    async (data, version) => {
      const calls: [string, unknown][] = []
      const s = snap()
      const repo = new SupabasePartyRepository(
        fakeClient({ create_party: { data, error: null } }, calls),
      )
      expect(await repo.create(s)).toEqual({ snapshot: s, version })
      expect(calls).toEqual([
        [
          'create_party',
          { p_id: s.id, p_data: { ...s, _schemaVersion: SCHEMA_VERSION }, p_pin_hash: null },
        ],
      ])
    },
  )

  it.each([
    [8, 8],
    [null, 4],
  ])(
    'update sends the stamped blob and expected version, returns %s -> %s',
    async (data, version) => {
      const calls: [string, unknown][] = []
      const s = snap()
      const repo = new SupabasePartyRepository(
        fakeClient({ update_party: { data, error: null } }, calls),
      )
      expect(await repo.update(s.id, s, 3, '1234')).toEqual({ snapshot: s, version })
      expect(calls).toEqual([
        [
          'update_party',
          {
            p_id: s.id,
            p_data: { ...s, _schemaVersion: SCHEMA_VERSION },
            p_expected_version: 3,
            p_pin: '1234',
          },
        ],
      ])
    },
  )

  it.each([
    [true, true],
    [false, false],
    [null, false],
  ])('verifyPin sends the guess and maps %s to %s', async (data, expected) => {
    const calls: [string, unknown][] = []
    const repo = new SupabasePartyRepository(
      fakeClient({ verify_party_pin: { data, error: null } }, calls),
    )
    expect(await repo.verifyPin('abc1234', '1234')).toBe(expected)
    expect(calls).toEqual([['verify_party_pin', { p_id: 'abc1234', p_pin: '1234' }]])
  })

  it('verifyPin surfaces a throttle error', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({ verify_party_pin: { data: null, error: { code: 'PT429' } } }),
    )
    await expect(repo.verifyPin('abc1234', '1234')).rejects.toBeInstanceOf(RateLimitedError)
  })
})

const rsvp: Rsvp = { id: 'r1', parentsLabel: 'A', familyAnswers: {}, children: [], createdAt: 'x' }

describe('SupabasePartyRepository PIN-gated writes', () => {
  const writes: [string, string, (r: SupabasePartyRepository) => Promise<void>, unknown][] = [
    [
      'setPin',
      'set_party_pin',
      (r) => r.setPin('abc1234', '4321', '0000'),
      { p_id: 'abc1234', p_new_pin: '4321', p_current_pin: '0000' },
    ],
    [
      'deleteParty',
      'delete_party',
      (r) => r.deleteParty('abc1234', '0000'),
      { p_id: 'abc1234', p_pin: '0000' },
    ],
    [
      'appendRsvp',
      'append_rsvp',
      (r) => r.appendRsvp('abc1234', rsvp, '0000'),
      { p_id: 'abc1234', p_rsvp: rsvp, p_pin: '0000' },
    ],
    [
      'updateRsvp',
      'update_rsvp',
      (r) => r.updateRsvp('abc1234', 'r1', rsvp, '0000'),
      { p_id: 'abc1234', p_rsvp_id: 'r1', p_rsvp: rsvp, p_pin: '0000' },
    ],
    [
      'removeRsvp',
      'remove_rsvp',
      (r) => r.removeRsvp('abc1234', 'r1', '0000'),
      { p_id: 'abc1234', p_rsvp_id: 'r1', p_pin: '0000' },
    ],
  ]

  it.each(writes)(
    '%s calls %s with exactly its arguments when accepted',
    async (_n, fn, call, args) => {
      const calls: [string, unknown][] = []
      await call(
        new SupabasePartyRepository(fakeClient({ [fn]: { data: true, error: null } }, calls)),
      )
      expect(calls).toEqual([[fn, args]])
    },
  )

  it.each(writes)('%s maps a rejected sentinel (false) to WrongPinError', async (_n, fn, call) => {
    const repo = new SupabasePartyRepository(fakeClient({ [fn]: { data: false, error: null } }))
    await expect(call(repo)).rejects.toBeInstanceOf(WrongPinError)
  })

  it.each(writes)('%s maps an rpc error to its domain error', async (_n, fn, call) => {
    const repo = new SupabasePartyRepository(
      fakeClient({ [fn]: { data: null, error: { code: 'PT429' } } }),
    )
    await expect(call(repo)).rejects.toBeInstanceOf(RateLimitedError)
  })
})

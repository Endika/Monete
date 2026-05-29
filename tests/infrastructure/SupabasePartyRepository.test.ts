import { describe, it, expect } from 'vitest'
import { SupabasePartyRepository } from '@/infrastructure/persistence/SupabasePartyRepository'
import { VersionConflictError, StaleClientError } from '@/domain/repositories/IPartyRepository'
import { Party } from '@/domain/entities/Party'

// Minimal fake of the supabase-js query builder for the calls the repo makes.
function fakeClient(opts: {
  row?: unknown
  updateResult?: { data: unknown; error: unknown }
  rpcError?: unknown
}) {
  return {
    from() {
      const builder: Record<string, unknown> = {}
      const chain = () => builder
      builder.select = chain
      builder.eq = chain
      builder.insert = chain
      builder.update = chain
      builder.single = async () => ({ data: { version: 1 }, error: null })
      builder.maybeSingle = async () => opts.updateResult ?? { data: opts.row, error: null }
      return builder
    },
    rpc: async () => ({ data: null, error: opts.rpcError ?? null }),
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
  it('maps a version-conflict (no row returned) to VersionConflictError', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({ updateResult: { data: null, error: null }, row: { version: 7, active: true } }),
    )
    await expect(repo.update(snap().id, snap(), 1)).rejects.toBeInstanceOf(VersionConflictError)
  })

  it('maps PT426 to StaleClientError', async () => {
    const repo = new SupabasePartyRepository(
      fakeClient({ updateResult: { data: null, error: { code: 'PT426' } } }),
    )
    await expect(repo.update(snap().id, snap(), 1)).rejects.toBeInstanceOf(StaleClientError)
  })
})

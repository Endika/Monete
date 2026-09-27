import { describe, it, expect } from 'vitest'
import { SupabasePartyRepository } from '@/infrastructure/persistence/SupabasePartyRepository'

// A stub that errors if append/update/remove_rsvp is ever called without a p_pin key at
// all. That's the behavioural proof that the client always sends it (even as null): a
// dropped p_pin would silently resolve to the old, ungated overload instead.
function strictClient() {
  return {
    rpc: async (fn: string, args: Record<string, unknown>) => {
      if (['append_rsvp', 'update_rsvp', 'remove_rsvp'].includes(fn) && !('p_pin' in args)) {
        throw new Error(`${fn} called without p_pin: could resolve the old, ungated overload`)
      }
      return { data: true, error: null }
    },
  } as never
}

describe('SupabasePartyRepository rsvp writes always send p_pin', () => {
  it('appendRsvp sends p_pin, even null', async () => {
    const repo = new SupabasePartyRepository(strictClient())
    await expect(
      repo.appendRsvp('abc1234', { id: 'r1', parentsLabel: 'A' } as never, null),
    ).resolves.toBeUndefined()
  })

  it('updateRsvp sends p_pin, even null', async () => {
    const repo = new SupabasePartyRepository(strictClient())
    const rsvp = { id: 'r1', parentsLabel: 'A', familyAnswers: {}, children: [], createdAt: 'x' }
    await expect(repo.updateRsvp('abc1234', 'r1', rsvp as never, null)).resolves.toBeUndefined()
  })

  it('removeRsvp sends p_pin, even null', async () => {
    const repo = new SupabasePartyRepository(strictClient())
    await expect(repo.removeRsvp('abc1234', 'r1', null)).resolves.toBeUndefined()
  })
})

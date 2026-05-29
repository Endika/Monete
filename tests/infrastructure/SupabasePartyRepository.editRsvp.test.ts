import { describe, it, expect } from 'vitest'
import { SupabasePartyRepository } from '@/infrastructure/persistence/SupabasePartyRepository'

function fakeClient(calls: { name: string; args: unknown }[]) {
  return {
    rpc: async (name: string, args: unknown) => {
      calls.push({ name, args })
      return { data: null, error: null }
    },
  } as never
}

describe('SupabasePartyRepository update/remove rsvp', () => {
  it('calls update_rsvp with id, rsvpId, rsvp', async () => {
    const calls: { name: string; args: unknown }[] = []
    const repo = new SupabasePartyRepository(fakeClient(calls))
    const rsvp = { id: 'r1', parentsLabel: 'A', familyAnswers: {}, children: [], createdAt: 'x' }
    await repo.updateRsvp('abc1234', 'r1', rsvp as never)
    expect(calls[0]).toEqual({
      name: 'update_rsvp',
      args: { p_id: 'abc1234', p_rsvp_id: 'r1', p_rsvp: rsvp },
    })
  })

  it('calls remove_rsvp with id, rsvpId', async () => {
    const calls: { name: string; args: unknown }[] = []
    const repo = new SupabasePartyRepository(fakeClient(calls))
    await repo.removeRsvp('abc1234', 'r1')
    expect(calls[0]).toEqual({ name: 'remove_rsvp', args: { p_id: 'abc1234', p_rsvp_id: 'r1' } })
  })
})

import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { Party } from '@/domain/entities/Party'

function snapWithTwoRsvps() {
  const p = Party.create({
    title: 'P',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  const r1 = p.buildRsvp({
    parentsLabel: 'A',
    familyAnswers: {},
    children: [{ name: 'Leo', answers: {} }],
    now: '2026-05-29T00:00:00.000Z',
  })
  const r2 = p.buildRsvp({
    parentsLabel: 'B',
    familyAnswers: {},
    children: [{ name: 'Mia', answers: {} }],
    now: '2026-05-29T00:00:00.000Z',
  })
  return { snapshot: { ...p.toSnapshot(), rsvps: [r1, r2] }, r1, r2 }
}

describe('InMemoryPartyRepository update/remove rsvp', () => {
  it('replaces one rsvp by id, leaving the other', async () => {
    const repo = new InMemoryPartyRepository()
    const { snapshot, r1 } = snapWithTwoRsvps()
    await repo.create(snapshot)
    await repo.updateRsvp(snapshot.id, r1.id, { ...r1, parentsLabel: 'A2' })
    const row = await repo.findById(snapshot.id)
    expect(row!.snapshot.rsvps.find((r) => r.id === r1.id)!.parentsLabel).toBe('A2')
    expect(row!.snapshot.rsvps).toHaveLength(2)
  })

  it('removes one rsvp by id', async () => {
    const repo = new InMemoryPartyRepository()
    const { snapshot, r2 } = snapWithTwoRsvps()
    await repo.create(snapshot)
    await repo.removeRsvp(snapshot.id, r2.id)
    const row = await repo.findById(snapshot.id)
    expect(row!.snapshot.rsvps.map((r) => r.id)).not.toContain(r2.id)
    expect(row!.snapshot.rsvps).toHaveLength(1)
  })
})

import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { VersionConflictError } from '@/domain/repositories/IPartyRepository'
import { Party } from '@/domain/entities/Party'

function snap() {
  return Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  }).toSnapshot()
}

describe('InMemoryPartyRepository', () => {
  it('creates then reads at version 1', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    const row = await repo.findById(s.id)
    expect(row?.version).toBe(1)
  })

  it('rejects an update with a stale expectedVersion', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await expect(repo.update(s.id, s, 99, null)).rejects.toBeInstanceOf(VersionConflictError)
  })

  it('append never loses concurrent rsvps', async () => {
    const repo = new InMemoryPartyRepository()
    const party = Party.create({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    await repo.create(party.toSnapshot())
    const rsvps = Array.from({ length: 5 }, (_, i) =>
      party.buildRsvp({
        parentsLabel: `Family ${i}`,
        familyAnswers: {},
        children: [{ name: `Kid ${i}`, answers: {} }],
        now: '2026-05-29T00:00:00.000Z',
      }),
    )
    await Promise.all(rsvps.map((r) => repo.appendRsvp(party.toSnapshot().id, r)))
    const row = await repo.findById(party.toSnapshot().id)
    expect(row?.snapshot.rsvps).toHaveLength(5)
  })
})

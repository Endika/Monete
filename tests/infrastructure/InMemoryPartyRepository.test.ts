import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { VersionConflictError } from '@/domain/repositories/IPartyRepository'
import { Party } from '@/domain/entities/Party'
import { unlocked } from '../helpers/partyRead'

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
    await Promise.all(rsvps.map((r) => repo.appendRsvp(party.toSnapshot().id, r, null)))
    const row = await repo.findById(party.toSnapshot().id)
    expect(unlocked(row).snapshot.rsvps).toHaveLength(5)
  })

  it('reports the version through getVersion, null when the party is missing', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    expect(await repo.getVersion(s.id)).toBeNull()
    await repo.create(s)
    expect(await repo.getVersion(s.id)).toBe(1)
    await repo.update(s.id, s, 1, null)
    expect(await repo.getVersion(s.id)).toBe(2)
  })

  it('rejects creating a party twice', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await expect(repo.create(s)).rejects.toThrow('Party already exists')
  })

  it('returns the saved snapshot and the bumped version from update', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    const saved = await repo.update(s.id, { ...s, rsvps: [] }, 1, null)
    expect(saved).toEqual({ snapshot: { ...s, rsvps: [] }, version: 2 })
  })

  it('bumps the version when the PIN changes', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await repo.setPin(s.id, '1234', null)
    expect(await repo.getVersion(s.id)).toBe(2)
  })

  it.each([
    ['setPin', (r: InMemoryPartyRepository) => r.setPin('nope', '1234', null)],
    ['deleteParty', (r: InMemoryPartyRepository) => r.deleteParty('nope', null)],
  ])('%s rejects a missing party', async (_name, call) => {
    await expect(call(new InMemoryPartyRepository())).rejects.toThrow('Party not found')
  })
})

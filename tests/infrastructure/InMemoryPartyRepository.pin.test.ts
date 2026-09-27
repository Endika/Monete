import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { WrongPinError, RateLimitedError } from '@/domain/repositories/IPartyRepository'
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

const rsvp = { id: 'r1', parentsLabel: 'A', familyAnswers: {}, children: [], createdAt: 'x' }

describe('InMemoryPartyRepository mirrors the SQL PIN gate', () => {
  it('locks a read with no pin, without counting a failure, then unlocks with the right one', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await repo.setPin(s.id, '1234', null)

    expect(await repo.findById(s.id)).toEqual({ locked: true, hasPin: true })
    expect(unlocked(await repo.findById(s.id, '1234')).snapshot.id).toBe(s.id)
  })

  it('locks a read on a wrong pin and counts it as a failure', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await repo.setPin(s.id, '1234', null)
    expect(await repo.findById(s.id, 'wrong')).toEqual({ locked: true, hasPin: true })
    for (let i = 0; i < 9; i++) await repo.findById(s.id, 'wrong')
    await expect(repo.findById(s.id, 'wrong')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('rejects appendRsvp/updateRsvp/removeRsvp without the PIN on a PIN-protected party', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await repo.setPin(s.id, '1234', null)

    await expect(repo.appendRsvp(s.id, rsvp, null)).rejects.toBeInstanceOf(WrongPinError)
    await expect(repo.updateRsvp(s.id, rsvp.id, rsvp, null)).rejects.toBeInstanceOf(WrongPinError)
    await expect(repo.removeRsvp(s.id, rsvp.id, null)).rejects.toBeInstanceOf(WrongPinError)
  })

  it('accepts appendRsvp/updateRsvp/removeRsvp with the right PIN on a PIN-protected party', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await repo.setPin(s.id, '1234', null)

    await repo.appendRsvp(s.id, rsvp, '1234')
    expect(unlocked(await repo.findById(s.id, '1234')).snapshot.rsvps).toHaveLength(1)

    await repo.updateRsvp(s.id, rsvp.id, { ...rsvp, parentsLabel: 'B' }, '1234')
    expect(unlocked(await repo.findById(s.id, '1234')).snapshot.rsvps[0]!.parentsLabel).toBe('B')

    await repo.removeRsvp(s.id, rsvp.id, '1234')
    expect(unlocked(await repo.findById(s.id, '1234')).snapshot.rsvps).toHaveLength(0)
  })
})

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

  async function protectedParty(pin = '1234') {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await repo.setPin(s.id, pin, null)
    return { repo, s }
  }

  it('throttles write attempts too: after 10 wrong pins even the right one is refused', async () => {
    const { repo, s } = await protectedParty()
    for (let i = 0; i < 10; i++) {
      await expect(repo.update(s.id, s, 2, 'wrong')).rejects.toBeInstanceOf(WrongPinError)
    }
    await expect(repo.update(s.id, s, 2, '1234')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it.each(['1234', '123456'])('accepts the PIN %s and clears it again with null', async (pin) => {
    const { repo, s } = await protectedParty(pin)
    expect(await repo.verifyPin(s.id, pin)).toBe(true)
    await repo.setPin(s.id, null, pin)
    expect(unlocked(await repo.findById(s.id)).hasPin).toBe(false)
  })

  it.each(['123', '1234567', 'a1234', '1234a', ''])('rejects the malformed PIN %j', async (pin) => {
    const { repo, s } = await protectedParty()
    await expect(repo.setPin(s.id, pin, '1234')).rejects.toThrow('Invalid PIN format')
  })

  it('verifyPin is false for a missing party, true without a PIN, and counts wrong guesses', async () => {
    const repo = new InMemoryPartyRepository()
    expect(await repo.verifyPin('nope', '1234')).toBe(false)
    const s = snap()
    await repo.create(s)
    expect(await repo.verifyPin(s.id, 'anything')).toBe(true)
    await repo.setPin(s.id, '1234', null)
    for (let i = 0; i < 10; i++) expect(await repo.verifyPin(s.id, 'wrong')).toBe(false)
    await expect(repo.verifyPin(s.id, '1234')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('a recreated party starts with a fresh throttle', async () => {
    const { repo, s } = await protectedParty()
    for (let i = 0; i < 9; i++) await repo.findById(s.id, 'wrong')
    await repo.deleteParty(s.id, '1234')
    await repo.create(s)
    await repo.setPin(s.id, '1234', null)
    for (let i = 0; i < 10; i++) {
      expect(await repo.findById(s.id, 'wrong')).toEqual({ locked: true, hasPin: true })
    }
  })
})

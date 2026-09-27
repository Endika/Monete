import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { WrongPinError, RateLimitedError } from '@/domain/repositories/IPartyRepository'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { EditPartyDetailsHandler } from '@/application/handlers/EditPartyDetailsHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { DeletePartyHandler } from '@/application/handlers/DeletePartyHandler'
import { unlocked } from '../helpers/partyRead'

async function freshParty(repo: InMemoryPartyRepository): Promise<string> {
  const r = await new CreatePartyHandler(repo).execute({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  return r.party.id
}

const details = (partyId: string, pin: string | null) => ({
  partyId,
  title: 'Leo turns 5',
  address: 'Fun Park',
  startsAt: '2026-06-20T17:00:00.000Z',
  endsAt: null,
  requirements: '',
  pin,
})

describe('server-side PIN enforcement (threaded through the handlers)', () => {
  it('lets a PIN-less party be edited without a PIN', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new EditPartyDetailsHandler(repo).execute(details(id, null))
    expect(unlocked(await repo.findById(id)).snapshot.event.address).toBe('Fun Park')
  })

  it('rejects an edit with a wrong PIN on a PIN-protected party', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    await expect(
      new EditPartyDetailsHandler(repo).execute(details(id, '0000')),
    ).rejects.toBeInstanceOf(WrongPinError)
  })

  it('accepts an edit with the correct PIN', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    await new EditPartyDetailsHandler(repo).execute(details(id, '1234'))
    expect(unlocked(await repo.findById(id, '1234')).snapshot.event.address).toBe('Fun Park')
  })

  it('requires the current PIN to change an existing PIN', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    await expect(
      new SetEditPinHandler(repo).execute({ partyId: id, pin: '5678', currentPin: '0000' }),
    ).rejects.toBeInstanceOf(WrongPinError)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '5678', currentPin: '1234' })
    expect(await repo.verifyPin(id, '5678')).toBe(true)
  })

  it('throttles PIN guessing once the attempt cap is hit', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    for (let i = 0; i < 10; i++) expect(await repo.verifyPin(id, '0000')).toBe(false)
    await expect(repo.verifyPin(id, '0000')).rejects.toBeInstanceOf(RateLimitedError)
    // even the correct PIN is blocked while throttled
    await expect(repo.verifyPin(id, '1234')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('a correct PIN before the cap clears the failure counter', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    for (let i = 0; i < 9; i++) await repo.verifyPin(id, '0000')
    expect(await repo.verifyPin(id, '1234')).toBe(true) // resets the counter
    for (let i = 0; i < 9; i++) await repo.verifyPin(id, '0000')
    expect(await repo.verifyPin(id, '1234')).toBe(true) // still not throttled
  })

  it('deletes a party with the correct PIN and rejects a wrong one (erasure path)', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    await expect(new DeletePartyHandler(repo).execute(id, '0000')).rejects.toBeInstanceOf(
      WrongPinError,
    )
    await new DeletePartyHandler(repo).execute(id, '1234')
    expect(await repo.findById(id)).toBeNull()
  })

  it('deletes a PIN-less party without a PIN', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new DeletePartyHandler(repo).execute(id, null)
    expect(await repo.findById(id)).toBeNull()
  })
})

describe('server-side PIN gate on reads (get_party four branches)', () => {
  it('returns null for a party that does not exist', async () => {
    const repo = new InMemoryPartyRepository()
    expect(await repo.findById('missing')).toBeNull()
  })

  it('returns the full party for a PIN-less party with no pin supplied', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    expect(await repo.findById(id)).toEqual({
      locked: false,
      snapshot: expect.objectContaining({ id }),
      version: 1,
      hasPin: false,
    })
  })

  it('locks the read without counting a failure when no pin is supplied', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    // Well past the 10-fail throttle cap, if any of these counted as a failure.
    for (let i = 0; i < 15; i++) {
      expect(await repo.findById(id)).toEqual({ locked: true, hasPin: true })
    }
    expect(await repo.verifyPin(id, '1234')).toBe(true)
  })

  it('locks the read and counts a failure on a wrong pin', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    expect(await repo.findById(id, '0000')).toEqual({ locked: true, hasPin: true })
    for (let i = 0; i < 9; i++) await repo.findById(id, '0000')
    await expect(repo.findById(id, '0000')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('returns the full party for the correct pin', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    const row = unlocked(await repo.findById(id, '1234'))
    expect(row.hasPin).toBe(true)
    expect(row.snapshot.id).toBe(id)
  })
})

describe('server-side PIN enforcement on RSVP writes', () => {
  it('refuses an RSVP submission without the PIN on a PIN-protected party', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    await expect(
      repo.appendRsvp(id, { id: 'r1', parentsLabel: 'A' } as never, null),
    ).rejects.toBeInstanceOf(WrongPinError)
  })

  it('accepts an RSVP submission with the correct PIN', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    await repo.appendRsvp(id, { id: 'r1', parentsLabel: 'A' } as never, '1234')
    expect(unlocked(await repo.findById(id, '1234')).snapshot.rsvps).toHaveLength(1)
  })
})

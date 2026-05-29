import { describe, it, expect } from 'vitest'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'

describe('CreatePartyHandler', () => {
  it('creates a party and returns its id', async () => {
    const repo = new InMemoryPartyRepository()
    const result = await new CreatePartyHandler(repo).execute({
      title: 'Leo turns 5',
      address: 'Fun Park',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: 'Non-slip socks',
    })
    expect(result.party.id).toMatch(/^[a-z0-9]{7}$/)
    expect((await repo.findById(result.party.id))?.snapshot.event.title).toBe('Leo turns 5')
  })

  it('rejects an invalid payload', async () => {
    const repo = new InMemoryPartyRepository()
    await expect(
      new CreatePartyHandler(repo).execute({
        title: '',
        address: '',
        startsAt: 'nope',
        endsAt: null,
        requirements: '',
      }),
    ).rejects.toBeTruthy()
  })
})

import { describe, it, expect } from 'vitest'
import { withOptimisticRetry } from '@/application/support/withOptimisticRetry'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { Party } from '@/domain/entities/Party'

describe('withOptimisticRetry', () => {
  it('applies the mutation and persists the new snapshot', async () => {
    const repo = new InMemoryPartyRepository()
    const party = Party.create({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    await repo.create(party.toSnapshot())
    const result = await withOptimisticRetry(repo, party.toSnapshot().id, (row) =>
      Party.restore(row.snapshot)
        .editDetails({
          title: 'Leo turns 5',
          address: 'A',
          startsAt: '2026-06-20T17:00:00.000Z',
          endsAt: null,
          requirements: '',
        })
        .toSnapshot(),
    )
    expect(result.snapshot.event.title).toBe('Leo turns 5')
    expect(result.version).toBe(2)
  })
})

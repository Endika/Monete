import { describe, it, expect, vi } from 'vitest'
import { withOptimisticRetry } from '@/application/support/withOptimisticRetry'
import {
  type IPartyRepository,
  type ReadResult,
  VersionConflictError,
  WrongPinError,
} from '@/domain/repositories/IPartyRepository'
import { Party, type PartySnapshot } from '@/domain/entities/Party'

const snapshot = Party.create({
  title: 'Leo 5',
  address: 'A',
  startsAt: '2026-06-20T17:00:00.000Z',
  endsAt: null,
  requirements: '',
}).toSnapshot()

const readAt = (version: number): ReadResult => ({
  locked: false,
  snapshot,
  version,
  hasPin: true,
})

function repoWith(reads: (ReadResult | null)[], update: IPartyRepository['update']) {
  const findById = vi.fn()
  for (const r of reads) findById.mockResolvedValueOnce(r)
  return { repo: { findById, update } as unknown as IPartyRepository, findById }
}

const conflict = () => Promise.reject(new VersionConflictError(9))

describe('withOptimisticRetry', () => {
  it('re-reads and re-applies the mutation after a version conflict, sending the PIN each time', async () => {
    const saved = { snapshot, version: 3 }
    const update = vi.fn().mockImplementationOnce(conflict).mockResolvedValueOnce(saved)
    const { repo, findById } = repoWith([readAt(1), readAt(2)], update)
    const mutate = vi.fn((row: { snapshot: PartySnapshot }) => row.snapshot)

    expect(await withOptimisticRetry(repo, 'p1', mutate, '1234')).toBe(saved)
    expect(findById.mock.calls).toEqual([
      ['p1', '1234'],
      ['p1', '1234'],
    ])
    expect(update.mock.calls).toEqual([
      ['p1', snapshot, 1, '1234'],
      ['p1', snapshot, 2, '1234'],
    ])
    expect(mutate).toHaveBeenCalledTimes(2)
  })

  it('gives up after three conflicting attempts', async () => {
    const { repo, findById } = repoWith([readAt(1), readAt(2), readAt(3)], vi.fn(conflict))
    await expect(withOptimisticRetry(repo, 'p1', (r) => r.snapshot)).rejects.toThrow(
      'Could not save: too many concurrent writes',
    )
    expect(findById).toHaveBeenCalledTimes(3)
    expect(findById).toHaveBeenCalledWith('p1', null)
  })

  it.each([
    ['a missing party', null, undefined, 'Party not found'],
    ['a locked read', { locked: true, hasPin: true } as const, undefined, WrongPinError],
    ['any other write error', readAt(1), new Error('boom'), 'boom'],
  ])('throws on %s without retrying', async (_, read, writeError, expected) => {
    const update = vi.fn().mockRejectedValue(writeError)
    const { repo, findById } = repoWith([read, readAt(2)], update)
    await expect(withOptimisticRetry(repo, 'p1', (r) => r.snapshot)).rejects.toThrow(expected)
    expect(findById).toHaveBeenCalledTimes(1)
  })
})

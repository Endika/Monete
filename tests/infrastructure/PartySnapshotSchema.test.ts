import { describe, it, expect } from 'vitest'
import { parsePartySnapshot } from '@/infrastructure/persistence/PartySnapshotSchema'
import { Party } from '@/domain/entities/Party'

describe('parsePartySnapshot', () => {
  it('round-trips a created party snapshot', () => {
    const snap = Party.create({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    }).toSnapshot()
    const parsed = parsePartySnapshot(JSON.parse(JSON.stringify(snap)))
    expect(parsed.id).toBe(snap.id)
    expect(parsed.questions).toEqual([])
  })

  it('fills defaults for missing optional arrays', () => {
    const parsed = parsePartySnapshot({
      id: 'abc1234',
      event: {
        title: 'X',
        address: '',
        startsAt: '2026-06-20T17:00:00.000Z',
        endsAt: null,
        requirements: '',
      },
      createdAt: '2026-05-29T00:00:00.000Z',
      updatedAt: '2026-05-29T00:00:00.000Z',
    })
    expect(parsed.questions).toEqual([])
    expect(parsed.rsvps).toEqual([])
    expect(parsed.editPin).toBeNull()
  })

  it('throws on a missing mandatory field', () => {
    expect(() => parsePartySnapshot({ id: 'abc1234' })).toThrow(/validation failed/i)
  })
})

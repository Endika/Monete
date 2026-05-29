import { describe, it, expect } from 'vitest'
import { Party } from '@/domain/entities/Party'
import { parsePartySnapshot } from '@/infrastructure/persistence/PartySnapshotSchema'

describe('EventDetails.allDay', () => {
  it('create stores allDay', () => {
    const p = Party.create({
      title: 'P',
      address: '',
      startsAt: '2026-06-20T00:00:00.000Z',
      endsAt: null,
      requirements: '',
      allDay: true,
    })
    expect(p.toSnapshot().event.allDay).toBe(true)
  })

  it('defaults allDay=false when absent (back-compat)', () => {
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
    expect(parsed.event.allDay).toBe(false)
  })
})

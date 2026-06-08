import { describe, it, expect } from 'vitest'
import { Party } from '@/domain/entities/Party'

function base() {
  return Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
    now: '2026-05-29T00:00:00.000Z',
  })
}

describe('Party details + pin', () => {
  it('updates event details and bumps updatedAt', () => {
    const next = base().editDetails({
      title: 'Leo turns 5',
      address: 'Fun Park',
      startsAt: '2026-06-21T16:00:00.000Z',
      endsAt: '2026-06-21T19:00:00.000Z',
      requirements: 'Socks',
      now: '2026-05-30T00:00:00.000Z',
    })
    const s = next.toSnapshot()
    expect(s.event.title).toBe('Leo turns 5')
    expect(s.event.endsAt).toBe('2026-06-21T19:00:00.000Z')
    expect(s.updatedAt).toBe('2026-05-30T00:00:00.000Z')
  })

  it('keeps venueName through create and editDetails, defaults to empty', () => {
    const created = Party.create({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
      venueName: 'Jungle Park',
    })
    expect(created.toSnapshot().event.venueName).toBe('Jungle Park')
    expect(base().toSnapshot().event.venueName).toBe('')

    const edited = base().editDetails({
      title: 'Leo turns 5',
      address: 'Fun Park',
      startsAt: '2026-06-21T16:00:00.000Z',
      endsAt: null,
      requirements: '',
      venueName: 'Bowling Alley',
    })
    expect(edited.toSnapshot().event.venueName).toBe('Bowling Alley')
  })

  it('restore backfills venueName to empty when absent from a legacy snapshot', () => {
    const restored = Party.restore({
      id: 'abc1234',
      event: {
        title: 'X',
        address: '',
        startsAt: '2026-06-20T17:00:00.000Z',
        endsAt: null,
        requirements: '',
        allDay: false,
        lat: null,
        lng: null,
      } as never,
      questions: [],
      rsvps: [],
      createdAt: '2026-05-29T00:00:00.000Z',
      updatedAt: '2026-05-29T00:00:00.000Z',
    })
    expect(restored.toSnapshot().event.venueName).toBe('')
  })
})

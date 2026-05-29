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

  it('sets and clears the edit pin hash', () => {
    const withPin = base().setEditPin('hash-abc', '2026-05-30T00:00:00.000Z')
    expect(withPin.toSnapshot().editPin).toBe('hash-abc')
    expect(withPin.setEditPin(null, '2026-05-31T00:00:00.000Z').toSnapshot().editPin).toBeNull()
  })
})

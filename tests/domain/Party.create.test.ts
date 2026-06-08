import { describe, it, expect } from 'vitest'
import { Party } from '@/domain/entities/Party'

describe('Party.create', () => {
  it('creates a party with trimmed title and empty questions/rsvps', () => {
    const p = Party.create({
      title: '  Leo turns 5  ',
      address: 'Fun Park 12',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: 'Non-slip socks required',
    })
    const s = p.toSnapshot()
    expect(s.event.title).toBe('Leo turns 5')
    expect(s.event.requirements).toBe('Non-slip socks required')
    expect(s.questions).toEqual([])
    expect(s.rsvps).toEqual([])
    expect(s.id).toMatch(/^[a-z0-9]{7}$/)
  })

  it('rejects an empty title', () => {
    expect(() =>
      Party.create({
        title: '  ',
        address: 'x',
        startsAt: '2026-06-20T17:00:00.000Z',
        endsAt: null,
        requirements: '',
      }),
    ).toThrow()
  })
})

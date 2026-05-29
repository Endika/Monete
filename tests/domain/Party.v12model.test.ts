import { describe, it, expect } from 'vitest'
import { Party } from '@/domain/entities/Party'
import { parsePartySnapshot } from '@/infrastructure/persistence/PartySnapshotSchema'

function base() {
  return Party.create({
    title: 'P',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
    lat: 40.4,
    lng: -3.7,
  })
}

describe('v1.2 model', () => {
  it('stores lat/lng on event', () => {
    expect(base().toSnapshot().event.lat).toBe(40.4)
    expect(base().toSnapshot().event.lng).toBe(-3.7)
  })

  it('carries isSibling on children (default false, explicit true preserved)', () => {
    const rsvp = base().buildRsvp({
      parentsLabel: 'F',
      familyAnswers: {},
      children: [
        { name: 'Leo', answers: {} },
        { name: 'Mia', answers: {}, isSibling: true },
      ],
      now: 'x',
    })
    expect(rsvp.children[0]!.isSibling).toBe(false)
    expect(rsvp.children[1]!.isSibling).toBe(true)
  })

  it('backfills missing lat/lng and isSibling on parse', () => {
    const parsed = parsePartySnapshot({
      id: 'abc1234',
      event: {
        title: 'X',
        address: '',
        startsAt: '2026-06-20T17:00:00.000Z',
        endsAt: null,
        requirements: '',
      },
      rsvps: [
        {
          id: 'r',
          parentsLabel: 'P',
          familyAnswers: {},
          children: [{ id: 'c', name: 'Leo', answers: {} }],
          createdAt: 'x',
        },
      ],
      createdAt: 'x',
      updatedAt: 'x',
    })
    expect(parsed.event.lat).toBeNull()
    expect(parsed.event.lng).toBeNull()
    expect(parsed.rsvps[0]!.children[0]!.isSibling).toBe(false)
  })
})

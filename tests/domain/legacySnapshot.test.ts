import { describe, it, expect } from 'vitest'
import { parsePartySnapshot } from '@/infrastructure/persistence/PartySnapshotSchema'

describe('a stored snapshot from before allDay, coordinates and child flags', () => {
  it('parses with each later field at its default', () => {
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
    expect(parsed.event).toMatchObject({ allDay: false, lat: null, lng: null })
    expect(parsed.rsvps[0]!.children[0]).toMatchObject({ isSibling: false, isBirthday: false })
  })
})

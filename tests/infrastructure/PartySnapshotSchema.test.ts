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
  })

  it('defaults isBirthday to false when absent and preserves true', () => {
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
          children: [
            { id: 'c1', name: 'Leo', answers: {} },
            { id: 'c2', name: 'Mia', answers: {}, isBirthday: true },
          ],
          createdAt: 'x',
        },
      ],
      createdAt: '2026-05-29T00:00:00.000Z',
      updatedAt: '2026-05-29T00:00:00.000Z',
    })
    expect(parsed.rsvps[0]!.children[0]!.isBirthday).toBe(false)
    expect(parsed.rsvps[0]!.children[1]!.isBirthday).toBe(true)
  })

  it('defaults venueName to empty when absent and preserves a value', () => {
    const absent = parsePartySnapshot({
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
    expect(absent.event.venueName).toBe('')

    const present = parsePartySnapshot({
      id: 'abc1234',
      event: {
        title: 'X',
        address: '',
        startsAt: '2026-06-20T17:00:00.000Z',
        endsAt: null,
        requirements: '',
        venueName: 'Jungle Park',
      },
      createdAt: '2026-05-29T00:00:00.000Z',
      updatedAt: '2026-05-29T00:00:00.000Z',
    })
    expect(present.event.venueName).toBe('Jungle Park')
  })

  const minimal = {
    id: 'abc1234',
    event: { title: 'X', startsAt: '2026-06-20T17:00:00.000Z' },
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
  }

  it('defaults absent address and requirements to empty', () => {
    const { event } = parsePartySnapshot(minimal)
    expect(event.address).toBe('')
    expect(event.requirements).toBe('')
  })

  it('keeps every question field and defaults options and required', () => {
    const full = {
      id: 'q1',
      kind: 'custom',
      type: 'select',
      scope: 'family',
      label: 'Diet?',
      options: ['a'],
      required: true,
    }
    const bare = { id: 'q2', kind: 'custom', type: 'text', scope: 'child', label: 'Name' }
    const parsed = parsePartySnapshot({ ...minimal, questions: [full, bare] })
    expect(parsed.questions[0]).toEqual(full)
    expect(parsed.questions[1]).toEqual({ ...bare, options: [], required: false })
  })

  it('defaults an rsvp without children to none and accepts string, number and null answers', () => {
    const parsed = parsePartySnapshot({
      ...minimal,
      rsvps: [
        { id: 'r', parentsLabel: 'P', familyAnswers: { a: 'x', b: 2, c: null }, createdAt: 'x' },
      ],
    })
    expect(parsed.rsvps[0]!.children).toEqual([])
    expect(parsed.rsvps[0]!.familyAnswers).toEqual({ a: 'x', b: 2, c: null })
  })

  it('reports at most five issues as "path: message" joined by "; "', () => {
    const bad = {
      id: 1,
      event: { title: 1, startsAt: 2 },
      questions: [{}],
      createdAt: 3,
      updatedAt: 4,
    }
    const message = (() => {
      try {
        parsePartySnapshot(bad)
      } catch (e) {
        return (e as Error).message
      }
      return ''
    })()
    const issues = message.replace('Party snapshot validation failed: ', '').split('; ')
    expect(issues).toHaveLength(5)
    expect(issues[0]).toMatch(/^id: .+/)
    expect(issues[1]).toMatch(/^event\.title: .+/)
  })
})

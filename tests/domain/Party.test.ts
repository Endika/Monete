import { describe, it, expect } from 'vitest'
import { Party, type PartySnapshot, type Question } from '@/domain/entities/Party'

const NOW = '2026-05-30T00:00:00.000Z'

const details = {
  title: '  Leo turns 5  ',
  venueName: '  Jungle Park  ',
  address: '  Fun Park 12  ',
  startsAt: '2026-06-20T17:00:00.000Z',
  endsAt: '2026-06-20T19:00:00.000Z',
  requirements: '  Socks  ',
}

const ask = (over: Partial<Omit<Question, 'id'>> = {}): Omit<Question, 'id'> => ({
  kind: 'custom',
  type: 'text',
  scope: 'child',
  label: 'Notes',
  options: [],
  required: false,
  ...over,
})

const snackQ = ask({ kind: 'snack', type: 'select', label: 'Snack', options: ['Pizza', 'Hot dog'] })
const adultsQ = ask({ kind: 'adultsCount', type: 'number', scope: 'family', label: 'Adults' })

function party() {
  return Party.create({ ...details, endsAt: null, now: 'created' })
    .addQuestion({ ...adultsQ, required: true })
    .addQuestion({ ...snackQ, required: true })
}

function ids(p: Party) {
  const [adults, snack] = p.toSnapshot().questions
  return { adults: adults!.id, snack: snack!.id }
}

describe('Party details', () => {
  it('creates a party with trimmed details, defaults, and no questions or replies', () => {
    const s = Party.create({ ...details, now: NOW }).toSnapshot()
    expect(s).toEqual({
      id: expect.stringMatching(/^[a-z0-9]{7}$/),
      event: {
        title: 'Leo turns 5',
        venueName: 'Jungle Park',
        address: 'Fun Park 12',
        startsAt: details.startsAt,
        endsAt: details.endsAt,
        requirements: 'Socks',
        allDay: false,
        lat: null,
        lng: null,
      },
      questions: [],
      rsvps: [],
      createdAt: NOW,
      updatedAt: NOW,
    })
  })

  it('edits the details, keeping coordinates and allDay, and stamps the edit', () => {
    const s = Party.create({ ...details, now: 'created' })
      .editDetails({ ...details, title: 'X', allDay: true, lat: 40.4, lng: -3.7, now: NOW })
      .toSnapshot()
    expect(s.event).toMatchObject({ title: 'X', allDay: true, lat: 40.4, lng: -3.7 })
    expect(s.event.venueName).toBe('Jungle Park')
    expect(s).toMatchObject({ createdAt: 'created', updatedAt: NOW })
  })

  it('accepts a 100-character title and no venue name', () => {
    const { venueName: _omitted, ...rest } = details
    const s = Party.create({ ...rest, title: 'x'.repeat(100) }).toSnapshot()
    expect(s.event).toMatchObject({ title: 'x'.repeat(100), venueName: '' })
  })

  it.each([
    ['a blank title', '   '],
    ['a title over 100 characters', 'x'.repeat(101)],
  ])('rejects %s', (_, title) => {
    expect(() => Party.create({ ...details, title })).toThrow('Party: title must be 1..100 chars')
  })
})

describe('Party.restore', () => {
  it('keeps a complete snapshot exactly as it is', () => {
    const p = party()
    const { adults, snack } = ids(p)
    const full: PartySnapshot = {
      ...p.toSnapshot(),
      event: { ...p.toSnapshot().event, allDay: true, lat: 1, lng: 2 },
      rsvps: [
        {
          id: 'r1',
          parentsLabel: 'Fam',
          familyAnswers: { [adults]: 2 },
          children: [
            {
              id: 'c1',
              name: 'Leo',
              isSibling: true,
              isBirthday: true,
              answers: { [snack]: 'Pizza' },
            },
          ],
          createdAt: 'x',
        },
      ],
    }
    expect(Party.restore(full).toSnapshot()).toEqual(full)
  })

  it('fills in whatever an older snapshot lacks', () => {
    const legacy = {
      id: 'abc1234',
      event: { title: 'X', address: '', startsAt: 's', endsAt: null, requirements: '' },
      questions: [{ id: 'q1', kind: 'custom', type: 'text', scope: 'child', label: 'Notes' }],
      rsvps: [
        { id: 'r1', parentsLabel: 'A', createdAt: 'x' },
        {
          id: 'r2',
          parentsLabel: 'B',
          familyAnswers: {},
          children: [{ id: 'c1', name: 'Leo' }],
          createdAt: 'x',
        },
      ],
      createdAt: 'x',
      updatedAt: 'x',
    } as unknown as PartySnapshot
    const s = Party.restore(legacy).toSnapshot()
    expect(s.event).toMatchObject({ venueName: '', allDay: false, lat: null, lng: null })
    expect(s.questions[0]).toMatchObject({ options: [], required: false })
    expect(s.rsvps[0]).toMatchObject({ familyAnswers: {}, children: [] })
    expect(s.rsvps[1]!.children[0]).toEqual({
      id: 'c1',
      name: 'Leo',
      answers: {},
      isSibling: false,
      isBirthday: false,
    })
    expect(
      Party.restore({ ...legacy, questions: undefined, rsvps: undefined } as never).toSnapshot(),
    ).toMatchObject({ questions: [], rsvps: [] })
  })
})

describe('Party questions', () => {
  it('adds a question with trimmed label and options, dropping blank options', () => {
    const s = Party.create(details)
      .addQuestion(ask({ type: 'select', label: ' A ', options: [' Pizza ', '', 'Hot dog'] }), NOW)
      .toSnapshot()
    expect(s.questions).toEqual([
      {
        id: expect.stringMatching(/^[0-9a-f-]{36}$/),
        ...ask({ type: 'select', label: 'A', options: ['Pizza', 'Hot dog'] }),
      },
    ])
    expect(s.updatedAt).toBe(NOW)
  })

  it('keeps no options on a question that is not a select, and accepts a 120-character label', () => {
    const label = 'x'.repeat(120)
    const q = Party.create(details)
      .addQuestion(ask({ label, options: ['stray'] }))
      .toSnapshot().questions[0]
    expect(q).toMatchObject({ label, options: [] })
  })

  it.each([
    ['a blank label', ask({ label: '  ' }), 'Question: label must be 1..120 chars'],
    [
      'a label over 120 characters',
      ask({ label: 'x'.repeat(121) }),
      'Question: label must be 1..120 chars',
    ],
    [
      'a select with only blank options',
      ask({ type: 'select', options: [' '] }),
      'Question: select needs at least one option',
    ],
  ])('rejects %s', (_, input, message) => {
    expect(() => Party.create(details).addQuestion(input)).toThrow(message)
  })

  it('updates and removes only the question it is given', () => {
    const p = Party.create(details)
      .addQuestion(ask({ label: 'One' }))
      .addQuestion(ask({ label: 'Two' }))
    const [one, two] = p.toSnapshot().questions
    const updated = p
      .updateQuestion(two!.id, ask({ label: 'Second', required: true }), NOW)
      .toSnapshot()
    expect(updated.questions).toEqual([
      one,
      { id: two!.id, ...ask({ label: 'Second', required: true }) },
    ])
    expect(updated.updatedAt).toBe(NOW)

    const removed = p.removeQuestion(one!.id, NOW).toSnapshot()
    expect(removed.questions).toEqual([two])
    expect(removed.updatedAt).toBe(NOW)
    expect(() => p.updateQuestion('nope', ask())).toThrow('Question: not found')
  })
})

describe('Party RSVPs', () => {
  it('builds an RSVP with trimmed names, default flags and copies of the answers', () => {
    const p = party()
    const { adults, snack } = ids(p)
    const familyAnswers = { [adults]: 2 }
    const answers = { [snack]: 'Pizza' }
    const rsvp = p.buildRsvp({
      parentsLabel: '  Fam  ',
      familyAnswers,
      children: [
        { name: ' L ', answers },
        { name: 'Mia', answers: { [snack]: 'Hot dog' }, isSibling: true, isBirthday: true },
      ],
      now: NOW,
    })
    familyAnswers[adults] = 999
    answers[snack] = 'Hot dog'
    expect(rsvp).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      parentsLabel: 'Fam',
      familyAnswers: { [adults]: 2 },
      children: [
        {
          id: expect.any(String),
          name: 'L',
          isSibling: false,
          isBirthday: false,
          answers: { [snack]: 'Pizza' },
        },
        {
          id: expect.any(String),
          name: 'Mia',
          isSibling: true,
          isBirthday: true,
          answers: { [snack]: 'Hot dog' },
        },
      ],
      createdAt: NOW,
    })
  })

  type Ids = ReturnType<typeof ids>
  const kid = (answers: Record<string, string>) => [{ name: 'Leo', answers }]
  it.each<[string, (q: Ids) => object, string]>([
    ['a blank family label', () => ({ parentsLabel: '  ' }), 'Rsvp: parentsLabel is required'],
    ['no children', () => ({ children: [] }), 'Rsvp: at least one child is required'],
    [
      'a blank child name',
      (q) => ({ children: [{ name: '  ', answers: { [q.snack]: 'Pizza' } }] }),
      'Rsvp: each child needs a name',
    ],
    [
      'a missing family answer',
      () => ({ familyAnswers: {} }),
      'Rsvp: "Adults" is required for the family',
    ],
    [
      'a null family answer',
      (q) => ({ familyAnswers: { [q.adults]: null } }),
      'Rsvp: "Adults" is required for the family',
    ],
    [
      'an empty child answer',
      (q) => ({ children: kid({ [q.snack]: '' }) }),
      'Rsvp: "Snack" is required for Leo',
    ],
    [
      'an answer outside the options',
      (q) => ({ children: kid({ [q.snack]: 'Sushi' }) }),
      'Rsvp: "Sushi" is not a valid option for "Snack"',
    ],
  ])('rejects %s, building or updating', (_, over, message) => {
    const p = party()
    const q = ids(p)
    const valid = {
      parentsLabel: 'Fam',
      familyAnswers: { [q.adults]: 2 },
      children: kid({ [q.snack]: 'Pizza' }),
    }
    const rsvp = p.buildRsvp(valid)
    const input = { ...valid, ...over(q) }
    expect(() => p.buildRsvp(input)).toThrow(message)
    expect(() =>
      Party.restore({ ...p.toSnapshot(), rsvps: [rsvp] }).updateRsvp(rsvp.id, input),
    ).toThrow(message)
  })

  it('updates and removes only the family it is given, keeping its id and creation time', () => {
    const p = party()
    const { adults, snack } = ids(p)
    const body = (label: string) => ({
      parentsLabel: label,
      familyAnswers: { [adults]: 1 },
      children: [{ name: 'Leo', answers: { [snack]: 'Pizza' } }],
    })
    const a = p.buildRsvp({ ...body('A'), now: 'a' })
    const b = p.buildRsvp({ ...body('B'), now: 'b' })
    const both = Party.restore({ ...p.toSnapshot(), rsvps: [a, b] })

    const updated = both.updateRsvp(b.id, body('B2'), NOW).toSnapshot()
    expect(updated.rsvps[0]).toEqual(a)
    expect(updated.rsvps[1]).toMatchObject({ id: b.id, createdAt: 'b', parentsLabel: 'B2' })
    expect(updated.updatedAt).toBe(NOW)

    const removed = both.removeRsvp(b.id, NOW).toSnapshot()
    expect(removed.rsvps).toEqual([a])
    expect(removed.updatedAt).toBe(NOW)

    expect(() => both.updateRsvp('nope', body('X'))).toThrow('Rsvp: not found')
    expect(() => both.removeRsvp('nope')).toThrow('Rsvp: not found')
  })
})

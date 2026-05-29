import { describe, it, expect } from 'vitest'
import { Party } from '@/domain/entities/Party'

function partyWithQuestions() {
  return Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
    now: '2026-05-29T00:00:00.000Z',
  })
    .addQuestion({
      kind: 'adultsCount',
      type: 'number',
      scope: 'family',
      label: 'Adults',
      options: [],
      required: true,
    })
    .addQuestion({
      kind: 'snack',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza', 'Hot dog'],
      required: true,
    })
}

describe('Party.buildRsvp', () => {
  it('builds a valid rsvp with family + per-child answers', () => {
    const p = partyWithQuestions()
    const [adults, snack] = p.toSnapshot().questions
    const rsvp = p.buildRsvp({
      parentsLabel: 'Parents of Leo & Mia',
      familyAnswers: { [adults!.id]: 2 },
      children: [
        { name: 'Leo', answers: { [snack!.id]: 'Pizza' } },
        { name: 'Mia', answers: { [snack!.id]: 'Hot dog' } },
      ],
      now: '2026-05-29T10:00:00.000Z',
    })
    expect(rsvp.children).toHaveLength(2)
    expect(rsvp.familyAnswers[adults!.id]).toBe(2)
    expect(rsvp.children[0]!.answers[snack!.id]).toBe('Pizza')
    expect(rsvp.id).toMatch(/[0-9a-f-]{36}/)
    expect(rsvp.createdAt).toBe('2026-05-29T10:00:00.000Z')
  })

  it('requires at least one child', () => {
    expect(() =>
      partyWithQuestions().buildRsvp({ parentsLabel: 'P', familyAnswers: {}, children: [] }),
    ).toThrow()
  })

  it('rejects a missing required family answer', () => {
    const p = partyWithQuestions()
    const snack = p.toSnapshot().questions[1]!
    expect(() =>
      p.buildRsvp({
        parentsLabel: 'P',
        familyAnswers: {},
        children: [{ name: 'Leo', answers: { [snack.id]: 'Pizza' } }],
      }),
    ).toThrow(/required/i)
  })

  it('rejects a missing required per-child answer', () => {
    const p = partyWithQuestions()
    const adults = p.toSnapshot().questions[0]!
    expect(() =>
      p.buildRsvp({
        parentsLabel: 'P',
        familyAnswers: { [adults.id]: 1 },
        children: [{ name: 'Leo', answers: {} }],
      }),
    ).toThrow(/required/i)
  })

  it('rejects a select answer not in the option list', () => {
    const p = partyWithQuestions()
    const [adults, snack] = p.toSnapshot().questions
    expect(() =>
      p.buildRsvp({
        parentsLabel: 'P',
        familyAnswers: { [adults!.id]: 1 },
        children: [{ name: 'Leo', answers: { [snack!.id]: 'Sushi' } }],
      }),
    ).toThrow(/option/i)
  })
})

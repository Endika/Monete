import { describe, it, expect } from 'vitest'
import { Party } from '@/domain/entities/Party'

function seeded() {
  const p = Party.create({
    title: 'P',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  }).addQuestion({
    kind: 'snack',
    type: 'select',
    scope: 'child',
    label: 'Snack',
    options: ['Pizza', 'Hot dog'],
    required: true,
  })
  const snack = p.toSnapshot().questions[0]!
  const rsvp = p.buildRsvp({
    parentsLabel: 'Fam A',
    familyAnswers: {},
    children: [{ name: 'Leo', answers: { [snack.id]: 'Pizza' } }],
    now: '2026-05-29T00:00:00.000Z',
  })
  return { party: Party.restore({ ...p.toSnapshot(), rsvps: [rsvp] }), rsvp, snackId: snack.id }
}

describe('Party.updateRsvp / removeRsvp', () => {
  it('updates a family by rsvpId, preserving id and createdAt', () => {
    const { party, rsvp, snackId } = seeded()
    const next = party.updateRsvp(
      rsvp.id,
      {
        parentsLabel: 'Fam A (edited)',
        familyAnswers: {},
        children: [{ name: 'Leo', answers: { [snackId]: 'Hot dog' } }],
      },
      '2026-05-30T00:00:00.000Z',
    )
    const out = next.toSnapshot().rsvps[0]!
    expect(out.id).toBe(rsvp.id)
    expect(out.createdAt).toBe(rsvp.createdAt)
    expect(out.parentsLabel).toBe('Fam A (edited)')
    expect(out.children[0]!.answers[snackId]).toBe('Hot dog')
  })

  it('re-validates select options on update', () => {
    const { party, rsvp, snackId } = seeded()
    expect(() =>
      party.updateRsvp(rsvp.id, {
        parentsLabel: 'X',
        familyAnswers: {},
        children: [{ name: 'Leo', answers: { [snackId]: 'Sushi' } }],
      }),
    ).toThrow(/option/i)
  })

  it('throws if rsvpId not found', () => {
    const { party } = seeded()
    expect(() =>
      party.updateRsvp('nope', {
        parentsLabel: 'X',
        familyAnswers: {},
        children: [{ name: 'A', answers: {} }],
      }),
    ).toThrow(/not found/i)
  })

  it('removes a family by rsvpId', () => {
    const { party, rsvp } = seeded()
    expect(party.removeRsvp(rsvp.id).toSnapshot().rsvps).toEqual([])
  })

  it('removeRsvp throws if not found', () => {
    const { party } = seeded()
    expect(() => party.removeRsvp('nope')).toThrow(/not found/i)
  })
})

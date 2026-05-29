import { describe, it, expect } from 'vitest'
import { computeHeadcount } from '@/presentation/utils/headcount'
import { Party } from '@/domain/entities/Party'

function party() {
  return Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
    .addQuestion({
      kind: 'adultsCount',
      type: 'number',
      scope: 'family',
      label: 'Adults',
      options: [],
      required: false,
    })
    .addQuestion({
      kind: 'snack',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza', 'Hot dog'],
      required: true,
    })
    .addQuestion({
      kind: 'allergies',
      type: 'text',
      scope: 'child',
      label: 'Allergies',
      options: [],
      required: false,
    })
}

describe('computeHeadcount', () => {
  it('totals children and adults and lists per-child rows', () => {
    const p = party()
    const [adults, snack, allergies] = p.toSnapshot().questions
    const r1 = p.buildRsvp({
      parentsLabel: 'Fam A',
      familyAnswers: { [adults!.id]: 2 },
      children: [{ name: 'Leo', answers: { [snack!.id]: 'Pizza', [allergies!.id]: 'Nuts' } }],
    })
    const r2 = p.buildRsvp({
      parentsLabel: 'Fam B',
      familyAnswers: { [adults!.id]: 1 },
      children: [
        { name: 'Mia', answers: { [snack!.id]: 'Hot dog', [allergies!.id]: '' } },
        { name: 'Sam', answers: { [snack!.id]: 'Pizza', [allergies!.id]: '' } },
      ],
    })
    const hc = computeHeadcount({ ...p.toSnapshot(), rsvps: [r1, r2] })
    expect(hc.totalChildren).toBe(3)
    expect(hc.totalAdults).toBe(3)
    expect(hc.children.map((c) => c.name)).toEqual(['Leo', 'Mia', 'Sam'])
    expect(hc.children[0]!.snack).toBe('Pizza')
    expect(hc.children[0]!.allergies).toBe('Nuts')
  })

  it('treats missing adults answers as zero', () => {
    const p = party()
    const snack = p.toSnapshot().questions[1]!
    const r = p.buildRsvp({
      parentsLabel: 'Fam',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [snack.id]: 'Pizza' } }],
    })
    expect(computeHeadcount({ ...p.toSnapshot(), rsvps: [r] }).totalAdults).toBe(0)
  })
})

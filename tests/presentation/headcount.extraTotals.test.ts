import { describe, it, expect } from 'vitest'
import { computeHeadcount } from '@/presentation/utils/headcount'
import { Party } from '@/domain/entities/Party'

describe('headcount extraTotals', () => {
  it('sums family-scope number questions (except adultsCount) by label', () => {
    const p = Party.create({
      title: 'P',
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
        kind: 'custom',
        type: 'number',
        scope: 'family',
        label: 'Perros',
        options: [],
        required: false,
      })
    const [adults, dogs] = p.toSnapshot().questions
    const r1 = p.buildRsvp({
      parentsLabel: 'A',
      familyAnswers: { [adults!.id]: 2, [dogs!.id]: 1 },
      children: [{ name: 'Leo', answers: {} }],
    })
    const r2 = p.buildRsvp({
      parentsLabel: 'B',
      familyAnswers: { [adults!.id]: 1, [dogs!.id]: 2 },
      children: [{ name: 'Mia', answers: {} }],
    })
    const hc = computeHeadcount({ ...p.toSnapshot(), rsvps: [r1, r2] })
    expect(hc.totalAdults).toBe(3)
    expect(hc.extraTotals).toEqual([{ label: 'Perros', total: 3 }])
  })

  it('returns [] extraTotals when there are no extra numeric family questions', () => {
    const p = Party.create({
      title: 'P',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    expect(computeHeadcount(p.toSnapshot()).extraTotals).toEqual([])
  })
})

import { describe, it, expect } from 'vitest'
import { computeHeadcount } from '@/presentation/utils/headcount'
import { Party } from '@/domain/entities/Party'

describe('headcount breakdown', () => {
  it('splits children into invited and siblings', () => {
    const p = Party.create({
      title: 'P',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    }).addQuestion({
      kind: 'adultsCount',
      type: 'number',
      scope: 'family',
      label: 'Adults',
      options: [],
      required: false,
    })
    const adults = p.toSnapshot().questions[0]!
    const r = p.buildRsvp({
      parentsLabel: 'F',
      familyAnswers: { [adults.id]: 2 },
      children: [
        { name: 'Leo', answers: {} },
        { name: 'Mia', answers: {}, isSibling: true },
      ],
    })
    const hc = computeHeadcount({ ...p.toSnapshot(), rsvps: [r] })
    expect(hc.totalChildren).toBe(2)
    expect(hc.totalInvited).toBe(1)
    expect(hc.totalSiblings).toBe(1)
    expect(hc.totalAdults).toBe(2)
    expect(hc.children[1]!.isSibling).toBe(true)
  })
})

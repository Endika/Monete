import { describe, it, expect } from 'vitest'
import { computeHeadcount } from '@/presentation/utils/headcount'
import { Party } from '@/domain/entities/Party'

const ask = (
  kind: 'adultsCount' | 'snack' | 'allergies' | 'custom',
  type: 'number' | 'select' | 'text',
  scope: 'family' | 'child',
  label: string,
  options: string[] = [],
) => ({ kind, type, scope, label, options, required: false })

function party() {
  return Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
    .addQuestion(ask('adultsCount', 'number', 'family', 'Adults'))
    .addQuestion(ask('snack', 'select', 'child', 'Snack', ['Pizza', 'Hot dog']))
    .addQuestion(ask('allergies', 'text', 'child', 'Allergies'))
    .addQuestion(ask('custom', 'number', 'family', 'Perros'))
    .addQuestion(ask('custom', 'number', 'child', 'Shoe size'))
    .addQuestion(ask('custom', 'select', 'family', 'Transport', ['Car', 'Bus']))
}

describe('computeHeadcount', () => {
  it('totals children, siblings, adults and the extra family numbers, row by row', () => {
    const p = party()
    const [adults, snack, allergies, dogs, shoes, transport] = p.toSnapshot().questions
    const r1 = p.buildRsvp({
      parentsLabel: 'Fam A',
      familyAnswers: { [adults!.id]: 2, [dogs!.id]: 1, [transport!.id]: 'Car' },
      children: [
        {
          name: 'Leo',
          answers: { [snack!.id]: 'Pizza', [allergies!.id]: 'Nuts', [shoes!.id]: 30 },
        },
      ],
    })
    const r2 = p.buildRsvp({
      parentsLabel: 'Fam B',
      familyAnswers: { [dogs!.id]: 2 },
      children: [
        { name: 'Mia', answers: { [allergies!.id]: '' } },
        { name: 'Sam', answers: { [snack!.id]: 'Hot dog' }, isSibling: true },
      ],
    })
    const hc = computeHeadcount({ ...p.toSnapshot(), rsvps: [r1, r2] })
    expect(hc).toMatchObject({
      totalChildren: 3,
      totalInvited: 2,
      totalSiblings: 1,
      totalAdults: 2,
    })
    expect(hc.extraTotals).toEqual([{ label: 'Perros', total: 3 }])
    expect(hc.children.map(({ id: _id, ...row }) => row)).toEqual([
      {
        name: 'Leo',
        parentsLabel: 'Fam A',
        snack: 'Pizza',
        allergies: 'Nuts',
        isSibling: false,
        isBirthday: false,
      },
      {
        name: 'Mia',
        parentsLabel: 'Fam B',
        snack: null,
        allergies: null,
        isSibling: false,
        isBirthday: false,
      },
      {
        name: 'Sam',
        parentsLabel: 'Fam B',
        snack: 'Hot dog',
        allergies: null,
        isSibling: true,
        isBirthday: false,
      },
    ])
  })

  it('collects deduped birthdayNames and flags ChildRow.isBirthday', () => {
    const p = party()
    const r1 = p.buildRsvp({
      parentsLabel: 'F1',
      familyAnswers: {},
      children: [
        { name: 'Leo', answers: {}, isBirthday: true },
        { name: 'Mia', answers: {} },
      ],
    })
    const r2 = p.buildRsvp({
      parentsLabel: 'F2',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: {}, isBirthday: true }],
    })
    const hc = computeHeadcount({ ...p.toSnapshot(), rsvps: [r1, r2] })
    expect(hc.children.map((c) => c.isBirthday)).toEqual([true, false, true])
    expect(hc.birthdayNames).toEqual(['Leo'])
  })
})

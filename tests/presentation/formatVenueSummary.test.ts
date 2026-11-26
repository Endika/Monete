import { describe, it, expect } from 'vitest'
import { formatVenueSummary } from '@/presentation/utils/formatVenueSummary'
import type { Headcount } from '@/presentation/utils/headcount'

const t = (key: string, vars?: Record<string, unknown>) =>
  vars ? `${key}:${JSON.stringify(vars)}` : key

const emptyHc: Headcount = {
  totalChildren: 0,
  totalInvited: 0,
  totalSiblings: 0,
  totalAdults: 0,
  children: [],
  birthdayNames: [],
  extraTotals: [],
}

describe('formatVenueSummary', () => {
  it('renders the exact summary with extra totals and every child combination', () => {
    const child = (name: string, snack: string | null, allergies: string | null) => ({
      id: name,
      name,
      parentsLabel: '',
      snack,
      allergies,
      isSibling: false,
      isBirthday: false,
    })
    const hc: Headcount = {
      ...emptyHc,
      totalChildren: 4,
      totalInvited: 3,
      totalSiblings: 1,
      totalAdults: 2,
      children: [
        child('A', 'Pizza', 'Nuts'),
        child('B', 'Pizza', null),
        child('C', null, 'Nuts'),
        child('D', null, null),
      ],
      extraTotals: [{ label: 'Grandparents', total: 2 }],
    }
    const text = formatVenueSummary(
      { title: 'T', startsAt: 'S', venueName: 'V', address: 'Ad', requirements: 'Socks' },
      hc,
      t,
    )
    expect(text).toBe(
      [
        '🎂 T — S',
        '📍 V — Ad',
        '⚠️ Socks',
        '',
        'venue.breakdown:{"children":4,"invited":3,"siblings":1,"adults":2}',
        'Grandparents: 2',
        '• A — venue.snack:{"snack":"Pizza"} — venue.allergies:{"allergies":"Nuts"}',
        '• B — venue.snack:{"snack":"Pizza"}',
        '• C — venue.allergies:{"allergies":"Nuts"}',
        '• D',
      ].join('\n'),
    )
  })

  it('omits location and requirements lines when empty', () => {
    const text = formatVenueSummary(
      { title: 'T', startsAt: 'S', venueName: '', address: '', requirements: '' },
      emptyHc,
      t,
    )
    expect(text).toBe(
      '🎂 T — S\n\nvenue.breakdown:{"children":0,"invited":0,"siblings":0,"adults":0}',
    )
  })
})

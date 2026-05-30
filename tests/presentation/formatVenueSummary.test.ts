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
  it('renders header, totals, per-child rows and requirements', () => {
    const hc: Headcount = {
      totalChildren: 2,
      totalInvited: 1,
      totalSiblings: 1,
      totalAdults: 3,
      children: [
        {
          id: 'c1',
          name: 'Leo',
          parentsLabel: 'Fam A',
          snack: 'Pizza',
          allergies: 'Nuts',
          isSibling: false,
          isBirthday: true,
        },
        {
          id: 'c2',
          name: 'Mia',
          parentsLabel: 'Fam B',
          snack: 'Hot dog',
          allergies: null,
          isSibling: true,
          isBirthday: false,
        },
      ],
      birthdayNames: ['Leo'],
      extraTotals: [],
    }
    const text = formatVenueSummary(
      {
        title: 'Leo turns 5',
        startsAt: '2026-06-20T17:00:00.000Z',
        venueName: '',
        address: 'Fun Park',
        requirements: 'Non-slip socks',
      },
      hc,
      t,
    )
    expect(text).toContain('Leo turns 5')
    expect(text).toContain('Fun Park')
    expect(text).toContain('Non-slip socks')
    expect(text).toContain('invited')
    expect(text).toContain('Leo')
    expect(text).toContain('Pizza')
    expect(text).toContain('Nuts')
    expect(text.split('\n').filter((l) => l.includes('•'))).toHaveLength(2)
  })

  it('renders "venue — address" when both venueName and address are present', () => {
    const text = formatVenueSummary(
      {
        title: 'P',
        startsAt: 'x',
        venueName: 'Jungle Park',
        address: 'Calle Mayor 5',
        requirements: '',
      },
      emptyHc,
      t,
    )
    expect(text).toContain('📍 Jungle Park — Calle Mayor 5')
  })

  it('renders just the venue name when address is empty', () => {
    const text = formatVenueSummary(
      { title: 'P', startsAt: 'x', venueName: 'Jungle Park', address: '', requirements: '' },
      emptyHc,
      t,
    )
    expect(text).toContain('📍 Jungle Park')
    expect(text.split('\n').find((l) => l.startsWith('📍'))).toBe('📍 Jungle Park')
  })

  it('renders just the address when there is no venue name', () => {
    const text = formatVenueSummary(
      { title: 'P', startsAt: 'x', venueName: '', address: 'Calle Mayor 5', requirements: '' },
      emptyHc,
      t,
    )
    expect(text).toContain('📍 Calle Mayor 5')
    expect(text.split('\n').find((l) => l.startsWith('📍'))).toBe('📍 Calle Mayor 5')
  })
})

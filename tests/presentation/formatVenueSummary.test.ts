import { describe, it, expect } from 'vitest'
import { formatVenueSummary } from '@/presentation/utils/formatVenueSummary'
import type { Headcount } from '@/presentation/utils/headcount'

const t = (key: string, vars?: Record<string, unknown>) =>
  vars ? `${key}:${JSON.stringify(vars)}` : key

describe('formatVenueSummary', () => {
  it('renders header, totals, per-child rows and requirements', () => {
    const hc: Headcount = {
      totalChildren: 2,
      totalInvited: 1,
      totalSiblings: 1,
      totalAdults: 3,
      children: [
        { name: 'Leo', parentsLabel: 'Fam A', snack: 'Pizza', allergies: 'Nuts', isSibling: false },
        { name: 'Mia', parentsLabel: 'Fam B', snack: 'Hot dog', allergies: null, isSibling: true },
      ],
    }
    const text = formatVenueSummary(
      {
        title: 'Leo turns 5',
        startsAt: '2026-06-20T17:00:00.000Z',
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
})

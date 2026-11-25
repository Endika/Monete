import { describe, it, expect } from 'vitest'
import { formatEventStart } from '@/presentation/utils/formatEventStart'

describe('formatEventStart', () => {
  it('shows the time of a timed event and only the day of an all-day one', () => {
    const startsAt = new Date(2026, 5, 20, 17, 0).toISOString()
    expect(formatEventStart({ startsAt, allDay: false }, 'en-GB')).toMatch(
      /^Saturday,? 20 June 2026 at 17:00$/,
    )
    expect(formatEventStart({ startsAt, allDay: true }, 'en-GB')).toMatch(
      /^Saturday,? 20 June 2026$/,
    )
  })
})

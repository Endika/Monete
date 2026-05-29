import { describe, it, expect } from 'vitest'
import { buildIcs, buildGoogleCalendarUrl } from '@/presentation/utils/calendarLink'

const allDay = { title: 'Party', address: 'Home', startsAt: '2026-06-20T10:00:00.000Z', endsAt: null, allDay: true }

describe('all-day calendar', () => {
  it('ics uses VALUE=DATE for all-day', () => {
    const ics = buildIcs(allDay)
    expect(ics).toMatch(/DTSTART;VALUE=DATE:\d{8}/)
    expect(ics).toMatch(/DTEND;VALUE=DATE:\d{8}/)
    expect(ics).not.toContain('DTSTART:') // no timed DTSTART
  })

  it('google url uses a date-only range for all-day', () => {
    const url = buildGoogleCalendarUrl(allDay)
    expect(url).toMatch(/dates=\d{8}%2F\d{8}/) // YYYYMMDD/YYYYMMDD, no T..Z
  })
})

import { describe, it, expect } from 'vitest'
import {
  buildIcs,
  buildGoogleCalendarUrl,
  toCalendarStamp,
} from '@/presentation/utils/calendarLink'
import { whatsAppShareUrl } from '@/presentation/utils/shareWhatsApp'

const event = {
  title: 'Leo turns 5',
  address: 'Fun Park 12',
  startsAt: '2026-06-20T17:00:00.000Z',
  endsAt: '2026-06-20T19:00:00.000Z',
}

describe('calendar links', () => {
  it('formats an ISO date to a UTC calendar stamp', () => {
    expect(toCalendarStamp('2026-06-20T17:00:00.000Z')).toBe('20260620T170000Z')
  })

  it('builds an ics string with title, location and times', () => {
    const ics = buildIcs(event)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('SUMMARY:Leo turns 5')
    expect(ics).toContain('LOCATION:Fun Park 12')
    expect(ics).toContain('DTSTART:20260620T170000Z')
    expect(ics).toContain('DTEND:20260620T190000Z')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('defaults end to start + 2h when endsAt is null', () => {
    const ics = buildIcs({ ...event, endsAt: null })
    expect(ics).toContain('DTEND:20260620T190000Z')
  })

  it('builds a google calendar render url', () => {
    const url = buildGoogleCalendarUrl(event)
    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE')
    expect(url).toContain('text=Leo+turns+5')
    expect(url).toContain('dates=20260620T170000Z%2F20260620T190000Z')
    expect(url).toContain('location=Fun+Park+12')
  })

  it('builds a wa.me share url', () => {
    expect(whatsAppShareUrl('hello world')).toBe('https://wa.me/?text=hello%20world')
  })
})

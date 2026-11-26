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

const allDay = (start: Date, end: Date | null) => ({
  title: 'Party',
  address: 'Home',
  startsAt: start.toISOString(),
  endsAt: end?.toISOString() ?? null,
  allDay: true,
})

const lines = (ics: string, prefix: string) => ics.split('\r\n').filter((l) => l.startsWith(prefix))

describe('calendar links', () => {
  it('builds the whole ics, escaping what the format reserves', () => {
    expect(
      buildIcs({ ...event, title: 'Leo; turns, 5', address: 'Fun Park\\12\nFloor 1' }).split(
        '\r\n',
      ),
    ).toEqual([
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Monete//EN',
      'BEGIN:VEVENT',
      'UID:20260620T170000Z-1152223910@monete',
      'DTSTAMP:20260620T170000Z',
      'DTSTART:20260620T170000Z',
      'DTEND:20260620T190000Z',
      'SUMMARY:Leo\\; turns\\, 5',
      'LOCATION:Fun Park\\\\12\\nFloor 1',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Leo\\; turns\\, 5',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ])
  })

  it('defaults end to start + 2h when endsAt is null', () => {
    expect(lines(buildIcs({ ...event, endsAt: null }), 'DTEND')).toEqual(['DTEND:20260620T190000Z'])
  })

  it('builds a google calendar render url', () => {
    expect(buildGoogleCalendarUrl(event)).toBe(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Leo+turns+5' +
        '&dates=20260620T170000Z%2F20260620T190000Z&location=Fun+Park+12',
    )
  })

  it('spans all-day events by local date, ending the day after the last one', () => {
    const oneDay = allDay(new Date(2026, 0, 31, 10), null)
    expect(lines(buildIcs(oneDay), 'DT')).toEqual([
      'DTSTAMP:' + toCalendarStamp(oneDay.startsAt),
      'DTSTART;VALUE=DATE:20260131',
      'DTEND;VALUE=DATE:20260201',
    ])
    const newYear = allDay(new Date(2026, 11, 30, 10), new Date(2026, 11, 31, 10))
    expect(buildGoogleCalendarUrl(newYear)).toContain('dates=20261230%2F20270101')
  })

  it('builds a wa.me share url', () => {
    expect(whatsAppShareUrl('hello world')).toBe('https://wa.me/?text=hello%20world')
  })
})

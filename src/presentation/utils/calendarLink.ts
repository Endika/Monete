export interface CalendarEvent {
  title: string
  address: string
  startsAt: string
  endsAt: string | null
  allDay?: boolean
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

function toDateStamp(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}

function nextDay(stamp: string): string {
  const y = +stamp.slice(0, 4),
    m = +stamp.slice(4, 6),
    d = +stamp.slice(6, 8)
  const next = new Date(y, m - 1, d + 1)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${next.getFullYear()}${p(next.getMonth() + 1)}${p(next.getDate())}`
}

export function toCalendarStamp(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

function resolveEnd(event: CalendarEvent): string {
  return event.endsAt ?? new Date(new Date(event.startsAt).getTime() + TWO_HOURS_MS).toISOString()
}

export function buildIcs(event: CalendarEvent): string {
  const stamp = toCalendarStamp(event.startsAt)
  const uid = `${stamp}-${Math.abs(hashString(event.title))}@monete`
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

  let dtStart: string
  let dtEnd: string
  if (event.allDay) {
    const startStamp = toDateStamp(event.startsAt)
    const endStamp = event.endsAt ? nextDay(toDateStamp(event.endsAt)) : nextDay(startStamp)
    dtStart = `DTSTART;VALUE=DATE:${startStamp}`
    dtEnd = `DTEND;VALUE=DATE:${endStamp}`
  } else {
    dtStart = `DTSTART:${toCalendarStamp(event.startsAt)}`
    dtEnd = `DTEND:${toCalendarStamp(resolveEnd(event))}`
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Monete//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    dtStart,
    dtEnd,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(event.address)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  let dates: string
  if (event.allDay) {
    const startStamp = toDateStamp(event.startsAt)
    const endStamp = event.endsAt ? nextDay(toDateStamp(event.endsAt)) : nextDay(startStamp)
    dates = `${startStamp}/${endStamp}`
  } else {
    dates = `${toCalendarStamp(event.startsAt)}/${toCalendarStamp(resolveEnd(event))}`
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    location: event.address,
  })
  // URLSearchParams encodes spaces as '+', which Google Calendar accepts.
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function isAndroid(ua: string): boolean {
  return /android/i.test(ua)
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

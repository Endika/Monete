export interface CalendarEvent {
  title: string
  address: string
  startsAt: string
  endsAt: string | null
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

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
  const start = toCalendarStamp(event.startsAt)
  const end = toCalendarStamp(resolveEnd(event))
  const stamp = toCalendarStamp(event.startsAt)
  const uid = `${start}-${Math.abs(hashString(event.title))}@monete`
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Monete//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
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
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarStamp(event.startsAt)}/${toCalendarStamp(resolveEnd(event))}`,
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

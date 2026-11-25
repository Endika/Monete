export interface CalendarEvent {
  title: string
  address: string
  startsAt: string
  endsAt: string | null
  allDay?: boolean
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

function toDateStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}

export function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
}

function resolveEnd(event: CalendarEvent): string {
  return event.endsAt ?? new Date(new Date(event.startsAt).getTime() + TWO_HOURS_MS).toISOString()
}

/** Start and end stamps; an all-day range is local dates with the end day exclusive. */
function eventStamps(event: CalendarEvent): [string, string] {
  if (!event.allDay) return [toCalendarStamp(event.startsAt), toCalendarStamp(resolveEnd(event))]
  const last = new Date(event.endsAt ?? event.startsAt)
  const dayAfter = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
  return [toDateStamp(new Date(event.startsAt)), toDateStamp(dayAfter)]
}

export function buildIcs(event: CalendarEvent): string {
  const stamp = toCalendarStamp(event.startsAt)
  const uid = `${stamp}-${Math.abs(hashString(event.title))}@monete`
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

  const [start, end] = eventStamps(event)
  const value = event.allDay ? ';VALUE=DATE' : ''

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Monete//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART${value}:${start}`,
    `DTEND${value}:${end}`,
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
  const [start, end] = eventStamps(event)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    location: event.address,
  })
  // URLSearchParams encodes spaces as '+', which Google Calendar accepts.
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function hashString(s: string): number {
  let h = 0
  // Stryker disable next-line ArithmeticOperator: subtracting each char only flips the sign, which Math.abs drops
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

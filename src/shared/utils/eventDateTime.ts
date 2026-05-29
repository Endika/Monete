export interface DateTimeFields {
  startDate: string // YYYY-MM-DD
  startTime: string // HH:mm or ''
  endDate: string // YYYY-MM-DD or ''
  endTime: string // HH:mm or ''
}

export interface ComposedTimes {
  startsAt: string
  endsAt: string | null
  allDay: boolean
}

function toIso(date: string, time: string): string {
  // Store as local ISO datetime (no UTC conversion) to match datetime-local
  // input behaviour and keep date strings timezone-stable.
  return `${date}T${time}:00`
}

export function composeEventTimes(f: DateTimeFields): ComposedTimes {
  const allDay = !f.startTime
  const startsAt = toIso(f.startDate, f.startTime || '00:00')
  let endsAt: string | null = null
  if (f.endTime) endsAt = toIso(f.endDate || f.startDate, f.endTime)
  else if (f.endDate) endsAt = toIso(f.endDate, f.startTime || '00:00')
  return { startsAt, endsAt, allDay }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function localDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function localTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function splitEventTimes(c: ComposedTimes): DateTimeFields {
  const startDate = localDate(c.startsAt)
  const startTime = c.allDay ? '' : localTime(c.startsAt)
  const endDateRaw = c.endsAt ? localDate(c.endsAt) : ''
  const endTime = c.endsAt && !c.allDay ? localTime(c.endsAt) : ''
  return { startDate, startTime, endDate: endDateRaw === startDate ? '' : endDateRaw, endTime }
}

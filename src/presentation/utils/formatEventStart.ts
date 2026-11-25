export function formatEventStart(
  event: { startsAt: string; allDay: boolean },
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: event.allDay ? undefined : 'short',
  }).format(new Date(event.startsAt))
}

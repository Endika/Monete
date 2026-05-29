import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/presentation/components/common/Button'
import {
  buildGoogleCalendarUrl,
  buildIcs,
  type CalendarEvent,
} from '@/presentation/utils/calendarLink'

interface Props {
  event: CalendarEvent
}

export function AddToCalendarButton({ event }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  function handleGoogle() {
    window.open(buildGoogleCalendarUrl(event), '_blank')
    setOpen(false)
  }

  function handleIcs() {
    const icsContent = buildIcs(event)
    const a = document.createElement('a')
    a.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
    a.download = 'event.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <Button onClick={() => setOpen((o) => !o)}>{t('calendar.addTo')}</Button>
      {open && (
        <div className="flex flex-col gap-2 rounded-2xl border border-cocoa/10 bg-cream p-2 shadow-lg w-full max-w-xs">
          <Button type="button" variant="ghost" onClick={handleGoogle}>
            {t('calendar.google')}
          </Button>
          <Button type="button" variant="ghost" onClick={handleIcs}>
            {t('calendar.appleOutlook')}
          </Button>
        </div>
      )}
    </div>
  )
}

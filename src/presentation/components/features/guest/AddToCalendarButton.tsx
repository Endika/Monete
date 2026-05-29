import { useTranslation } from 'react-i18next'
import { Button } from '@/presentation/components/common/Button'
import {
  buildGoogleCalendarUrl,
  buildIcs,
  isAndroid,
  type CalendarEvent,
} from '@/presentation/utils/calendarLink'

interface Props {
  event: CalendarEvent
  userAgent?: string
}

export function AddToCalendarButton({ event, userAgent }: Props) {
  const { t } = useTranslation()
  const ua = userAgent ?? navigator.userAgent

  function handleClick() {
    if (isAndroid(ua)) {
      window.open(buildGoogleCalendarUrl(event), '_blank')
    } else {
      const icsContent = buildIcs(event)
      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'event.ics'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return <Button onClick={handleClick}>{t('guest.addToCalendar')}</Button>
}

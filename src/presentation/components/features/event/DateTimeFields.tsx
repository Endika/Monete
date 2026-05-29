import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DateTimeFields as DateTimeFieldsType } from '@/shared/utils/eventDateTime'

interface DateTimeFieldsProps {
  value: DateTimeFieldsType
  onChange: (v: DateTimeFieldsType) => void
}

export function DateTimeFields({ value, onChange }: DateTimeFieldsProps) {
  const { t } = useTranslation()
  // Track whether the "ends another day" checkbox is checked independently
  // so the user can check it before typing a date
  const [endsAnotherDay, setEndsAnotherDay] = useState(!!value.endDate)

  const handleStartDateChange = (startDate: string) => {
    onChange({ ...value, startDate })
  }

  const handleStartTimeChange = (startTime: string) => {
    onChange({ ...value, startTime })
  }

  const handleEndTimeChange = (endTime: string) => {
    onChange({ ...value, endTime })
  }

  const handleEndsAnotherDayChange = (checked: boolean) => {
    setEndsAnotherDay(checked)
    if (!checked) {
      onChange({ ...value, endDate: '' })
    }
  }

  const handleEndDateChange = (endDate: string) => {
    onChange({ ...value, endDate })
  }

  const showEndDate = endsAnotherDay || !!value.endDate

  return (
    <div className="flex flex-col gap-3">
      {/* Date */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide">
          {t('home.dateLabel')}
        </span>
        <input
          type="date"
          required
          value={value.startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa placeholder:text-cocoa/40 transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
        />
      </label>

      {/* Start / End time row */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide shrink-0">
          {t('home.fromTime')}
        </span>
        <input
          type="time"
          aria-label={t('home.fromTime')}
          value={value.startTime}
          onChange={(e) => handleStartTimeChange(e.target.value)}
          className="rounded-2xl border-2 border-cocoa/15 bg-white px-3 py-2 text-sm text-cocoa transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
        />
        <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide shrink-0">
          {t('home.toTime')}
        </span>
        <input
          type="time"
          aria-label={t('home.toTime')}
          value={value.endTime}
          onChange={(e) => handleEndTimeChange(e.target.value)}
          className="rounded-2xl border-2 border-cocoa/15 bg-white px-3 py-2 text-sm text-cocoa transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
        />
      </div>

      {/* Ends another day checkbox */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showEndDate}
          onChange={(e) => handleEndsAnotherDayChange(e.target.checked)}
          className="w-4 h-4 accent-raspberry"
        />
        <span className="text-sm font-body text-cocoa/80">{t('home.endsAnotherDay')}</span>
      </label>

      {/* End date (conditional) */}
      {showEndDate && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide">
            {t('home.endDateLabel')}
          </span>
          <input
            type="date"
            value={value.endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa placeholder:text-cocoa/40 transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
          />
        </label>
      )}
    </div>
  )
}

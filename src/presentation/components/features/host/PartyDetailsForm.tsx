import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { DateTimeFields } from '@/presentation/components/features/event/DateTimeFields'
import { AddressAutocomplete } from '@/presentation/components/features/event/AddressAutocomplete'
import { composeEventTimes, splitEventTimes } from '@/shared/utils/eventDateTime'
import type { DateTimeFields as DateTimeFieldsType } from '@/shared/utils/eventDateTime'
import { useSubmitting } from '@/presentation/hooks/useSubmitting'

interface PartyDetailsFormProps {
  initial: {
    title: string
    address: string
    startsAt: string
    endsAt: string | null
    requirements: string
    allDay: boolean
    lat?: number | null
    lng?: number | null
  }
  onSave: (details: {
    title: string
    address: string
    startsAt: string
    endsAt: string | null
    requirements: string
    allDay: boolean
    lat: number | null
    lng: number | null
  }) => void | Promise<void>
}

export function PartyDetailsForm({ initial, onSave }: PartyDetailsFormProps) {
  const { t } = useTranslation()
  const { status, run } = useSubmitting()
  const [title, setTitle] = useState(initial.title)
  const [address, setAddress] = useState(initial.address)
  const [lat, setLat] = useState<number | null>(initial.lat ?? null)
  const [lng, setLng] = useState<number | null>(initial.lng ?? null)
  const [fields, setFields] = useState<DateTimeFieldsType>(() =>
    splitEventTimes({
      startsAt: initial.startsAt,
      endsAt: initial.endsAt,
      allDay: initial.allDay,
    }),
  )
  const [requirements, setRequirements] = useState(initial.requirements)

  const handleSave = () => {
    const { startsAt, endsAt, allDay } = composeEventTimes(fields)
    void run(async () => {
      await onSave({ title, address, startsAt, endsAt, requirements, allDay, lat, lng })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label={t('home.titleLabel')}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('home.titlePlaceholder')}
        required
      />
      <AddressAutocomplete
        value={address}
        lat={lat}
        lng={lng}
        onChange={({ address: a, lat: la, lng: ln }) => {
          setAddress(a)
          setLat(la)
          setLng(ln)
        }}
      />
      <DateTimeFields value={fields} onChange={setFields} />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide">
          {t('home.requirementsLabel')}
        </span>
        <textarea
          className="w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa placeholder:text-cocoa/40 transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder={t('home.requirementsPlaceholder')}
          rows={3}
        />
      </label>
      <Button type="button" onClick={handleSave} disabled={status === 'submitting'}>
        {status === 'submitting'
          ? t('common.saving')
          : status === 'saved'
            ? t('common.saved')
            : t('common.save')}
      </Button>
    </div>
  )
}

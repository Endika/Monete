import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'

interface PartyDetailsFormProps {
  initial: {
    title: string
    address: string
    startsAt: string
    endsAt: string | null
    requirements: string
  }
  onSave: (details: {
    title: string
    address: string
    startsAt: string
    endsAt: string | null
    requirements: string
  }) => void
}

function isoToInput(iso: string | null | undefined): string {
  return iso ? new Date(iso).toISOString().slice(0, 16) : ''
}

function inputToIso(value: string): string {
  return new Date(value).toISOString()
}

function inputToIsoOrNull(value: string): string | null {
  return value ? new Date(value).toISOString() : null
}

export function PartyDetailsForm({ initial, onSave }: PartyDetailsFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initial.title)
  const [address, setAddress] = useState(initial.address)
  const [startsAt, setStartsAt] = useState(isoToInput(initial.startsAt))
  const [endsAt, setEndsAt] = useState(isoToInput(initial.endsAt))
  const [requirements, setRequirements] = useState(initial.requirements)

  const handleSave = () => {
    onSave({
      title,
      address,
      startsAt: inputToIso(startsAt),
      endsAt: inputToIsoOrNull(endsAt),
      requirements,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label={t('home.titleLabel')}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        label={t('home.addressLabel')}
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Input
        label={t('home.startsAtLabel')}
        type="datetime-local"
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
        required
      />
      <Input
        label={t('home.endsAtLabel')}
        type="datetime-local"
        value={endsAt}
        onChange={(e) => setEndsAt(e.target.value)}
      />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">{t('home.requirementsLabel')}</span>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
        />
      </label>
      <Button type="button" onClick={handleSave}>
        {t('common.save')}
      </Button>
    </div>
  )
}

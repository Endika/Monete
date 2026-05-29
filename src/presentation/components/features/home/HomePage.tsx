import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContainer } from '@/presentation/context/ContainerProvider'
import type { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'
import { MonkeyMascot } from '@/presentation/components/common/MonkeyMascot'
import { DateTimeFields } from '@/presentation/components/features/event/DateTimeFields'
import { composeEventTimes } from '@/shared/utils/eventDateTime'
import type { DateTimeFields as DateTimeFieldsType } from '@/shared/utils/eventDateTime'

export function HomePage({ onCreated }: { onCreated: (id: string) => void }) {
  const { t } = useTranslation()
  const container = useContainer()

  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [fields, setFields] = useState<DateTimeFieldsType>({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  })
  const [requirements, setRequirements] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fields.startDate) return
    try {
      const { startsAt, endsAt, allDay } = composeEventTimes(fields)
      const result = await container.resolve<CreatePartyHandler>('createParty').execute({
        title,
        address,
        startsAt,
        endsAt,
        requirements,
        allDay,
      })
      onCreated(result.party.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 flex flex-col items-center gap-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.5s_ease-out]">
        <MonkeyMascot className="w-32 h-32 drop-shadow-lg" />
        <h1 className="font-display text-5xl font-extrabold text-cocoa tracking-tight leading-none">
          {t('home.title')}
        </h1>
        <p className="font-body text-cocoa/70 text-center text-base max-w-xs leading-relaxed">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Decorative confetti row */}
      <div className="flex gap-2" aria-hidden>
        <span className="w-3 h-3 rounded-full bg-raspberry inline-block" />
        <span className="w-3 h-3 rounded-full bg-banana inline-block" />
        <span className="w-3 h-3 rounded-full bg-mint inline-block" />
        <span className="w-3 h-3 rounded-full bg-sky inline-block" />
        <span className="w-3 h-3 rounded-full bg-grape inline-block" />
      </div>

      {/* Form card */}
      <div className="w-full bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-8 flex flex-col gap-5">
        <h2 className="font-display text-xl font-bold text-cocoa">{t('home.createCta')}</h2>

        <ErrorBanner message={error} />

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          <DateTimeFields value={fields} onChange={setFields} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide">
              {t('home.requirementsLabel')}
            </span>
            <textarea
              className="w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa placeholder:text-cocoa/40 transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
            />
          </label>
          <Button type="submit" className="mt-2 w-full">
            {t('home.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}

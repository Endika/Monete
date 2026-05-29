import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParty } from '@/presentation/context/PartyContext'
import { useContainer } from '@/presentation/context/ContainerProvider'
import type { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'
import { AddToCalendarButton } from './AddToCalendarButton'
import { RsvpForm } from './RsvpForm'

interface GuestPageProps {
  partyId: string
}

export function GuestPage({ partyId }: GuestPageProps) {
  const { t, i18n } = useTranslation()
  const { snapshot, loading } = useParty()
  const container = useContainer()
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (loading) return <div>Loading…</div>
  if (!snapshot) return <div>Not found</div>

  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(snapshot.event.startsAt))

  const calendarEvent = {
    title: snapshot.event.title,
    address: snapshot.event.address,
    startsAt: snapshot.event.startsAt,
    endsAt: snapshot.event.endsAt,
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">{snapshot.event.title}</h1>
      <p className="text-sm text-gray-600">{formattedDate}</p>
      <p className="text-sm text-gray-600">{snapshot.event.address}</p>
      {snapshot.event.requirements && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {snapshot.event.requirements}
        </div>
      )}
      <AddToCalendarButton event={calendarEvent} />

      {submitted ? (
        <div className="flex flex-col gap-4">
          <p className="text-green-700 font-medium">{t('guest.thanks')}</p>
        </div>
      ) : (
        <>
          <RsvpForm
            snapshot={snapshot}
            onSubmit={async (input) => {
              try {
                await container
                  .resolve<SubmitRsvpHandler>('submitRsvp')
                  .execute({ partyId, ...input })
                setSubmitted(true)
              } catch (e) {
                setSubmitError(e instanceof Error ? e.message : String(e))
              }
            }}
          />
          <ErrorBanner message={submitError} />
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParty } from '@/presentation/context/PartyContext'
import { useContainer } from '@/presentation/context/ContainerProvider'
import type { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'
import { AddToCalendarButton } from './AddToCalendarButton'
import { RsvpForm } from './RsvpForm'
import { MonkeyMascot } from '@/presentation/components/common/MonkeyMascot'
import { googleMapsUrl } from '@/shared/utils/googleMapsUrl'

interface GuestPageProps {
  partyId: string
}

export function GuestPage({ partyId }: GuestPageProps) {
  const { t, i18n } = useTranslation()
  const { snapshot, loading } = useParty()
  const container = useContainer()
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (loading)
    return <div className="p-8 text-center text-cocoa/60 font-body">{t('common.loading')}</div>
  if (!snapshot) return <div className="p-8 text-center text-cocoa/60 font-body">Not found</div>

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
      {/* Event header card */}
      <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] overflow-hidden">
        {/* Accent strip */}
        <div className="h-2 bg-gradient-to-r from-raspberry via-banana to-mint" />
        <div className="p-6 flex flex-col gap-3">
          <h1 className="font-display text-3xl font-extrabold text-cocoa leading-tight">
            {snapshot.event.title}
          </h1>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-cocoa/70 font-body flex items-center gap-1.5">
              <span aria-hidden className="text-raspberry">
                &#128197;
              </span>
              {formattedDate}
            </p>
            {snapshot.event.address && (
              <p className="text-sm text-cocoa/70 font-body flex items-center gap-1.5">
                <span aria-hidden className="text-sky">
                  &#128205;
                </span>
                <a
                  href={googleMapsUrl(snapshot.event.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('common.viewOnMaps')}
                  className="underline underline-offset-2 hover:text-sky transition-colors"
                >
                  {snapshot.event.address}
                </a>
              </p>
            )}
          </div>
          {snapshot.event.requirements && (
            <div className="rounded-2xl bg-banana/20 border border-banana/40 px-4 py-3 text-sm text-cocoa font-body">
              {snapshot.event.requirements}
            </div>
          )}
          <div className="pt-1">
            <AddToCalendarButton event={calendarEvent} />
          </div>
        </div>
      </div>

      {submitted ? (
        /* Thank-you state */
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-8 flex flex-col items-center gap-4 text-center">
          <MonkeyMascot className="w-24 h-24" />
          <p className="font-display text-2xl font-extrabold text-cocoa">{t('guest.thanks')}</p>
          <div className="flex gap-2" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-mint inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-banana inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-raspberry inline-block" />
          </div>
        </div>
      ) : (
        /* RSVP form card */
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-6 flex flex-col gap-4">
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
        </div>
      )}
    </div>
  )
}

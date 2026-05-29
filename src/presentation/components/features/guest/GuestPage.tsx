import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParty } from '@/presentation/context/PartyContext'
import { useContainer } from '@/presentation/context/ContainerProvider'
import type { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import type { UpdateRsvpHandler } from '@/application/handlers/UpdateRsvpHandler'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'
import { AddToCalendarButton } from './AddToCalendarButton'
import { RsvpForm } from './RsvpForm'
import { ParticipantList } from './ParticipantList'
import { MonkeyMascot } from '@/presentation/components/common/MonkeyMascot'
import { Button } from '@/presentation/components/common/Button'
import { googleMapsUrl } from '@/shared/utils/googleMapsUrl'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'
import type { AnswerMap } from '@/domain/entities/Party'

interface GuestPageProps {
  partyId: string
}

type Mode = 'view' | 'register' | { editRsvpId: string }

function rsvpToInitial(rsvp: {
  parentsLabel: string
  familyAnswers: AnswerMap
  children: { name: string; answers: AnswerMap }[]
}) {
  return {
    parentsLabel: rsvp.parentsLabel,
    familyAnswers: rsvp.familyAnswers,
    children: rsvp.children.map((c) => ({ name: c.name, answers: c.answers })),
  }
}

export function GuestPage({ partyId }: GuestPageProps) {
  const { t, i18n } = useTranslation()
  const { snapshot, loading, refresh } = useParty()
  const container = useContainer()
  const recents = useMemo(() => new RecentsStore(), [])

  const [mode, setMode] = useState<Mode>('view')
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (loading)
    return <div className="p-8 text-center text-cocoa/60 font-body">{t('common.loading')}</div>
  if (!snapshot) return <div className="p-8 text-center text-cocoa/60 font-body">Not found</div>

  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'full',
    timeStyle: snapshot.event.allDay ? undefined : 'short',
  }).format(new Date(snapshot.event.startsAt))

  const calendarEvent = {
    title: snapshot.event.title,
    address: snapshot.event.address,
    startsAt: snapshot.event.startsAt,
    endsAt: snapshot.event.endsAt,
    allDay: snapshot.event.allDay,
  }

  async function handleRegister(input: {
    parentsLabel: string
    familyAnswers: AnswerMap
    children: { name: string; answers: AnswerMap }[]
  }) {
    try {
      const { rsvpId } = await container
        .resolve<SubmitRsvpHandler>('submitRsvp')
        .execute({ partyId, ...input })
      recents.addJoined({
        id: partyId,
        title: snapshot!.event.title,
        startsAt: snapshot!.event.startsAt,
        rsvpId,
      })
      await refresh()
      setMode('view')
      setSubmitted(true)
      setSubmitError(null)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleUpdate(
    rsvpId: string,
    input: {
      parentsLabel: string
      familyAnswers: AnswerMap
      children: { name: string; answers: AnswerMap }[]
    },
  ) {
    try {
      await container
        .resolve<UpdateRsvpHandler>('updateRsvp')
        .execute({ partyId, rsvpId, ...input })
      await refresh()
      setMode('view')
      setSubmitError(null)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e))
    }
  }

  const yourRsvpId = recents.getJoined(partyId)?.rsvpId

  const editingRsvp =
    typeof mode === 'object' ? (snapshot.rsvps.find((r) => r.id === mode.editRsvpId) ?? null) : null

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

      {/* Thank-you banner (shown after register, persists in view mode) */}
      {submitted && mode === 'view' && (
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-8 flex flex-col items-center gap-4 text-center">
          <MonkeyMascot className="w-24 h-24" />
          <p className="font-display text-2xl font-extrabold text-cocoa">{t('guest.thanks')}</p>
          <div className="flex gap-2" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-mint inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-banana inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-raspberry inline-block" />
          </div>
        </div>
      )}

      {/* No RSVPs yet → show form directly */}
      {snapshot.rsvps.length === 0 && (
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-6 flex flex-col gap-4">
          <RsvpForm snapshot={snapshot} onSubmit={handleRegister} />
          <ErrorBanner message={submitError} />
        </div>
      )}

      {/* RSVPs exist → participant list + actions */}
      {snapshot.rsvps.length > 0 && (
        <>
          <ParticipantList
            snapshot={snapshot}
            yourRsvpId={yourRsvpId}
            onEdit={(id) => {
              setMode({ editRsvpId: id })
              setSubmitted(false)
              setSubmitError(null)
            }}
          />

          {/* Edit form */}
          {typeof mode === 'object' && editingRsvp && (
            <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-6 flex flex-col gap-4">
              <h3 className="font-display font-extrabold text-cocoa text-lg">
                {t('guest.editResponse')}
              </h3>
              <RsvpForm
                key={mode.editRsvpId}
                snapshot={snapshot}
                initial={rsvpToInitial(editingRsvp)}
                submitLabel={t('guest.editResponse')}
                onSubmit={(input) => handleUpdate(mode.editRsvpId, input)}
              />
              <ErrorBanner message={submitError} />
            </div>
          )}

          {/* Add another family form */}
          {mode === 'register' && (
            <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-6 flex flex-col gap-4">
              <RsvpForm snapshot={snapshot} onSubmit={handleRegister} />
              <ErrorBanner message={submitError} />
            </div>
          )}

          {/* Add family button (visible when not already in register/edit mode) */}
          {mode === 'view' && (
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setMode('register')
                  setSubmitted(false)
                  setSubmitError(null)
                }}
              >
                {t('guest.addFamily')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

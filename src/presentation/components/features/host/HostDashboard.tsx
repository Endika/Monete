import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParty } from '@/presentation/context/PartyContext'
import { useContainer } from '@/presentation/context/ContainerProvider'
import { EditPinProvider, useEditPin } from '@/presentation/context/EditPinContext'
import type { EditPartyDetailsHandler } from '@/application/handlers/EditPartyDetailsHandler'
import type { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import type { RemoveQuestionHandler } from '@/application/handlers/RemoveQuestionHandler'
import type { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import type { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import type { UpdateRsvpHandler } from '@/application/handlers/UpdateRsvpHandler'
import type { RemoveRsvpHandler } from '@/application/handlers/RemoveRsvpHandler'
import type { Question, AnswerMap } from '@/domain/entities/Party'
import { PinGate } from '@/presentation/components/features/security/PinGate'
import { PartyDetailsForm } from '@/presentation/components/features/host/PartyDetailsForm'
import { QuestionBuilder } from '@/presentation/components/features/host/QuestionBuilder'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { Modal } from '@/presentation/components/common/Modal'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'
import { RsvpForm } from '@/presentation/components/features/guest/RsvpForm'
import { whatsAppShareUrl } from '@/presentation/utils/shareWhatsApp'
import { HeadcountView } from '@/presentation/components/features/host/HeadcountView'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'

interface HostDashboardProps {
  partyId: string
  recents?: RecentsStore
}

function SectionCard({
  children,
  accent,
}: {
  children: React.ReactNode
  accent?: 'banana' | 'mint' | 'sky' | 'grape' | 'raspberry'
}) {
  const borderMap: Record<string, string> = {
    banana: 'border-l-banana',
    mint: 'border-l-mint',
    sky: 'border-l-sky',
    grape: 'border-l-grape',
    raspberry: 'border-l-raspberry',
  }
  const border = accent ? borderMap[accent] : ''
  return (
    <div
      className={`bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(59,42,34,0.10)] p-6 ${accent ? `border-l-4 ${border}` : ''}`}
    >
      {children}
    </div>
  )
}

type FormState = null | { mode: 'add' } | { mode: 'edit'; rsvpId: string }

interface RsvpInput {
  parentsLabel: string
  familyAnswers: AnswerMap
  children: { name: string; answers: AnswerMap; isSibling: boolean; isBirthday: boolean }[]
}

function rsvpToInitial(r: {
  parentsLabel: string
  familyAnswers: AnswerMap
  children: {
    id: string
    name: string
    answers: AnswerMap
    isSibling?: boolean
    isBirthday?: boolean
  }[]
}): RsvpInput {
  return {
    parentsLabel: r.parentsLabel,
    familyAnswers: r.familyAnswers,
    children: r.children.map((c) => ({
      name: c.name,
      answers: c.answers,
      isSibling: c.isSibling ?? false,
      isBirthday: c.isBirthday ?? false,
    })),
  }
}

export function HostDashboard({ partyId, recents }: HostDashboardProps) {
  const { t } = useTranslation()
  const { hasPin, loading, snapshot } = useParty()

  if (loading)
    return <div className="p-8 text-center text-cocoa/60 font-body">{t('common.loading')}</div>
  if (!snapshot) return <div className="p-8 text-center text-cocoa/60 font-body">Not found</div>

  return (
    <EditPinProvider>
      <PinGate partyId={partyId} hasPin={hasPin}>
        <HostDashboardInner partyId={partyId} recents={recents} />
      </PinGate>
    </EditPinProvider>
  )
}

function HostDashboardInner({ partyId, recents }: HostDashboardProps) {
  const { t } = useTranslation()
  const { snapshot, hasPin, refresh } = useParty()
  const { pin: editPin, setPin: setEditPin } = useEditPin()
  const container = useContainer()
  const defaultRecents = useMemo(() => new RecentsStore(), [])
  const recentsStore = recents ?? defaultRecents
  const [error, setError] = useState<string | null>(null)
  const [newPin, setNewPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)
  const [formState, setFormState] = useState<FormState>(null)

  if (!snapshot) return <div className="p-8 text-center text-cocoa/60 font-body">Not found</div>

  const handleError = (err: unknown) => {
    const code = err instanceof Error ? (err as Error & { code?: string }).code : undefined
    if (code === 'STALE_CLIENT') {
      setError(t('common.updateRequired'))
    } else if (code === 'WRONG_PIN') {
      setError(t('host.wrongPin'))
    } else if (code === 'PAYLOAD_TOO_LARGE') {
      setError(t('common.tooLarge'))
    } else {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleSaveDetails = async (details: {
    title: string
    venueName: string
    address: string
    startsAt: string
    endsAt: string | null
    requirements: string
    allDay?: boolean
    lat: number | null
    lng: number | null
  }) => {
    try {
      await container
        .resolve<EditPartyDetailsHandler>('editPartyDetails')
        .execute({ partyId, ...details, allDay: details.allDay ?? false, pin: editPin })
      await refresh()
      // keep the local "my events" list snapshot in sync with the edited details
      recentsStore.updateHosted(partyId, { title: details.title, startsAt: details.startsAt })
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const handleUpsertQuestion = async (q: Omit<Question, 'id'> & { questionId?: string }) => {
    try {
      await container
        .resolve<UpsertQuestionHandler>('upsertQuestion')
        .execute({ partyId, ...q, pin: editPin })
      await refresh()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      await container
        .resolve<RemoveQuestionHandler>('removeQuestion')
        .execute({ partyId, questionId, pin: editPin })
      await refresh()
    } catch (err) {
      handleError(err)
    }
  }

  const handleSetPin = async () => {
    try {
      const next = newPin || null
      await container
        .resolve<SetEditPinHandler>('setEditPin')
        .execute({ partyId, pin: next, currentPin: editPin })
      // Adopt the new PIN for the session so subsequent edits keep working.
      setEditPin(next)
      setNewPin('')
      await refresh()
      setPinSaved(true)
    } catch (err) {
      handleError(err)
    }
  }

  const handleRemovePin = async () => {
    try {
      await container
        .resolve<SetEditPinHandler>('setEditPin')
        .execute({ partyId, pin: null, currentPin: editPin })
      setEditPin(null)
      await refresh()
    } catch (err) {
      handleError(err)
    }
  }

  const handleAddRsvp = async (input: RsvpInput) => {
    try {
      await container.resolve<SubmitRsvpHandler>('submitRsvp').execute({ partyId, ...input })
      setFormState(null)
      await refresh()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const handleUpdateRsvp = async (rsvpId: string, input: RsvpInput) => {
    try {
      await container
        .resolve<UpdateRsvpHandler>('updateRsvp')
        .execute({ partyId, rsvpId, ...input })
      setFormState(null)
      await refresh()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const handleDeleteRsvp = async (rsvpId: string) => {
    try {
      await container.resolve<RemoveRsvpHandler>('removeRsvp').execute({ partyId, rsvpId })
      await refresh()
    } catch (err) {
      handleError(err)
    }
  }

  const handleShareGuestLink = () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}?party=${partyId}`
    window.open(whatsAppShareUrl(url), '_blank')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold text-cocoa">
        {t('host.dashboardTitle')}
      </h1>

      <ErrorBanner message={error} />

      {/* Party details */}
      <SectionCard accent="banana">
        <PartyDetailsForm
          key={snapshot.updatedAt}
          initial={snapshot.event}
          onSave={handleSaveDetails}
        />
      </SectionCard>

      {/* Questions */}
      <SectionCard accent="grape">
        <h2 className="font-display text-lg font-bold text-cocoa mb-4">{t('host.questions')}</h2>
        <QuestionBuilder
          questions={snapshot.questions}
          onUpsert={handleUpsertQuestion}
          onRemove={handleRemoveQuestion}
        />
      </SectionCard>

      {/* PIN */}
      <SectionCard accent="sky">
        <h2 className="font-display text-lg font-bold text-cocoa mb-4">{t('host.setPin')}</h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-cocoa/50">{hasPin ? t('host.pinSet') : t('host.noPin')}</p>
          <Input
            label={t('host.setPin')}
            type="password"
            inputMode="numeric"
            value={newPin}
            onChange={(e) => {
              setNewPin(e.target.value)
              setPinSaved(false)
            }}
          />
          <div className="flex gap-2 flex-wrap">
            <Button type="button" onClick={handleSetPin}>
              {t('host.setPin')}
            </Button>
            {hasPin && (
              <Button type="button" variant="ghost" onClick={handleRemovePin}>
                {t('host.removePin')}
              </Button>
            )}
          </div>
          {pinSaved && (
            <span className="text-sm font-semibold text-mint">{t('common.pinSaved')}</span>
          )}
        </div>
      </SectionCard>

      {/* Headcount */}
      <SectionCard accent="mint">
        <HeadcountView
          snapshot={snapshot}
          onAddGuest={() => setFormState({ mode: 'add' })}
          onEditRsvp={(id) => setFormState({ mode: 'edit', rsvpId: id })}
          onDeleteRsvp={handleDeleteRsvp}
        />
      </SectionCard>

      {/* Add / edit RSVP modal */}
      {formState && (
        <Modal open onClose={() => setFormState(null)}>
          <RsvpForm
            key={formState.mode === 'edit' ? formState.rsvpId : 'add'}
            snapshot={snapshot}
            allowBirthday
            initial={
              formState.mode === 'edit'
                ? rsvpToInitial(snapshot.rsvps.find((r) => r.id === formState.rsvpId)!)
                : undefined
            }
            submitLabel={formState.mode === 'edit' ? t('host.editResponse') : t('host.addGuest')}
            onSubmit={
              formState.mode === 'edit'
                ? (input) => handleUpdateRsvp(formState.rsvpId, input)
                : handleAddRsvp
            }
          />
        </Modal>
      )}

      {/* Share */}
      <Button type="button" onClick={handleShareGuestLink} className="w-full">
        {t('host.shareGuestLink')}
      </Button>
    </div>
  )
}

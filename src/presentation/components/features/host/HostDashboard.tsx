import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParty } from '@/presentation/context/PartyContext'
import { useContainer } from '@/presentation/context/ContainerProvider'
import type { EditPartyDetailsHandler } from '@/application/handlers/EditPartyDetailsHandler'
import type { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import type { RemoveQuestionHandler } from '@/application/handlers/RemoveQuestionHandler'
import type { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import type { Question } from '@/domain/entities/Party'
import { PinGate } from '@/presentation/components/features/security/PinGate'
import { PartyDetailsForm } from '@/presentation/components/features/host/PartyDetailsForm'
import { QuestionBuilder } from '@/presentation/components/features/host/QuestionBuilder'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'
import { whatsAppShareUrl } from '@/presentation/utils/shareWhatsApp'
import { HeadcountView } from '@/presentation/components/features/host/HeadcountView'

interface HostDashboardProps {
  partyId: string
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

export function HostDashboard({ partyId }: HostDashboardProps) {
  const { t } = useTranslation()
  const { snapshot, loading, refresh } = useParty()
  const container = useContainer()
  const [error, setError] = useState<string | null>(null)
  const [newPin, setNewPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)

  if (loading)
    return <div className="p-8 text-center text-cocoa/60 font-body">{t('common.loading')}</div>
  if (!snapshot) return <div className="p-8 text-center text-cocoa/60 font-body">Not found</div>

  const handleError = (err: unknown) => {
    if (err instanceof Error && (err as Error & { code?: string }).code === 'STALE_CLIENT') {
      setError(t('common.updateRequired'))
    } else {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleSaveDetails = async (details: {
    title: string
    address: string
    startsAt: string
    endsAt: string | null
    requirements: string
  }) => {
    try {
      await container
        .resolve<EditPartyDetailsHandler>('editPartyDetails')
        .execute({ partyId, ...details })
      await refresh()
    } catch (err) {
      handleError(err)
    }
  }

  const handleUpsertQuestion = async (q: Omit<Question, 'id'> & { questionId?: string }) => {
    try {
      await container.resolve<UpsertQuestionHandler>('upsertQuestion').execute({ partyId, ...q })
      await refresh()
    } catch (err) {
      handleError(err)
    }
  }

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      await container
        .resolve<RemoveQuestionHandler>('removeQuestion')
        .execute({ partyId, questionId })
      await refresh()
    } catch (err) {
      handleError(err)
    }
  }

  const handleSetPin = async () => {
    try {
      await container
        .resolve<SetEditPinHandler>('setEditPin')
        .execute({ partyId, pin: newPin || null })
      setNewPin('')
      await refresh()
      setPinSaved(true)
    } catch (err) {
      handleError(err)
    }
  }

  const handleShareGuestLink = () => {
    const url = `${window.location.origin}/?party=${partyId}`
    window.open(whatsAppShareUrl(url), '_blank')
  }

  return (
    <PinGate partyId={partyId} pinHash={snapshot.editPin}>
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
            <Button type="button" onClick={handleSetPin}>
              {t('host.setPin')}
            </Button>
            {pinSaved && (
              <span className="text-sm font-semibold text-mint">{t('common.pinSaved')}</span>
            )}
          </div>
        </SectionCard>

        {/* Headcount */}
        <SectionCard accent="mint">
          <HeadcountView snapshot={snapshot} />
        </SectionCard>

        {/* Share */}
        <Button type="button" onClick={handleShareGuestLink} className="w-full">
          {t('host.shareGuestLink')}
        </Button>
      </div>
    </PinGate>
  )
}

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

export function HostDashboard({ partyId }: HostDashboardProps) {
  const { t } = useTranslation()
  const { snapshot, loading, refresh } = useParty()
  const container = useContainer()
  const [error, setError] = useState<string | null>(null)
  const [newPin, setNewPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)

  if (loading) return <div>{t('common.loading')}</div>
  if (!snapshot) return <div>Not found</div>

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
      <div className="mx-auto max-w-lg px-4 py-10 flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('host.dashboardTitle')}</h1>

        <ErrorBanner message={error} />

        <PartyDetailsForm
          key={snapshot.updatedAt}
          initial={snapshot.event}
          onSave={handleSaveDetails}
        />

        <QuestionBuilder
          questions={snapshot.questions}
          onUpsert={handleUpsertQuestion}
          onRemove={handleRemoveQuestion}
        />

        <div className="flex flex-col gap-2">
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
          {pinSaved && <span>{t('common.pinSaved')}</span>}
        </div>

        <Button type="button" onClick={handleShareGuestLink}>
          {t('host.shareGuestLink')}
        </Button>

        <HeadcountView snapshot={snapshot} />
      </div>
    </PinGate>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContainer } from '@/presentation/context/ContainerProvider'
import type { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'

export function HomePage({ onCreated }: { onCreated: (id: string) => void }) {
  const { t } = useTranslation()
  const container = useContainer()

  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [requirements, setRequirements] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await container.resolve<CreatePartyHandler>('createParty').execute({
        title,
        address,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        requirements,
      })
      onCreated(result.party.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{t('home.title')}</h1>
      <p className="mt-1 text-gray-500">{t('home.subtitle')}</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <ErrorBanner message={error} />
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
        <Button type="submit">{t('home.submit')}</Button>
      </form>
    </div>
  )
}

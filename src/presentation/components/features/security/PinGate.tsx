import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EditPin } from '@/domain/value-objects/EditPin'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'

interface PinGateProps {
  partyId: string
  pinHash: string | null
  children: React.ReactNode
}

export function PinGate({ partyId, pinHash, children }: PinGateProps) {
  const { t } = useTranslation()
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (pinHash === null) return <>{children}</>
  if (unlocked) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await EditPin.verify(pin, pinHash, partyId)
    if (ok) {
      setUnlocked(true)
    } else {
      setError(t('host.wrongPin'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ErrorBanner message={error} />
      <Input
        label={t('host.pinLabel')}
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={(e) => {
          setError(null)
          setPin(e.target.value)
        }}
      />
      <Button type="submit">{t('host.unlock')}</Button>
    </form>
  )
}

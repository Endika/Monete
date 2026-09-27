import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContainer } from '@/presentation/context/ContainerProvider'
import { useEditPin } from '@/presentation/context/EditPinContext'
import type { VerifyPinHandler } from '@/application/handlers/VerifyPinHandler'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'

interface PinGateProps {
  partyId: string
  hasPin: boolean
  /** A passive read (not a submit here) already hit the PIN throttle — show that up front. */
  rateLimited?: boolean
  /** Called right after a correct PIN is verified, once it has been stored. */
  onUnlocked?: () => void
  children: React.ReactNode
}

export function PinGate({ partyId, hasPin, rateLimited, onUnlocked, children }: PinGateProps) {
  const { t } = useTranslation()
  const container = useContainer()
  const { setPin: setUnlockedPin } = useEditPin()
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // A passive read (PartyContext's own fetch) can already be throttled before the visitor
  // ever submits here; fall back to that message rather than syncing it into state.
  const displayedError = error ?? (rateLimited ? t('host.tooManyAttempts') : null)

  if (!hasPin) return <>{children}</>
  if (unlocked) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const ok = await container.resolve<VerifyPinHandler>('verifyPin').execute(partyId, pin)
      if (ok) {
        // Keep the verified PIN for the session so privileged actions can pass it server-side.
        setUnlockedPin(pin)
        setUnlocked(true)
        onUnlocked?.()
      } else {
        setError(t('host.wrongPin'))
      }
    } catch (err) {
      const code = err instanceof Error ? (err as Error & { code?: string }).code : undefined
      setError(code === 'RATE_LIMITED' ? t('host.tooManyAttempts') : t('host.wrongPin'))
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 flex flex-col items-center gap-8">
      {/* Lock icon decorative */}
      <div className="w-20 h-20 rounded-full bg-cocoa flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(59,42,34,0.30)]">
        <span className="text-4xl" aria-hidden>
          &#128274;
        </span>
      </div>

      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold text-cocoa">
          {t('host.pinGateTitle')}
        </h1>
        <p className="mt-2 text-sm text-cocoa/60 font-body">{t('host.pinGateHelp')}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-6 flex flex-col gap-4"
      >
        <ErrorBanner message={displayedError} />
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
        <Button type="submit" className="w-full">
          {t('host.unlock')}
        </Button>
      </form>
    </div>
  )
}

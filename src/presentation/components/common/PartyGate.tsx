import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useParty } from '@/presentation/context/PartyContext'
import { Button } from '@/presentation/components/common/Button'
import { Modal } from '@/presentation/components/common/Modal'
import { MonkeyMascot } from '@/presentation/components/common/MonkeyMascot'

function Notice({
  emoji,
  title,
  body,
  detail,
  children,
}: {
  emoji: string
  title: string
  body: string
  detail?: string | null
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 flex flex-col items-center gap-6 text-center">
      <div className="relative">
        <MonkeyMascot className="w-24 h-24 opacity-60 grayscale" />
        <span className="absolute -bottom-1 -right-1 text-3xl" aria-hidden>
          {emoji}
        </span>
      </div>
      <div>
        <h1 className="font-display text-2xl font-extrabold text-cocoa">{title}</h1>
        <p className="mt-2 font-body text-sm text-cocoa/70 leading-relaxed">{body}</p>
        {detail && <p className="mt-2 font-body text-xs text-cocoa/40 break-words">{detail}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  )
}

function GoneNotice({ onHome }: { onHome: () => void }) {
  const { t } = useTranslation()
  const { forget } = useParty()
  const [confirming, setConfirming] = useState(false)

  const handleForget = () => {
    forget()
    setConfirming(false)
    onHome()
  }

  return (
    <>
      <Notice emoji="&#127880;" title={t('gone.title')} body={t('gone.body')}>
        <Button type="button" onClick={() => setConfirming(true)}>
          {t('gone.forget')}
        </Button>
        <Button type="button" variant="ghost" onClick={onHome}>
          {t('gone.keep')}
        </Button>
      </Notice>
      <Modal open={confirming} onClose={() => setConfirming(false)}>
        <h2 className="font-display text-lg font-bold text-cocoa">{t('gone.confirmTitle')}</h2>
        <p className="mt-2 font-body text-sm text-cocoa/70">{t('gone.confirmBody')}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={handleForget}>
            {t('gone.forget')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
            {t('common.cancel')}
          </Button>
        </div>
      </Modal>
    </>
  )
}

/**
 * Renders the party's non-happy states once, for host and guest alike, so the pages below
 * only ever deal with a loaded party. The two failures are deliberately different: `deleted`
 * is final but still offers to keep the entry, `unavailable` is retryable and changes nothing.
 */
export function PartyGate({ onHome, children }: { onHome: () => void; children: ReactNode }) {
  const { t } = useTranslation()
  const { status, error, refresh } = useParty()
  const [retrying, setRetrying] = useState(false)

  if (status === 'loading')
    return <div className="p-8 text-center text-cocoa/60 font-body">{t('common.loading')}</div>

  if (status === 'deleted') return <GoneNotice onHome={onHome} />

  if (status === 'unavailable') {
    const retry = async () => {
      setRetrying(true)
      try {
        await refresh()
      } finally {
        setRetrying(false)
      }
    }
    return (
      <Notice
        emoji="&#128246;"
        title={t('unavailable.title')}
        body={t('unavailable.body')}
        detail={error}
      >
        <Button type="button" disabled={retrying} onClick={() => void retry()}>
          {retrying ? t('common.loading') : t('unavailable.retry')}
        </Button>
      </Notice>
    )
  }

  return <>{children}</>
}

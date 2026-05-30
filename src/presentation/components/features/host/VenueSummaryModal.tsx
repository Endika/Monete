import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PartySnapshot } from '@/domain/entities/Party'
import { computeHeadcount } from '@/presentation/utils/headcount'
import { formatVenueSummary } from '@/presentation/utils/formatVenueSummary'
import { whatsAppShareUrl } from '@/presentation/utils/shareWhatsApp'
import { Modal } from '@/presentation/components/common/Modal'
import { Button } from '@/presentation/components/common/Button'

interface VenueSummaryModalProps {
  snapshot: PartySnapshot
  onClose: () => void
}

export function VenueSummaryModal({ snapshot, onClose }: VenueSummaryModalProps) {
  const { t, i18n } = useTranslation()
  const [copied, setCopied] = useState(false)

  const hc = computeHeadcount(snapshot)
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(snapshot.event.startsAt))
  const text = formatVenueSummary(
    {
      title: snapshot.event.title,
      startsAt: formattedDate,
      venueName: snapshot.event.venueName,
      address: snapshot.event.address,
      requirements: snapshot.event.requirements,
    },
    hc,
    t,
  )

  const handleCopy = () => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    window.open(whatsAppShareUrl(text), '_blank')
  }

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-cocoa">{t('host.shareVenue')}</h2>
        <textarea
          readOnly
          value={text}
          rows={12}
          className="w-full rounded-2xl border-2 border-cocoa/15 bg-cream p-4 text-sm font-mono text-cocoa resize-none focus:outline-none"
        />
        <div className="flex gap-2">
          <Button type="button" onClick={handleCopy}>
            {copied ? t('common.copied') : t('common.copy')}
          </Button>
          <Button type="button" variant="ghost" onClick={handleShare}>
            {t('common.shareWhatsApp')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

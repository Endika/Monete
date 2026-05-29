import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PartySnapshot } from '@/domain/entities/Party'
import { computeHeadcount } from '@/presentation/utils/headcount'
import { Button } from '@/presentation/components/common/Button'
import { VenueSummaryModal } from '@/presentation/components/features/host/VenueSummaryModal'

interface HeadcountViewProps {
  snapshot: PartySnapshot
}

export function HeadcountView({ snapshot }: HeadcountViewProps) {
  const { t } = useTranslation()
  const hc = computeHeadcount(snapshot)
  const [showSummary, setShowSummary] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900">{t('host.headcount')}</h2>

      <p className="text-sm text-gray-600">
        {t('venue.totals', { children: hc.totalChildren, adults: hc.totalAdults })}
      </p>

      <ul className="flex flex-col gap-2">
        {hc.children.map((child, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">{child.name}</span>
            <span className="text-gray-500">{child.parentsLabel}</span>
            {child.snack && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                {child.snack}
              </span>
            )}
            {child.allergies && (
              <span className="text-xs font-medium text-red-600">{child.allergies}</span>
            )}
          </li>
        ))}
      </ul>

      <Button type="button" onClick={() => setShowSummary(true)}>
        {t('host.shareVenue')}
      </Button>

      {showSummary && (
        <VenueSummaryModal snapshot={snapshot} onClose={() => setShowSummary(false)} />
      )}
    </div>
  )
}

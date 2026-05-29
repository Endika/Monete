import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PartySnapshot } from '@/domain/entities/Party'
import { computeHeadcount } from '@/presentation/utils/headcount'
import { Button } from '@/presentation/components/common/Button'
import { VenueSummaryModal } from '@/presentation/components/features/host/VenueSummaryModal'

interface HeadcountViewProps {
  snapshot: PartySnapshot
  onEditRsvp?: (rsvpId: string) => void
  onDeleteRsvp?: (rsvpId: string) => void
  onAddGuest?: () => void
}

export function HeadcountView({
  snapshot,
  onEditRsvp,
  onDeleteRsvp,
  onAddGuest,
}: HeadcountViewProps) {
  const { t } = useTranslation()
  const hc = computeHeadcount(snapshot)
  const [showSummary, setShowSummary] = useState(false)

  const handleDelete = (rsvpId: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      onDeleteRsvp?.(rsvpId)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-lg font-bold text-cocoa">{t('host.headcount')}</h2>

      {/* Big friendly totals */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl bg-banana/20 border border-banana/40 px-4 py-3 flex flex-col items-center gap-1">
          <span className="font-display text-4xl font-extrabold text-cocoa">
            {hc.totalChildren}
          </span>
          <span className="text-xs font-semibold text-cocoa/60 uppercase tracking-wider">
            {t(hc.totalChildren === 1 ? 'host.childWord' : 'host.childrenWord')}
          </span>
        </div>
        <div className="flex-1 rounded-2xl bg-sky/15 border border-sky/40 px-4 py-3 flex flex-col items-center gap-1">
          <span className="font-display text-4xl font-extrabold text-cocoa">{hc.totalAdults}</span>
          <span className="text-xs font-semibold text-cocoa/60 uppercase tracking-wider">
            {t(hc.totalAdults === 1 ? 'host.adultWord' : 'host.adultsWord')}
          </span>
        </div>
      </div>

      {/* Per-child rows */}
      {hc.children.length > 0 && (
        <ul className="flex flex-col gap-2">
          {hc.children.map((child, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-2xl bg-cream border border-cocoa/10 px-4 py-3"
            >
              <span className="font-display font-bold text-cocoa text-sm">{child.name}</span>
              <span className="text-xs text-cocoa/50 font-body">{child.parentsLabel}</span>
              {child.snack && (
                <span className="rounded-full bg-banana/25 px-2.5 py-0.5 text-xs font-semibold text-cocoa border border-banana/50">
                  {child.snack}
                </span>
              )}
              {child.allergies && (
                <span className="rounded-full bg-raspberry/15 px-2.5 py-0.5 text-xs font-semibold text-raspberry border border-raspberry/30">
                  {child.allergies}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Per-family rows with optional actions */}
      {snapshot.rsvps.length > 0 && (onEditRsvp ?? onDeleteRsvp) && (
        <ul className="flex flex-col gap-2">
          {snapshot.rsvps.map((rsvp) => (
            <li
              key={rsvp.id}
              className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-cocoa/10 px-4 py-3"
            >
              <span className="font-display font-bold text-cocoa text-sm flex-1">
                {rsvp.parentsLabel}
              </span>
              <span className="text-xs text-cocoa/50 font-body">
                {rsvp.children.map((c) => c.name).join(', ')}
              </span>
              {onEditRsvp && (
                <button
                  type="button"
                  onClick={() => onEditRsvp(rsvp.id)}
                  className="text-xs font-semibold text-sky hover:text-sky/80 transition-colors"
                >
                  {t('host.editResponse')}
                </button>
              )}
              {onDeleteRsvp && (
                <button
                  type="button"
                  onClick={() => handleDelete(rsvp.id)}
                  className="text-xs font-semibold text-raspberry hover:text-raspberry/80 transition-colors"
                >
                  {t('host.deleteResponse')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Button type="button" onClick={() => setShowSummary(true)}>
        {t('host.shareVenue')}
      </Button>

      {onAddGuest && (
        <Button type="button" onClick={onAddGuest} className="w-full">
          {t('host.addGuest')}
        </Button>
      )}

      {showSummary && (
        <VenueSummaryModal snapshot={snapshot} onClose={() => setShowSummary(false)} />
      )}
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import type { PartySnapshot } from '@/domain/entities/Party'
import { Button } from '@/presentation/components/common/Button'

interface ParticipantListProps {
  snapshot: PartySnapshot
  yourRsvpId?: string
  onClaim: (rsvpId: string) => void
  onEdit: (rsvpId: string) => void
  onUnclaim: () => void
}

export function ParticipantList({
  snapshot,
  yourRsvpId,
  onClaim,
  onEdit,
  onUnclaim,
}: ParticipantListProps) {
  const { t } = useTranslation()

  const questionById = Object.fromEntries(snapshot.questions.map((q) => [q.id, q]))

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-extrabold text-cocoa">{t('guest.whosGoing')}</h2>
      {snapshot.rsvps.map((rsvp) => {
        const isClaimed = rsvp.id === yourRsvpId
        return (
          <div
            key={rsvp.id}
            className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(59,42,34,0.12)] p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-cocoa text-lg">
                  {rsvp.parentsLabel}
                </span>
                {isClaimed && (
                  <span className="rounded-full bg-mint/30 px-2 py-0.5 text-xs font-semibold text-cocoa/70">
                    {t('guest.yoursHint')}
                  </span>
                )}
              </div>
              {isClaimed ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => onEdit(rsvp.id)}>
                    {t('guest.edit')}
                  </Button>
                  <Button variant="ghost" onClick={onUnclaim}>
                    {t('guest.notUs')}
                  </Button>
                </div>
              ) : !yourRsvpId ? (
                <Button variant="ghost" onClick={() => onClaim(rsvp.id)}>
                  {t('guest.thisIsUs')}
                </Button>
              ) : null}
            </div>

            {/* Family-level answers */}
            {Object.entries(rsvp.familyAnswers).map(([qId, answer]) => {
              if (answer === null || answer === undefined || answer === '') return null
              const q = questionById[qId]
              if (!q) return null
              return (
                <p key={qId} className="text-sm text-cocoa/70 font-body">
                  {q.label}: {answer}
                </p>
              )
            })}

            {/* Children */}
            <div className="flex flex-col gap-2">
              {rsvp.children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-2xl bg-cream border border-cocoa/10 px-4 py-3 flex flex-col gap-1"
                >
                  <span className="font-display font-bold text-cocoa text-sm flex items-center gap-1.5">
                    🎉 {child.name}
                    {child.isSibling && (
                      <span className="rounded-full bg-mint/30 px-2 py-0.5 text-xs font-semibold text-cocoa/70 border border-mint/50">
                        {t('guest.sibling')}
                      </span>
                    )}
                  </span>
                  {Object.entries(child.answers).map(([qId, answer]) => {
                    if (answer === null || answer === undefined || answer === '') return null
                    const q = questionById[qId]
                    if (!q) return null
                    return (
                      <p key={qId} className="text-xs text-cocoa/60 font-body">
                        {q.label}: {answer}
                      </p>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

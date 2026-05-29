import type { Headcount } from '@/presentation/utils/headcount'

type T = (key: string, vars?: Record<string, unknown>) => string

export interface VenueSummaryDetails {
  title: string
  startsAt: string
  address: string
  requirements: string
}

export function formatVenueSummary(details: VenueSummaryDetails, hc: Headcount, t: T): string {
  const lines: string[] = []
  lines.push(`🎂 ${details.title} — ${details.startsAt}`)
  if (details.address) lines.push(`📍 ${details.address}`)
  if (details.requirements) lines.push(`⚠️ ${details.requirements}`)
  lines.push('')
  lines.push(
    t('venue.breakdown', {
      children: hc.totalChildren,
      invited: hc.totalInvited,
      siblings: hc.totalSiblings,
      adults: hc.totalAdults,
    }),
  )
  for (const c of hc.children) {
    const parts = [c.name]
    if (c.snack) parts.push(t('venue.snack', { snack: c.snack }))
    if (c.allergies) parts.push(t('venue.allergies', { allergies: c.allergies }))
    lines.push(`• ${parts.join(' — ')}`)
  }
  return lines.join('\n')
}

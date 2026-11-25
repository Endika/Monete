import type { AnswerValue, PartySnapshot, Question, Rsvp } from '@/domain/entities/Party'

export interface ChildRow {
  id: string
  name: string
  parentsLabel: string
  snack: string | null
  allergies: string | null
  isSibling: boolean
  isBirthday: boolean
}

export interface Headcount {
  totalChildren: number
  totalInvited: number
  totalSiblings: number
  totalAdults: number
  children: ChildRow[]
  birthdayNames: string[]
  extraTotals: { label: string; total: number }[]
}

function toCount(v: AnswerValue | undefined): number {
  return typeof v === 'number' ? v : Number(v) || 0
}

export function birthdayNames(rsvps: Rsvp[]): string[] {
  return [
    ...new Set(rsvps.flatMap((r) => r.children.filter((c) => c.isBirthday).map((c) => c.name))),
  ]
}

function findByKind(questions: Question[], kind: Question['kind']): Question | undefined {
  return questions.find((q) => q.kind === kind)
}

export function computeHeadcount(party: PartySnapshot): Headcount {
  const adultsQ = findByKind(party.questions, 'adultsCount')
  const snackQ = findByKind(party.questions, 'snack')
  const allergiesQ = findByKind(party.questions, 'allergies')

  let totalAdults = 0
  const children: ChildRow[] = []
  for (const r of party.rsvps) {
    if (adultsQ) {
      totalAdults += toCount(r.familyAnswers[adultsQ.id])
    }
    for (const c of r.children) {
      children.push({
        id: c.id,
        name: c.name,
        parentsLabel: r.parentsLabel,
        snack: snackQ ? (c.answers[snackQ.id] != null ? String(c.answers[snackQ.id]) : null) : null,
        allergies: allergiesQ
          ? c.answers[allergiesQ.id]
            ? String(c.answers[allergiesQ.id])
            : null
          : null,
        isSibling: c.isSibling,
        isBirthday: c.isBirthday,
      })
    }
  }
  const totalInvited = children.filter((c) => !c.isSibling).length
  const totalSiblings = children.filter((c) => c.isSibling).length

  const extraTotals = party.questions
    .filter((q) => q.scope === 'family' && q.type === 'number' && q.kind !== 'adultsCount')
    .map((q) => ({
      label: q.label,
      total: party.rsvps.reduce((sum, r) => sum + toCount(r.familyAnswers[q.id]), 0),
    }))

  return {
    totalChildren: children.length,
    totalInvited,
    totalSiblings,
    totalAdults,
    children,
    birthdayNames: birthdayNames(party.rsvps),
    extraTotals,
  }
}

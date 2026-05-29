import type { PartySnapshot, Question } from '@/domain/entities/Party'

export interface ChildRow {
  name: string
  parentsLabel: string
  snack: string | null
  allergies: string | null
}

export interface Headcount {
  totalChildren: number
  totalAdults: number
  children: ChildRow[]
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
      const v = r.familyAnswers[adultsQ.id]
      totalAdults += typeof v === 'number' ? v : Number(v) || 0
    }
    for (const c of r.children) {
      children.push({
        name: c.name,
        parentsLabel: r.parentsLabel,
        snack: snackQ ? (c.answers[snackQ.id] != null ? String(c.answers[snackQ.id]) : null) : null,
        allergies: allergiesQ
          ? c.answers[allergiesQ.id]
            ? String(c.answers[allergiesQ.id])
            : null
          : null,
      })
    }
  }
  return { totalChildren: children.length, totalAdults, children }
}

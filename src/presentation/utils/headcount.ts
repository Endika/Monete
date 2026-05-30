import type { PartySnapshot, Question } from '@/domain/entities/Party'

export interface ChildRow {
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
        isSibling: c.isSibling ?? false,
        isBirthday: c.isBirthday ?? false,
      })
    }
  }
  const totalInvited = children.filter((c) => !c.isSibling).length
  const totalSiblings = children.filter((c) => c.isSibling).length
  const birthdayNames = [...new Set(children.filter((c) => c.isBirthday).map((c) => c.name))]

  const extraTotals = party.questions
    .filter((q) => q.scope === 'family' && q.type === 'number' && q.kind !== 'adultsCount')
    .map((q) => ({
      label: q.label,
      total: party.rsvps.reduce((sum, r) => {
        const v = r.familyAnswers[q.id]
        return sum + (typeof v === 'number' ? v : Number(v) || 0)
      }, 0),
    }))

  return {
    totalChildren: children.length,
    totalInvited,
    totalSiblings,
    totalAdults,
    children,
    birthdayNames,
    extraTotals,
  }
}

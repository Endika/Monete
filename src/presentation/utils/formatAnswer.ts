import type { AnswerValue, QuestionType } from '@/domain/entities/Party'

/** Read-only formatting of a single answer for the host's quick view. */
export function formatAnswer(value: AnswerValue, type: QuestionType, locale: string): string {
  if (value === null || value === '') return '—'
  if (type === 'date') {
    // A date input gives YYYY-MM-DD; read it as a local day, not as UTC midnight.
    const d = new Date(`${value}T00:00`)
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(locale)
  }
  return String(value)
}

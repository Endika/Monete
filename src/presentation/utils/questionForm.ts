import type { Question, QuestionType } from '@/domain/entities/Party'

/** The presets whose kind the party doesn't ask yet. */
export function availablePresets<T extends Pick<Question, 'kind'>>(
  presets: T[],
  questions: Question[],
): T[] {
  const present = new Set(questions.map((q) => q.kind))
  return presets.filter((p) => !present.has(p.kind))
}

/** Comma-separated options for a select; any other type has none. */
export function parseOptions(type: QuestionType, text: string): string[] {
  if (type !== 'select') return []
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

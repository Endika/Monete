import type { Question, AnswerValue } from '@/domain/entities/Party'

interface QuestionInputProps {
  question: Question
  value: AnswerValue
  onChange: (value: AnswerValue) => void
}

export function QuestionInput({ question: q, value, onChange }: QuestionInputProps) {
  if (q.type === 'select') {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">{q.label}</span>
        <select
          aria-label={q.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="" />
          {q.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (q.type === 'number') {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">{q.label}</span>
        <input
          type="number"
          aria-label={q.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </label>
    )
  }

  if (q.type === 'date') {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">{q.label}</span>
        <input
          type="date"
          aria-label={q.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </label>
    )
  }

  // type === 'text'
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{q.label}</span>
      <input
        type="text"
        aria-label={q.label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </label>
  )
}

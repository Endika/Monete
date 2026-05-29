import type { Question, AnswerValue } from '@/domain/entities/Party'

interface QuestionInputProps {
  question: Question
  value: AnswerValue
  onChange: (value: AnswerValue) => void
}

const inputClass =
  'w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa placeholder:text-cocoa/40 transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25'

const labelClass = 'text-sm font-semibold font-display text-cocoa/80 tracking-wide'

export function QuestionInput({ question: q, value, onChange }: QuestionInputProps) {
  if (q.type === 'select') {
    return (
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{q.label}</span>
        <select
          aria-label={q.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
          className={inputClass}
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
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{q.label}</span>
        <input
          type="number"
          aria-label={q.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={inputClass}
        />
      </label>
    )
  }

  if (q.type === 'date') {
    return (
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{q.label}</span>
        <input
          type="date"
          aria-label={q.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
          className={inputClass}
        />
      </label>
    )
  }

  // type === 'text'
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{q.label}</span>
      <input
        type="text"
        aria-label={q.label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        className={inputClass}
      />
    </label>
  )
}

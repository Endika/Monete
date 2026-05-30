import { useTranslation } from 'react-i18next'
import type { Question, AnswerValue, AnswerMap } from '@/domain/entities/Party'
import { Input } from '@/presentation/components/common/Input'
import { QuestionInput } from './QuestionInput'

interface ChildAnswersProps {
  childQuestions: Question[]
  value: { name: string; answers: AnswerMap; isSibling: boolean; isBirthday: boolean }
  onChange: (v: {
    name: string
    answers: AnswerMap
    isSibling: boolean
    isBirthday: boolean
  }) => void
  onRemove?: () => void
  showSibling?: boolean
  showBirthday?: boolean
}

export function ChildAnswers({
  childQuestions,
  value,
  onChange,
  onRemove,
  showSibling,
  showBirthday,
}: ChildAnswersProps) {
  const { t } = useTranslation()

  function handleNameChange(name: string) {
    onChange({ ...value, name })
  }

  function handleAnswerChange(qId: string, val: AnswerValue) {
    onChange({ ...value, answers: { ...value.answers, [qId]: val } })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-cream border-2 border-cocoa/10 p-5">
      {/* Child card header */}
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold text-cocoa/60 uppercase tracking-wider">
          &#127881; {t('guest.child')}
        </span>
        {onRemove && (
          <button
            type="button"
            className="text-xs font-semibold text-raspberry hover:underline"
            onClick={onRemove}
          >
            {t('common.remove')}
          </button>
        )}
      </div>
      <Input
        label={t('guest.childName')}
        value={value.name}
        onChange={(e) => handleNameChange(e.target.value)}
      />
      {showBirthday && (
        <label className="flex items-center gap-2 text-sm text-cocoa">
          <input
            type="checkbox"
            checked={value.isBirthday}
            onChange={() => onChange({ ...value, isBirthday: !value.isBirthday })}
          />
          {t('guest.birthday')}
        </label>
      )}
      {showSibling && (
        <label className="flex items-center gap-2 text-sm text-cocoa">
          <input
            type="checkbox"
            checked={value.isSibling}
            onChange={() => onChange({ ...value, isSibling: !value.isSibling })}
          />
          {t('guest.sibling')}
        </label>
      )}
      {childQuestions.map((q) => (
        <QuestionInput
          key={q.id}
          question={q}
          value={value.answers[q.id] ?? null}
          onChange={(val) => handleAnswerChange(q.id, val)}
        />
      ))}
    </div>
  )
}

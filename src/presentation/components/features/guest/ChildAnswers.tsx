import { useTranslation } from 'react-i18next'
import type { Question, AnswerValue, AnswerMap } from '@/domain/entities/Party'
import { Input } from '@/presentation/components/common/Input'
import { QuestionInput } from './QuestionInput'

interface ChildAnswersProps {
  childQuestions: Question[]
  value: { name: string; answers: AnswerMap }
  onChange: (v: { name: string; answers: AnswerMap }) => void
  onRemove?: () => void
}

export function ChildAnswers({ childQuestions, value, onChange, onRemove }: ChildAnswersProps) {
  const { t } = useTranslation()

  function handleNameChange(name: string) {
    onChange({ ...value, name })
  }

  function handleAnswerChange(qId: string, val: AnswerValue) {
    onChange({ ...value, answers: { ...value.answers, [qId]: val } })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      {onRemove && (
        <div className="flex justify-end">
          <button type="button" className="text-xs text-red-600 hover:underline" onClick={onRemove}>
            {t('common.remove')}
          </button>
        </div>
      )}
      <Input
        label={t('guest.childName')}
        value={value.name}
        onChange={(e) => handleNameChange(e.target.value)}
      />
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

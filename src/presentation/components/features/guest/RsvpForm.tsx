import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PartySnapshot, AnswerMap } from '@/domain/entities/Party'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { ChildAnswers } from './ChildAnswers'
import { QuestionInput } from './QuestionInput'

interface RsvpFormProps {
  snapshot: PartySnapshot
  onSubmit: (input: {
    parentsLabel: string
    familyAnswers: AnswerMap
    children: { name: string; answers: AnswerMap }[]
  }) => void
}

interface ChildEntry {
  name: string
  answers: AnswerMap
}

export function RsvpForm({ snapshot, onSubmit }: RsvpFormProps) {
  const { t } = useTranslation()

  const familyQuestions = snapshot.questions.filter((q) => q.scope === 'family')
  const childQuestions = snapshot.questions.filter((q) => q.scope === 'child')

  const [parentsLabel, setParentsLabel] = useState('')
  const [familyAnswers, setFamilyAnswers] = useState<AnswerMap>({})
  const [children, setChildren] = useState<ChildEntry[]>([{ name: '', answers: {} }])

  function updateChild(index: number, value: ChildEntry) {
    setChildren((prev) => prev.map((c, i) => (i === index ? value : c)))
  }

  function addChild() {
    setChildren((prev) => [...prev, { name: '', answers: {} }])
  }

  function removeChild(index: number) {
    setChildren((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ parentsLabel, familyAnswers, children })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t('guest.weAreParentsOf')}
        value={parentsLabel}
        onChange={(e) => setParentsLabel(e.target.value)}
      />

      {familyQuestions.map((q) => (
        <QuestionInput
          key={q.id}
          question={q}
          value={familyAnswers[q.id] ?? null}
          onChange={(val) => setFamilyAnswers((prev) => ({ ...prev, [q.id]: val }))}
        />
      ))}

      {children.map((child, i) => (
        <ChildAnswers
          key={i}
          childQuestions={childQuestions}
          value={child}
          onChange={(v) => updateChild(i, v)}
          onRemove={children.length > 1 ? () => removeChild(i) : undefined}
        />
      ))}

      <Button type="button" onClick={addChild}>
        {t('guest.addChild')}
      </Button>

      <Button type="submit">{t('guest.submit')}</Button>
    </form>
  )
}

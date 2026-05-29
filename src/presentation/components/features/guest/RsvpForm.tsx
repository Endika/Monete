import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uuidv7 } from 'uuidv7'
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
  initial?: {
    parentsLabel: string
    familyAnswers: AnswerMap
    children: { name: string; answers: AnswerMap }[]
  }
  submitLabel?: string
}

interface ChildEntry {
  id: string
  name: string
  answers: AnswerMap
}

export function RsvpForm({ snapshot, onSubmit, initial, submitLabel }: RsvpFormProps) {
  const { t } = useTranslation()

  const familyQuestions = snapshot.questions.filter((q) => q.scope === 'family')
  const childQuestions = snapshot.questions.filter((q) => q.scope === 'child')

  const [parentsLabel, setParentsLabel] = useState(initial?.parentsLabel ?? '')
  const [familyAnswers, setFamilyAnswers] = useState<AnswerMap>(initial?.familyAnswers ?? {})
  const [children, setChildren] = useState<ChildEntry[]>(
    initial?.children?.length
      ? initial.children.map((c) => ({ id: uuidv7(), name: c.name, answers: c.answers }))
      : [{ id: uuidv7(), name: '', answers: {} }],
  )

  function updateChild(id: string, value: { name: string; answers: AnswerMap }) {
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...value } : c)))
  }

  function addChild() {
    setChildren((prev) => [...prev, { id: uuidv7(), name: '', answers: {} }])
  }

  function removeChild(index: number) {
    setChildren((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      parentsLabel,
      familyAnswers,
      children: children.map(({ name, answers }) => ({ name, answers })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Parent identification */}
      <Input
        label={t('guest.weAreParentsOf')}
        value={parentsLabel}
        onChange={(e) => setParentsLabel(e.target.value)}
      />

      {/* Family-level questions */}
      {familyQuestions.map((q) => (
        <QuestionInput
          key={q.id}
          question={q}
          value={familyAnswers[q.id] ?? null}
          onChange={(val) => setFamilyAnswers((prev) => ({ ...prev, [q.id]: val }))}
        />
      ))}

      {/* Per-child sections */}
      <div className="flex flex-col gap-3">
        {children.map((child, i) => (
          <ChildAnswers
            key={child.id}
            childQuestions={childQuestions}
            value={{ name: child.name, answers: child.answers }}
            onChange={(v) => updateChild(child.id, v)}
            onRemove={children.length > 1 ? () => removeChild(i) : undefined}
          />
        ))}
      </div>

      <Button type="button" variant="ghost" onClick={addChild}>
        {t('guest.addChild')}
      </Button>

      <Button type="submit">{submitLabel ?? t('guest.submit')}</Button>
    </form>
  )
}

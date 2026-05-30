import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uuidv7 } from 'uuidv7'
import type { PartySnapshot, AnswerMap } from '@/domain/entities/Party'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { ChildAnswers } from './ChildAnswers'
import { QuestionInput } from './QuestionInput'
import { useSubmitting } from '@/presentation/hooks/useSubmitting'

interface RsvpFormProps {
  snapshot: PartySnapshot
  onSubmit: (input: {
    parentsLabel: string
    familyAnswers: AnswerMap
    children: { name: string; answers: AnswerMap; isSibling: boolean }[]
  }) => void | Promise<void>
  initial?: {
    parentsLabel: string
    familyAnswers: AnswerMap
    children: { name: string; answers: AnswerMap; isSibling?: boolean }[]
  }
  submitLabel?: string
}

interface ChildEntry {
  id: string
  name: string
  answers: AnswerMap
  isSibling: boolean
}

export function RsvpForm({ snapshot, onSubmit, initial, submitLabel }: RsvpFormProps) {
  const { t } = useTranslation()
  const { status, run } = useSubmitting()

  const familyQuestions = snapshot.questions.filter((q) => q.scope === 'family')
  const childQuestions = snapshot.questions.filter((q) => q.scope === 'child')

  const [parentsLabel, setParentsLabel] = useState(initial?.parentsLabel ?? '')
  const [familyAnswers, setFamilyAnswers] = useState<AnswerMap>(initial?.familyAnswers ?? {})
  const [children, setChildren] = useState<ChildEntry[]>(
    initial?.children?.length
      ? initial.children.map((c) => ({
          id: uuidv7(),
          name: c.name,
          answers: c.answers,
          isSibling: c.isSibling ?? false,
        }))
      : [{ id: uuidv7(), name: '', answers: {}, isSibling: false }],
  )
  const [firstChildTouched, setFirstChildTouched] = useState(!!initial)

  function updateChild(
    id: string,
    value: { name: string; answers: AnswerMap; isSibling: boolean },
    index: number,
  ) {
    if (index === 0 && !firstChildTouched) {
      const currentName = children[0]?.name ?? ''
      if (value.name !== currentName) {
        setFirstChildTouched(true)
      }
    }
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...value } : c)))
  }

  function handleParentsLabelChange(newValue: string) {
    setParentsLabel(newValue)
    if (!firstChildTouched) {
      setChildren((prev) => {
        const [first, ...rest] = prev
        return [{ ...first!, name: newValue }, ...rest]
      })
    }
  }

  function addChild() {
    setChildren((prev) => [...prev, { id: uuidv7(), name: '', answers: {}, isSibling: true }])
  }

  function removeChild(index: number) {
    setChildren((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void run(async () => {
      await onSubmit({
        parentsLabel,
        familyAnswers,
        children: children.map(({ name, answers, isSibling }) => ({ name, answers, isSibling })),
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Parent identification */}
      <Input
        label={t('guest.weAreParentsOf')}
        value={parentsLabel}
        onChange={(e) => handleParentsLabelChange(e.target.value)}
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
            value={{ name: child.name, answers: child.answers, isSibling: child.isSibling }}
            onChange={(v) => updateChild(child.id, v, i)}
            onRemove={children.length > 1 ? () => removeChild(i) : undefined}
            showSibling={i > 0}
          />
        ))}
      </div>

      <Button type="button" variant="ghost" onClick={addChild}>
        {t('guest.addChild')}
      </Button>

      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting'
          ? t('common.saving')
          : status === 'saved'
            ? t('common.saved')
            : (submitLabel ?? t('guest.submit'))}
      </Button>
    </form>
  )
}

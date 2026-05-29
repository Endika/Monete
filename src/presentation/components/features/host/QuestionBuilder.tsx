import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Question, QuestionType, QuestionScope } from '@/domain/entities/Party'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { STANDARD_QUESTIONS } from './standardQuestions'

interface QuestionBuilderProps {
  questions: Question[]
  onUpsert: (q: Omit<Question, 'id'> & { questionId?: string }) => void
  onRemove: (questionId: string) => void
}

interface FormState {
  label: string
  type: QuestionType
  scope: QuestionScope
  optionsText: string
  required: boolean
}

const DEFAULT_FORM: FormState = {
  label: '',
  type: 'text',
  scope: 'child',
  optionsText: '',
  required: false,
}

export function QuestionBuilder({ questions, onUpsert, onRemove }: QuestionBuilderProps) {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingKind, setEditingKind] = useState<Question['kind']>('custom')
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  const presentKinds = new Set(questions.map((q) => q.kind))
  const availablePresets = STANDARD_QUESTIONS.filter(
    (p) => p.kind === 'custom' || !presentKinds.has(p.kind),
  )

  function handlePreset(preset: (typeof STANDARD_QUESTIONS)[number]) {
    onUpsert({
      kind: preset.kind,
      type: preset.type,
      scope: preset.scope,
      options: preset.options,
      required: preset.required,
      label: t(preset.labelKey),
    })
  }

  function handleEdit(q: Question) {
    setEditingId(q.id)
    setEditingKind(q.kind)
    setForm({
      label: q.label,
      type: q.type,
      scope: q.scope,
      optionsText: q.options.join(', '),
      required: q.required,
    })
    setShowForm(true)
  }

  function handleSave() {
    const options =
      form.type === 'select'
        ? form.optionsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    onUpsert({
      kind: editingId ? editingKind : 'custom',
      type: form.type,
      scope: form.scope,
      label: form.label,
      options,
      required: form.required,
      ...(editingId ? { questionId: editingId } : {}),
    })
    setForm(DEFAULT_FORM)
    setEditingId(null)
    setEditingKind('custom')
    setShowForm(false)
  }

  function handleCancel() {
    setForm(DEFAULT_FORM)
    setEditingId(null)
    setEditingKind('custom')
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {availablePresets.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">{t('host.standardQuestions')}</span>
          <div className="flex flex-wrap gap-2">
            {availablePresets.map((preset) => (
              <button
                key={preset.kind}
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => handlePreset(preset)}
              >
                {t(preset.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
            >
              <span className="flex-1 text-sm">{q.label}</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {q.scope === 'family' ? t('host.scopeFamily') : t('host.scopeChild')}
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {q.type === 'select'
                  ? t('host.typeSelect')
                  : q.type === 'text'
                    ? t('host.typeText')
                    : q.type === 'number'
                      ? t('host.typeNumber')
                      : t('host.typeDate')}
              </span>
              <button
                type="button"
                className="text-xs text-amber-600 hover:underline"
                onClick={() => handleEdit(q)}
              >
                {t('common.edit')}
              </button>
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={() => onRemove(q.id)}
              >
                {t('common.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!showForm && (
        <Button type="button" onClick={() => setShowForm(true)}>
          {t('host.addQuestion')}
        </Button>
      )}

      {showForm && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <Input
            label={t('host.questionLabel')}
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">{t('host.questionType')}</span>
            <select
              id="question-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as QuestionType }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="select">{t('host.typeSelect')}</option>
              <option value="text">{t('host.typeText')}</option>
              <option value="number">{t('host.typeNumber')}</option>
              <option value="date">{t('host.typeDate')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">{t('host.questionScope')}</span>
            <select
              id="question-scope"
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as QuestionScope }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="family">{t('host.scopeFamily')}</option>
              <option value="child">{t('host.scopeChild')}</option>
            </select>
          </label>

          {form.type === 'select' && (
            <Input
              label={t('host.optionsLabel')}
              value={form.optionsText}
              onChange={(e) => setForm((f) => ({ ...f, optionsText: e.target.value }))}
              placeholder="Option 1, Option 2"
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              className="rounded border-gray-300"
            />
            {t('host.requiredLabel')}
          </label>

          <div className="flex gap-2">
            <Button type="button" onClick={handleSave}>
              {t('common.save')}
            </Button>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              onClick={handleCancel}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

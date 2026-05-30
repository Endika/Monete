import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Question, QuestionType, QuestionScope } from '@/domain/entities/Party'
import { Input } from '@/presentation/components/common/Input'
import { Button } from '@/presentation/components/common/Button'
import { STANDARD_QUESTIONS } from './standardQuestions'
import { useSubmitting } from '@/presentation/hooks/useSubmitting'

interface QuestionBuilderProps {
  questions: Question[]
  onUpsert: (q: Omit<Question, 'id'> & { questionId?: string }) => void | Promise<void>
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

// Rotating accent colours for preset chips
const PRESET_CHIP_COLORS = [
  'bg-banana/20 text-cocoa border border-banana hover:bg-banana/40',
  'bg-mint/20 text-cocoa border border-mint hover:bg-mint/40',
  'bg-sky/20 text-cocoa border border-sky hover:bg-sky/40',
  'bg-grape/20 text-cocoa border border-grape hover:bg-grape/40',
  'bg-raspberry/15 text-cocoa border border-raspberry hover:bg-raspberry/30',
]

export function QuestionBuilder({ questions, onUpsert, onRemove }: QuestionBuilderProps) {
  const { t } = useTranslation()
  const { status, run } = useSubmitting()
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
    void run(async () => {
      await onUpsert({
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
    })
  }

  function handleCancel() {
    setForm(DEFAULT_FORM)
    setEditingId(null)
    setEditingKind('custom')
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Standard question preset chips */}
      {availablePresets.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold font-display text-cocoa/80">
            {t('host.standardQuestions')}
          </span>
          <div className="flex flex-wrap gap-2">
            {availablePresets.map((preset, idx) => (
              <button
                key={preset.kind}
                type="button"
                className={`rounded-full px-4 py-1.5 text-sm font-semibold font-display transition-all duration-150 cursor-pointer ${PRESET_CHIP_COLORS[idx % PRESET_CHIP_COLORS.length]}`}
                onClick={() => handlePreset(preset)}
              >
                {t(preset.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Existing questions list */}
      {questions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex items-center gap-2 rounded-2xl bg-cream border border-cocoa/10 px-4 py-3"
            >
              <span className="flex-1 text-sm font-body text-cocoa font-medium">{q.label}</span>
              <span className="rounded-full bg-grape/15 px-2.5 py-0.5 text-xs font-semibold text-grape">
                {q.scope === 'family' ? t('host.scopeFamily') : t('host.scopeChild')}
              </span>
              <span className="rounded-full bg-sky/15 px-2.5 py-0.5 text-xs font-semibold text-sky">
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
                className="text-xs font-semibold text-banana hover:underline"
                onClick={() => handleEdit(q)}
              >
                {t('common.edit')}
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-raspberry hover:underline"
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
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-cocoa/10 bg-cream p-5">
          <Input
            label={t('host.questionLabel')}
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder={t('host.questionLabelPlaceholder')}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide">
              {t('host.questionType')}
            </span>
            <select
              id="question-type"
              aria-label={t('host.questionType')}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as QuestionType }))}
              className="w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
            >
              <option value="select">{t('host.typeSelect')}</option>
              <option value="text">{t('host.typeText')}</option>
              <option value="number">{t('host.typeNumber')}</option>
              <option value="date">{t('host.typeDate')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide">
              {t('host.questionScope')}
            </span>
            <select
              id="question-scope"
              aria-label={t('host.questionScope')}
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as QuestionScope }))}
              className="w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25"
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
              placeholder={t('host.optionsPlaceholder')}
            />
          )}

          <label className="flex items-center gap-2 text-sm font-body text-cocoa">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              className="rounded border-cocoa/30 accent-raspberry"
            />
            {t('host.requiredLabel')}
          </label>

          <div className="flex gap-2">
            <Button type="button" onClick={handleSave} disabled={status === 'submitting'}>
              {status === 'submitting'
                ? t('common.saving')
                : status === 'saved'
                  ? t('common.saved')
                  : t('common.save')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

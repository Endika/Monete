import type { Question } from '@/domain/entities/Party'

// Preset templates; labelKey resolves via i18n, options are editable by the host.
export interface StandardQuestion extends Omit<Question, 'id' | 'label'> {
  labelKey: string
}

export const STANDARD_QUESTIONS: StandardQuestion[] = [
  {
    kind: 'adultsCount',
    type: 'number',
    scope: 'family',
    options: [],
    required: true,
    labelKey: 'standard.adultsCount',
  },
  {
    kind: 'allergies',
    type: 'text',
    scope: 'child',
    options: [],
    required: false,
    labelKey: 'standard.allergies',
  },
  {
    kind: 'dateOfBirth',
    type: 'date',
    scope: 'child',
    options: [],
    required: false,
    labelKey: 'standard.dateOfBirth',
  },
  {
    kind: 'snack',
    type: 'select',
    scope: 'child',
    options: ['Pizza', 'Hot dog'],
    required: true,
    labelKey: 'standard.snack',
  },
]

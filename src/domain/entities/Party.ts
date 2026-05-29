import { uuidv7 } from 'uuidv7'
import { PartyId } from '@/domain/value-objects/PartyId'

export const QUESTION_TYPES = ['select', 'text', 'number', 'date'] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export const QUESTION_SCOPES = ['family', 'child'] as const
export type QuestionScope = (typeof QUESTION_SCOPES)[number]

export const QUESTION_KINDS = [
  'adultsCount',
  'allergies',
  'dateOfBirth',
  'snack',
  'custom',
] as const
export type QuestionKind = (typeof QUESTION_KINDS)[number]

export interface Question {
  id: string
  kind: QuestionKind
  type: QuestionType
  scope: QuestionScope
  label: string
  options: string[] // only meaningful for type === 'select'
  required: boolean
}

export type AnswerValue = string | number | null
export type AnswerMap = Record<string, AnswerValue>

export interface Child {
  id: string
  name: string
  isSibling: boolean
  answers: AnswerMap // answers to scope === 'child' questions, keyed by question id
}

export interface Rsvp {
  id: string
  parentsLabel: string
  familyAnswers: AnswerMap // answers to scope === 'family' questions
  children: Child[]
  createdAt: string
}

export interface EventDetails {
  title: string
  address: string
  startsAt: string // ISO-8601
  endsAt: string | null
  requirements: string
  allDay: boolean
  lat: number | null
  lng: number | null
}

export interface PartySnapshot {
  id: string
  event: EventDetails
  questions: Question[]
  rsvps: Rsvp[]
  editPin: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePartyInput {
  title: string
  address: string
  startsAt: string
  endsAt: string | null
  requirements: string
  allDay?: boolean
  lat?: number | null
  lng?: number | null
  id?: PartyId
  now?: string
}

function normalizeDetails(input: {
  title: string
  address: string
  startsAt: string
  endsAt: string | null
  requirements: string
  allDay?: boolean
  lat?: number | null
  lng?: number | null
}): EventDetails {
  const title = input.title.trim()
  if (title.length < 1 || title.length > 100) throw new Error('Party: title must be 1..100 chars')
  return {
    title,
    address: input.address.trim(),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    requirements: input.requirements.trim(),
    allDay: input.allDay ?? false,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  }
}

export class Party {
  private constructor(
    readonly id: PartyId,
    private readonly s: PartySnapshot,
  ) {}

  static create(input: CreatePartyInput): Party {
    const id = input.id ?? PartyId.generate()
    const now = input.now ?? new Date().toISOString()
    const snapshot: PartySnapshot = {
      id: id.value,
      event: normalizeDetails(input),
      questions: [],
      rsvps: [],
      editPin: null,
      createdAt: now,
      updatedAt: now,
    }
    return new Party(id, snapshot)
  }

  static restore(s: PartySnapshot): Party {
    const backfilled: PartySnapshot = {
      ...s,
      event: {
        ...s.event,
        allDay: s.event.allDay ?? false,
        lat: s.event.lat ?? null,
        lng: s.event.lng ?? null,
      },
      questions: (s.questions ?? []).map((q) => ({
        ...q,
        options: q.options ?? [],
        required: q.required ?? false,
      })),
      rsvps: (s.rsvps ?? []).map((r) => ({
        ...r,
        familyAnswers: r.familyAnswers ?? {},
        children: (r.children ?? []).map((c) => ({
          ...c,
          answers: c.answers ?? {},
          isSibling: c.isSibling ?? false,
        })),
      })),
      editPin: s.editPin ?? null,
    }
    return new Party(PartyId.of(s.id), backfilled)
  }

  editDetails(input: {
    title: string
    address: string
    startsAt: string
    endsAt: string | null
    requirements: string
    allDay?: boolean
    lat?: number | null
    lng?: number | null
    now?: string
  }): Party {
    const event = normalizeDetails(input)
    const now = input.now ?? new Date().toISOString()
    return new Party(this.id, { ...this.s, event, updatedAt: now })
  }

  setEditPin(hash: string | null, now?: string): Party {
    return new Party(this.id, {
      ...this.s,
      editPin: hash,
      updatedAt: now ?? new Date().toISOString(),
    })
  }

  private static normalizeQuestionFields(input: Omit<Question, 'id'>): Omit<Question, 'id'> {
    const label = input.label.trim()
    if (label.length < 1 || label.length > 120)
      throw new Error('Question: label must be 1..120 chars')
    const options =
      input.type === 'select' ? input.options.map((o) => o.trim()).filter(Boolean) : []
    if (input.type === 'select' && options.length < 1)
      throw new Error('Question: select needs at least one option')
    return {
      kind: input.kind,
      type: input.type,
      scope: input.scope,
      label,
      options,
      required: input.required,
    }
  }

  addQuestion(input: Omit<Question, 'id'>, now?: string): Party {
    const fields = Party.normalizeQuestionFields(input)
    const question: Question = { id: uuidv7(), ...fields }
    return new Party(this.id, {
      ...this.s,
      questions: [...this.s.questions, question],
      updatedAt: now ?? new Date().toISOString(),
    })
  }

  updateQuestion(id: string, input: Omit<Question, 'id'>, now?: string): Party {
    if (!this.s.questions.some((q) => q.id === id)) throw new Error('Question: not found')
    const fields = Party.normalizeQuestionFields(input)
    const questions = this.s.questions.map((q) => (q.id === id ? { id, ...fields } : q))
    return new Party(this.id, { ...this.s, questions, updatedAt: now ?? new Date().toISOString() })
  }

  removeQuestion(id: string, now?: string): Party {
    const questions = this.s.questions.filter((q) => q.id !== id)
    return new Party(this.id, { ...this.s, questions, updatedAt: now ?? new Date().toISOString() })
  }

  private validateAnswers(questions: Question[], answers: AnswerMap, who: string): void {
    for (const q of questions) {
      const v = answers[q.id]
      const empty = v === null || v === undefined || v === ''
      if (q.required && empty) throw new Error(`Rsvp: "${q.label}" is required for ${who}`)
      if (!empty && q.type === 'select' && !q.options.includes(String(v)))
        throw new Error(`Rsvp: "${String(v)}" is not a valid option for "${q.label}"`)
    }
  }

  private buildChildren(
    children: { name: string; answers: AnswerMap; isSibling?: boolean }[],
  ): Child[] {
    const childQuestions = this.s.questions.filter((q) => q.scope === 'child')
    return children.map((c) => {
      const name = c.name.trim()
      if (name.length < 1) throw new Error('Rsvp: each child needs a name')
      this.validateAnswers(childQuestions, c.answers, name)
      return { id: uuidv7(), name, isSibling: c.isSibling ?? false, answers: { ...c.answers } }
    })
  }

  buildRsvp(input: {
    parentsLabel: string
    familyAnswers: AnswerMap
    children: { name: string; answers: AnswerMap; isSibling?: boolean }[]
    now?: string
  }): Rsvp {
    const parentsLabel = input.parentsLabel.trim()
    if (parentsLabel.length < 1) throw new Error('Rsvp: parentsLabel is required')
    if (input.children.length < 1) throw new Error('Rsvp: at least one child is required')

    const familyQuestions = this.s.questions.filter((q) => q.scope === 'family')
    this.validateAnswers(familyQuestions, input.familyAnswers, 'the family')
    const children = this.buildChildren(input.children)

    return {
      id: uuidv7(),
      parentsLabel,
      familyAnswers: { ...input.familyAnswers },
      children,
      createdAt: input.now ?? new Date().toISOString(),
    }
  }

  updateRsvp(
    rsvpId: string,
    input: {
      parentsLabel: string
      familyAnswers: AnswerMap
      children: { name: string; answers: AnswerMap; isSibling?: boolean }[]
    },
    now?: string,
  ): Party {
    const existing = this.s.rsvps.find((r) => r.id === rsvpId)
    if (!existing) throw new Error('Rsvp: not found')
    const parentsLabel = input.parentsLabel.trim()
    if (parentsLabel.length < 1) throw new Error('Rsvp: parentsLabel is required')
    if (input.children.length < 1) throw new Error('Rsvp: at least one child is required')
    const familyQuestions = this.s.questions.filter((q) => q.scope === 'family')
    this.validateAnswers(familyQuestions, input.familyAnswers, 'the family')
    const children = this.buildChildren(input.children)
    const updated: Rsvp = {
      ...existing,
      parentsLabel,
      familyAnswers: { ...input.familyAnswers },
      children,
    }
    const rsvps = this.s.rsvps.map((r) => (r.id === rsvpId ? updated : r))
    return new Party(this.id, { ...this.s, rsvps, updatedAt: now ?? new Date().toISOString() })
  }

  removeRsvp(rsvpId: string, now?: string): Party {
    if (!this.s.rsvps.some((r) => r.id === rsvpId)) throw new Error('Rsvp: not found')
    const rsvps = this.s.rsvps.filter((r) => r.id !== rsvpId)
    return new Party(this.id, { ...this.s, rsvps, updatedAt: now ?? new Date().toISOString() })
  }

  toSnapshot(): PartySnapshot {
    return structuredClone(this.s)
  }
}

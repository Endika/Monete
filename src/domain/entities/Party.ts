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
  id?: PartyId
  now?: string
}

function normalizeDetails(input: {
  title: string
  address: string
  startsAt: string
  endsAt: string | null
  requirements: string
}): EventDetails {
  const title = input.title.trim()
  if (title.length < 1 || title.length > 100) throw new Error('Party: title must be 1..100 chars')
  return {
    title,
    address: input.address.trim(),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    requirements: input.requirements.trim(),
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
      questions: (s.questions ?? []).map((q) => ({
        ...q,
        options: q.options ?? [],
        required: q.required ?? false,
      })),
      rsvps: (s.rsvps ?? []).map((r) => ({
        ...r,
        familyAnswers: r.familyAnswers ?? {},
        children: (r.children ?? []).map((c) => ({ ...c, answers: c.answers ?? {} })),
      })),
      editPin: s.editPin ?? null,
    }
    return new Party(PartyId.of(s.id), backfilled)
  }

  toSnapshot(): PartySnapshot {
    return structuredClone(this.s)
  }
}

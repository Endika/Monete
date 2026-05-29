import { z } from 'zod'
import {
  QUESTION_KINDS,
  QUESTION_SCOPES,
  QUESTION_TYPES,
  type PartySnapshot,
} from '@/domain/entities/Party'

const AnswerValueSchema = z.union([z.string(), z.number(), z.null()])
const AnswerMapSchema = z.record(z.string(), AnswerValueSchema).default({})

const QuestionSchema = z.object({
  id: z.string(),
  kind: z.enum(QUESTION_KINDS),
  type: z.enum(QUESTION_TYPES),
  scope: z.enum(QUESTION_SCOPES),
  label: z.string(),
  options: z.array(z.string()).default([]),
  required: z.boolean().default(false),
})

const ChildSchema = z.object({
  id: z.string(),
  name: z.string(),
  answers: AnswerMapSchema,
})

const RsvpSchema = z.object({
  id: z.string(),
  parentsLabel: z.string(),
  familyAnswers: AnswerMapSchema,
  children: z.array(ChildSchema).default([]),
  createdAt: z.string(),
})

const EventDetailsSchema = z.object({
  title: z.string(),
  address: z.string().default(''),
  startsAt: z.string(),
  endsAt: z.string().nullable().default(null),
  requirements: z.string().default(''),
  allDay: z.boolean().default(false),
})

/**
 * ⚠️ If you add/remove/rename a field here, bump SCHEMA_VERSION in ./schemaVersion.ts —
 * the server-side stale-client write guard relies on it.
 */
export const PartySnapshotSchema = z.object({
  id: z.string(),
  event: EventDetailsSchema,
  questions: z.array(QuestionSchema).default([]),
  rsvps: z.array(RsvpSchema).default([]),
  editPin: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export function parsePartySnapshot(raw: unknown): PartySnapshot {
  const result = PartySnapshotSchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    throw new Error(`Party snapshot validation failed: ${issues}`)
  }
  return result.data as PartySnapshot
}

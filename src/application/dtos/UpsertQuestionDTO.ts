import { z } from 'zod'
import { PinField } from '@/application/dtos/shapes'
import { QUESTION_KINDS, QUESTION_SCOPES, QUESTION_TYPES } from '@/domain/entities/Party'
export const UpsertQuestionSchema = z.object({
  partyId: z.string(),
  questionId: z.string().optional(),
  kind: z.enum(QUESTION_KINDS),
  type: z.enum(QUESTION_TYPES),
  scope: z.enum(QUESTION_SCOPES),
  label: z.string().trim().min(1).max(120),
  options: z.array(z.string().trim()).default([]),
  required: z.boolean().default(false),
  pin: PinField,
})
export type UpsertQuestionInput = z.input<typeof UpsertQuestionSchema>

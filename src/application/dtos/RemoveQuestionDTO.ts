import { z } from 'zod'
import { PinField } from '@/application/dtos/shapes'
export const RemoveQuestionSchema = z.object({
  partyId: z.string(),
  questionId: z.string(),
  pin: PinField,
})
export type RemoveQuestionInput = z.input<typeof RemoveQuestionSchema>

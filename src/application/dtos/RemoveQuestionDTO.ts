import { z } from 'zod'
export const RemoveQuestionSchema = z.object({
  partyId: z.string(),
  questionId: z.string(),
  /** Unlocked edit PIN (null for a PIN-less party). Enforced server-side. */
  pin: z.string().nullable().optional(),
})
export type RemoveQuestionInput = z.infer<typeof RemoveQuestionSchema>

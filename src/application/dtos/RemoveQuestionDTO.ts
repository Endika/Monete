import { z } from 'zod'
export const RemoveQuestionSchema = z.object({ partyId: z.string(), questionId: z.string() })
export type RemoveQuestionInput = z.infer<typeof RemoveQuestionSchema>

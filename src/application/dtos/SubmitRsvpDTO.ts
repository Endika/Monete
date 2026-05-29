import { z } from 'zod'
const AnswerMap = z.record(z.string(), z.union([z.string(), z.number(), z.null()])).default({})
export const SubmitRsvpSchema = z.object({
  partyId: z.string(),
  parentsLabel: z.string().trim().min(1).max(120),
  familyAnswers: AnswerMap,
  children: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        answers: AnswerMap,
        isSibling: z.boolean().optional().default(false),
      }),
    )
    .min(1),
})
export type SubmitRsvpInput = z.input<typeof SubmitRsvpSchema>

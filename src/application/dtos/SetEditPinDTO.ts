import { z } from 'zod'
export const SetEditPinSchema = z.object({
  partyId: z.string(),
  pin: z
    .string()
    .regex(/^\d{4,6}$/)
    .nullable(),
})
export type SetEditPinInput = z.infer<typeof SetEditPinSchema>

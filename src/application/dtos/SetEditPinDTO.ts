import { z } from 'zod'
export const SetEditPinSchema = z.object({
  partyId: z.string(),
  /** New PIN to set, or null to remove the PIN. */
  pin: z
    .string()
    .regex(/^\d{4,6}$/)
    .nullable(),
  /** Current PIN — required by the server to change or remove an existing PIN. */
  currentPin: z.string().nullable().optional(),
})
export type SetEditPinInput = z.infer<typeof SetEditPinSchema>

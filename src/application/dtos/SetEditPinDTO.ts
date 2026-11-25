import { z } from 'zod'

const EDIT_PIN = /^\d{4,6}$/

export const isEditPin = (pin: string): boolean => EDIT_PIN.test(pin)

export const SetEditPinSchema = z.object({
  partyId: z.string(),
  /** New PIN to set, or null to remove the PIN. */
  pin: z.string().regex(EDIT_PIN).nullable(),
  /** Current PIN — required by the server to change or remove an existing PIN. */
  currentPin: z.string().nullable().optional(),
})
export type SetEditPinInput = z.infer<typeof SetEditPinSchema>

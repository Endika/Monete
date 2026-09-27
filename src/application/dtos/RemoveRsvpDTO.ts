import { z } from 'zod'
export const RemoveRsvpSchema = z.object({
  partyId: z.string(),
  rsvpId: z.string(),
  /** Unlocked edit PIN (null for a PIN-less party). Enforced server-side. */
  pin: z.string().nullable().optional(),
})
export type RemoveRsvpInput = z.input<typeof RemoveRsvpSchema>

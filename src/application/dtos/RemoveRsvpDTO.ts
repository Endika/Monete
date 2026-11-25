import { z } from 'zod'
import { PinField } from '@/application/dtos/shapes'
export const RemoveRsvpSchema = z.object({
  partyId: z.string(),
  rsvpId: z.string(),
  pin: PinField,
})
export type RemoveRsvpInput = z.input<typeof RemoveRsvpSchema>

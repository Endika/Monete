import { z } from 'zod'
export const RemoveRsvpSchema = z.object({ partyId: z.string(), rsvpId: z.string() })
export type RemoveRsvpInput = z.infer<typeof RemoveRsvpSchema>

import { z } from 'zod'
import { RsvpBodySchema } from '@/application/dtos/shapes'

export const UpdateRsvpSchema = RsvpBodySchema.extend({ partyId: z.string(), rsvpId: z.string() })
export type UpdateRsvpInput = z.input<typeof UpdateRsvpSchema>

import { z } from 'zod'
import { RsvpBodySchema } from '@/application/dtos/shapes'

export const SubmitRsvpSchema = RsvpBodySchema.extend({ partyId: z.string() })
export type SubmitRsvpInput = z.input<typeof SubmitRsvpSchema>

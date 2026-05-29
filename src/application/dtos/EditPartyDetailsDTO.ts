import { z } from 'zod'
export const EditPartyDetailsSchema = z.object({
  partyId: z.string(),
  title: z.string().trim().min(1).max(100),
  address: z.string().trim().max(300).default(''),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().default(null),
  requirements: z.string().trim().max(1000).default(''),
  allDay: z.boolean().default(false),
})
export type EditPartyDetailsInput = z.infer<typeof EditPartyDetailsSchema>

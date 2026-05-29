import { z } from 'zod'

export const CreatePartySchema = z.object({
  title: z.string().trim().min(1).max(100),
  address: z.string().trim().max(300).default(''),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().default(null),
  requirements: z.string().trim().max(1000).default(''),
})

export type CreatePartyInput = z.infer<typeof CreatePartySchema>

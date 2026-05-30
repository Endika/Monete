import { z } from 'zod'

export const CreatePartySchema = z.object({
  title: z.string().trim().min(1).max(100),
  venueName: z.string().trim().max(120).default(''),
  address: z.string().trim().max(300).default(''),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().default(null),
  requirements: z.string().trim().max(1000).default(''),
  allDay: z.boolean().default(false),
  lat: z.number().nullable().optional().default(null),
  lng: z.number().nullable().optional().default(null),
})

export type CreatePartyInput = z.input<typeof CreatePartySchema>

import { z } from 'zod'
import { EventFieldsSchema, PinField } from '@/application/dtos/shapes'

export const EditPartyDetailsSchema = EventFieldsSchema.extend({
  partyId: z.string(),
  pin: PinField,
})
export type EditPartyDetailsInput = z.input<typeof EditPartyDetailsSchema>

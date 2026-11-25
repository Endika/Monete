import type { z } from 'zod'
import { EventFieldsSchema } from '@/application/dtos/shapes'

export const CreatePartySchema = EventFieldsSchema

export type CreatePartyInput = z.input<typeof CreatePartySchema>

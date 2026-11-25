import { z } from 'zod'

/** Unlocked edit PIN (null for a PIN-less party). Enforced server-side. */
export const PinField = z.string().nullable().optional()

const AnswerMap = z.record(z.string(), z.union([z.string(), z.number(), z.null()])).default({})

export const EventFieldsSchema = z.object({
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

export const RsvpBodySchema = z.object({
  parentsLabel: z.string().trim().min(1).max(120),
  familyAnswers: AnswerMap,
  children: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        answers: AnswerMap,
        isSibling: z.boolean().optional().default(false),
        isBirthday: z.boolean().optional().default(false),
      }),
    )
    .min(1),
  pin: PinField,
})

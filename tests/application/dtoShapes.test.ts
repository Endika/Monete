import { describe, it, expect } from 'vitest'
import { EventFieldsSchema, PinField, RsvpBodySchema } from '@/application/dtos/shapes'
import { UpsertQuestionSchema } from '@/application/dtos/UpsertQuestionDTO'
import { RemoveQuestionSchema } from '@/application/dtos/RemoveQuestionDTO'
import { RemoveRsvpSchema } from '@/application/dtos/RemoveRsvpDTO'

describe('EventFieldsSchema', () => {
  it('trims the text fields and fills in the ones left out', () => {
    expect(
      EventFieldsSchema.parse({
        title: '  Leo 5  ',
        venueName: '  Sala  ',
        address: '  Calle Mayor 1  ',
        startsAt: '2026-06-20T17:00:00.000Z',
        requirements: '  Calcetines  ',
      }),
    ).toEqual({
      title: 'Leo 5',
      venueName: 'Sala',
      address: 'Calle Mayor 1',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: 'Calcetines',
      allDay: false,
      lat: null,
      lng: null,
    })
  })
})

describe('EventFieldsSchema defaults', () => {
  it('leaves venue, address and requirements empty when omitted', () => {
    expect(
      EventFieldsSchema.parse({ title: 'Leo 5', startsAt: '2026-06-20T17:00:00.000Z' }),
    ).toMatchObject({ venueName: '', address: '', requirements: '' })
  })
})

describe('PIN normalisation', () => {
  it.each([
    ['PinField', (pin?: string | null) => PinField.parse(pin)],
    [
      'RemoveQuestionSchema',
      (pin?: string | null) =>
        RemoveQuestionSchema.parse({ partyId: 'p', questionId: 'q', pin }).pin,
    ],
    [
      'RemoveRsvpSchema',
      (pin?: string | null) => RemoveRsvpSchema.parse({ partyId: 'p', rsvpId: 'r', pin }).pin,
    ],
  ])('%s turns a missing PIN into null and keeps a given one', (_name, parse) => {
    expect(parse(undefined)).toBeNull()
    expect(parse(null)).toBeNull()
    expect(parse('1234')).toBe('1234')
  })
})

describe('UpsertQuestionSchema', () => {
  const base = { partyId: 'p', kind: 'snack', type: 'select', scope: 'child', label: 'Snack' }

  it('trims the label and options, and defaults options, required and pin', () => {
    expect(UpsertQuestionSchema.parse({ ...base, label: '  Snack  ' })).toMatchObject({
      label: 'Snack',
      options: [],
      required: false,
      pin: null,
    })
    expect(UpsertQuestionSchema.parse({ ...base, options: ['  Pizza  '] }).options).toEqual([
      'Pizza',
    ])
  })
})

describe('RsvpBodySchema', () => {
  it('trims the names and fills in answers and flags left out', () => {
    expect(
      RsvpBodySchema.parse({
        parentsLabel: '  Familia Ruiz  ',
        children: [{ name: '  Leo  ' }, { name: 'Mia', isSibling: true }],
      }),
    ).toEqual({
      parentsLabel: 'Familia Ruiz',
      familyAnswers: {},
      pin: null,
      children: [
        { name: 'Leo', answers: {}, isSibling: false, isBirthday: false },
        { name: 'Mia', answers: {}, isSibling: true, isBirthday: false },
      ],
    })
  })
})

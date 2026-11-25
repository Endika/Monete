import { describe, it, expect } from 'vitest'
import { EventFieldsSchema, RsvpBodySchema } from '@/application/dtos/shapes'

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
      children: [
        { name: 'Leo', answers: {}, isSibling: false, isBirthday: false },
        { name: 'Mia', answers: {}, isSibling: true, isBirthday: false },
      ],
    })
  })
})

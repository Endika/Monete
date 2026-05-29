import { describe, it, expect } from 'vitest'
import { Party } from '@/domain/entities/Party'

function base() {
  return Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
    now: '2026-05-29T00:00:00.000Z',
  })
}

describe('Party questions', () => {
  it('adds a child-scope select question with options', () => {
    const p = base().addQuestion({
      kind: 'snack',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza', 'Hot dog'],
      required: true,
    })
    const q = p.toSnapshot().questions[0]!
    expect(q.id).toMatch(/[0-9a-f-]{36}/)
    expect(q.scope).toBe('child')
    expect(q.options).toEqual(['Pizza', 'Hot dog'])
  })

  it('rejects a select question with no options', () => {
    expect(() =>
      base().addQuestion({
        kind: 'custom',
        type: 'select',
        scope: 'child',
        label: 'X',
        options: [],
        required: false,
      }),
    ).toThrow()
  })

  it('rejects a blank label', () => {
    expect(() =>
      base().addQuestion({
        kind: 'custom',
        type: 'text',
        scope: 'child',
        label: '  ',
        options: [],
        required: false,
      }),
    ).toThrow()
  })

  it('updates an existing question by id', () => {
    const p = base().addQuestion({
      kind: 'custom',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza'],
      required: false,
    })
    const id = p.toSnapshot().questions[0]!.id
    const updated = p.updateQuestion(id, {
      kind: 'custom',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza', 'Sushi'],
      required: true,
    })
    expect(updated.toSnapshot().questions[0]!.options).toEqual(['Pizza', 'Sushi'])
    expect(updated.toSnapshot().questions[0]!.required).toBe(true)
  })

  it('removes a question by id', () => {
    const p = base().addQuestion({
      kind: 'custom',
      type: 'text',
      scope: 'family',
      label: 'Notes',
      options: [],
      required: false,
    })
    const id = p.toSnapshot().questions[0]!.id
    expect(p.removeQuestion(id).toSnapshot().questions).toEqual([])
  })
})

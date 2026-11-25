import { describe, it, expect } from 'vitest'
import { availablePresets, parseOptions } from '@/presentation/utils/questionForm'
import type { Question } from '@/domain/entities/Party'

describe('availablePresets', () => {
  it('drops the presets whose kind the party already asks', () => {
    const asked = [{ kind: 'snack' }] as Question[]
    expect(availablePresets([{ kind: 'snack' }, { kind: 'allergies' }], asked)).toEqual([
      { kind: 'allergies' },
    ])
  })
})

describe('parseOptions', () => {
  it('splits and trims a select list, skipping blanks, and gives other types none', () => {
    expect(parseOptions('select', ' Pizza , Hot dog,, ')).toEqual(['Pizza', 'Hot dog'])
    expect(parseOptions('text', 'Pizza, Hot dog')).toEqual([])
  })
})

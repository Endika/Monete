import { describe, it, expect } from 'vitest'
import { STANDARD_QUESTIONS } from '@/presentation/components/features/host/standardQuestions'

describe('standard question presets', () => {
  it('defines adults (family), allergies/dob/snack (child) with snack options', () => {
    const byKind = Object.fromEntries(STANDARD_QUESTIONS.map((q) => [q.kind, q]))
    expect(byKind.adultsCount!.scope).toBe('family')
    expect(byKind.adultsCount!.type).toBe('number')
    expect(byKind.allergies!.scope).toBe('child')
    expect(byKind.dateOfBirth!.type).toBe('date')
    expect(byKind.snack!.type).toBe('select')
    expect(byKind.snack!.options.length).toBeGreaterThan(0)
  })
})

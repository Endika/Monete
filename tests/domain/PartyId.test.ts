import { describe, it, expect } from 'vitest'
import { PartyId } from '@/domain/value-objects/PartyId'

describe('PartyId', () => {
  it('generates a 7-char lowercase alphanumeric id', () => {
    const id = PartyId.generate()
    expect(id.value).toMatch(/^[a-z0-9]{7}$/)
  })

  it('rejects malformed ids', () => {
    expect(() => PartyId.of('ABC')).toThrow()
    expect(() => PartyId.of('toolongvalue')).toThrow()
  })

  it('accepts a well-formed id', () => {
    expect(PartyId.of('abc1234').value).toBe('abc1234')
  })
})

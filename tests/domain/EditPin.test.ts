import { describe, it, expect } from 'vitest'
import { EditPin } from '@/domain/value-objects/EditPin'

describe('EditPin', () => {
  it('rejects non 4-6 digit pins', () => {
    expect(() => EditPin.validateFormat('123')).toThrow()
    expect(() => EditPin.validateFormat('abcd')).toThrow()
  })

  it('hashes and verifies the same pin for the same party', async () => {
    const hash = await EditPin.hash('1234', 'abc1234')
    expect(await EditPin.verify('1234', hash, 'abc1234')).toBe(true)
    expect(await EditPin.verify('9999', hash, 'abc1234')).toBe(false)
  })

  it('binds the hash to the party id', async () => {
    const hash = await EditPin.hash('1234', 'abc1234')
    expect(await EditPin.verify('1234', hash, 'zzz9999')).toBe(false)
  })
})

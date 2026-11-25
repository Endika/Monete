import { describe, it, expect } from 'vitest'
import { Container } from '@/shared/di/Container'

describe('Container', () => {
  it('throws naming the key when it is not registered', () => {
    expect(() => new Container().resolve('nope')).toThrow('Container: "nope" is not registered')
  })
})

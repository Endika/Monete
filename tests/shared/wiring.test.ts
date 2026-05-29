import { describe, it, expect } from 'vitest'
import { buildContainer } from '@/shared/di/wiring'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'

describe('wiring', () => {
  it('resolves handlers backed by the in-memory repo in test mode', () => {
    const c = buildContainer({ inMemory: true })
    expect(c.resolve('createParty')).toBeInstanceOf(CreatePartyHandler)
  })
})

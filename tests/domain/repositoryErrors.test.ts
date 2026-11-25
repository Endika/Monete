import { describe, it, expect } from 'vitest'
import {
  PayloadTooLargeError,
  RateLimitedError,
  StaleClientError,
  VersionConflictError,
  WrongPinError,
} from '@/domain/repositories/IPartyRepository'

describe('repository errors', () => {
  it.each([
    [new StaleClientError(), 'StaleClientError', 'STALE_CLIENT', /older than the stored party/],
    [new WrongPinError(), 'WrongPinError', 'WRONG_PIN', /Wrong or missing edit PIN/],
    [
      new PayloadTooLargeError(),
      'PayloadTooLargeError',
      'PAYLOAD_TOO_LARGE',
      /exceeds the allowed/,
    ],
    [new RateLimitedError(), 'RateLimitedError', 'RATE_LIMITED', /Too many PIN attempts/],
  ])('%s carries its name, code and message', (err, name, code, message) => {
    expect(err.name).toBe(name)
    expect(err.code).toBe(code)
    expect(err.message).toMatch(message)
  })

  it('reports the server version on a conflict', () => {
    const err = new VersionConflictError(7)
    expect(err.currentVersion).toBe(7)
    expect(err.message).toBe('Version conflict: server is at 7')
  })
})

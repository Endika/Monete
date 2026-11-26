import { describe, it, expect } from 'vitest'
import { messageForError } from '@/presentation/utils/writeError'

const coded = (code: string) => Object.assign(new Error('raw'), { code })
const t = (key: string) => `t:${key}`

describe('messageForError', () => {
  it('translates the server guards and passes anything else through', () => {
    expect(
      ['PAYLOAD_TOO_LARGE', 'STALE_CLIENT', 'WRONG_PIN', 'RATE_LIMITED'].map((c) =>
        messageForError(t, coded(c)),
      ),
    ).toEqual([
      't:common.tooLarge',
      't:common.updateRequired',
      't:host.wrongPin',
      't:host.tooManyAttempts',
    ])
    expect(messageForError(t, coded('OTHER'))).toBe('raw')
    expect(messageForError(t, 'boom')).toBe('boom')
  })
})

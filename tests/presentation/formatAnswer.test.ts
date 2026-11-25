import { describe, it, expect, afterEach } from 'vitest'
import { formatAnswer } from '@/presentation/utils/formatAnswer'

const tz = process.env.TZ
afterEach(() => {
  process.env.TZ = tz
})

describe('formatAnswer', () => {
  it('shows a dash for no answer and other answers as written', () => {
    expect([null, ''].map((v) => formatAnswer(v, 'text', 'en-GB'))).toEqual(['—', '—'])
    expect(formatAnswer(3, 'number', 'en-GB')).toBe('3')
    expect(formatAnswer('2020-05-01', 'text', 'en-GB')).toBe('2020-05-01')
  })

  it('shows a date answer as that same day west of UTC, and an unreadable one as written', () => {
    process.env.TZ = 'America/New_York'
    expect(formatAnswer('2020-05-01', 'date', 'en-GB')).toBe('01/05/2020')
    expect(formatAnswer('soon', 'date', 'en-GB')).toBe('soon')
  })
})

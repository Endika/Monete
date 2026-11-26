import { describe, it, expect } from 'vitest'
import { composeEventTimes, splitEventTimes } from '@/shared/utils/eventDateTime'

describe('eventDateTime', () => {
  it('round-trips through split', () => {
    const composed = composeEventTimes({
      startDate: '2026-06-20',
      startTime: '17:00',
      endDate: '2026-06-21',
      endTime: '12:00',
    })
    const split = splitEventTimes(composed)
    expect(split.startDate).toBe('2026-06-20')
    expect(split.startTime).toBe('17:00')
    expect(split.endDate).toBe('2026-06-21')
    expect(split.endTime).toBe('12:00')
  })

  it('splits an all-day multi-day event without times', () => {
    const split = splitEventTimes(
      composeEventTimes({
        startDate: '2026-06-20',
        startTime: '',
        endDate: '2026-06-22',
        endTime: '',
      }),
    )
    expect(split).toEqual({
      startDate: '2026-06-20',
      startTime: '',
      endDate: '2026-06-22',
      endTime: '',
    })
  })

  it('splits a same-day timed event with an empty end date and no end time when open-ended', () => {
    const same = splitEventTimes(
      composeEventTimes({
        startDate: '2026-06-20',
        startTime: '17:00',
        endDate: '',
        endTime: '19:00',
      }),
    )
    expect(same).toEqual({
      startDate: '2026-06-20',
      startTime: '17:00',
      endDate: '',
      endTime: '19:00',
    })
    const open = splitEventTimes(
      composeEventTimes({ startDate: '2026-06-20', startTime: '17:00', endDate: '', endTime: '' }),
    )
    expect(open).toEqual({ startDate: '2026-06-20', startTime: '17:00', endDate: '', endTime: '' })
  })
})

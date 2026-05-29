import { describe, it, expect } from 'vitest'
import { composeEventTimes, splitEventTimes } from '@/shared/utils/eventDateTime'

describe('eventDateTime', () => {
  it('all-day when no start time', () => {
    const composed = composeEventTimes({
      startDate: '2026-06-20',
      startTime: '',
      endDate: '',
      endTime: '',
    })
    expect(composed.allDay).toBe(true)
    expect(composed.endsAt).toBeNull()
    expect(splitEventTimes(composed).startDate).toBe('2026-06-20') // local date round-trips, tz-stable
  })

  it('timed single-day with range', () => {
    const { allDay, endsAt } = composeEventTimes({
      startDate: '2026-06-20',
      startTime: '17:00',
      endDate: '',
      endTime: '19:00',
    })
    expect(allDay).toBe(false)
    expect(endsAt).not.toBeNull()
  })

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
})

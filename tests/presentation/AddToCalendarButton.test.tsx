import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddToCalendarButton } from '@/presentation/components/features/guest/AddToCalendarButton'
import '@/presentation/i18n/config'

const event = {
  title: 'Leo turns 5',
  address: 'Fun Park',
  startsAt: '2026-06-20T17:00:00.000Z',
  endsAt: null,
}

describe('AddToCalendarButton', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('opens the google calendar url on android', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<AddToCalendarButton event={event} userAgent="Mozilla/5.0 (Linux; Android 14)" />)
    await userEvent.click(screen.getByRole('button', { name: /add to calendar/i }))
    expect(open).toHaveBeenCalledWith(expect.stringContaining('calendar.google.com'), '_blank')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddToCalendarButton } from '@/presentation/components/features/guest/AddToCalendarButton'
import '@/presentation/i18n/config'

const event = {
  title: 'Party',
  address: 'Home',
  startsAt: '2026-06-20T17:00:00.000Z',
  endsAt: null,
}

describe('AddToCalendarButton', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('opens google calendar from the Google option', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<AddToCalendarButton event={event} />)
    await userEvent.click(screen.getByRole('button', { name: /add to calendar/i }))
    await userEvent.click(screen.getByRole('button', { name: /google calendar/i }))
    expect(open).toHaveBeenCalledWith(expect.stringContaining('calendar.google.com'), '_blank')
  })

  it('offers the .ics option', async () => {
    render(<AddToCalendarButton event={event} />)
    await userEvent.click(screen.getByRole('button', { name: /add to calendar/i }))
    expect(screen.getByRole('button', { name: /apple|outlook|\.ics/i })).toBeInTheDocument()
  })
})

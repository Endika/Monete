import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RsvpForm } from '@/presentation/components/features/guest/RsvpForm'
import { Party } from '@/domain/entities/Party'
import '@/presentation/i18n/config'

function snap() {
  return Party.create({
    title: 'P',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  }).toSnapshot()
}

describe('RsvpForm v1.2', () => {
  it('auto-fills the first child name from the parents-of field', async () => {
    const onSubmit = vi.fn()
    render(<RsvpForm snapshot={snap()} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText(/family of/i), 'Leo')
    await userEvent.click(screen.getByRole('button', { name: /send rsvp/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        children: [expect.objectContaining({ name: 'Leo', isSibling: false })],
      }),
    )
  })

  it('marks an added child as sibling by default', async () => {
    const onSubmit = vi.fn()
    render(<RsvpForm snapshot={snap()} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText(/family of/i), 'Leo')
    await userEvent.click(screen.getByRole('button', { name: /add a child/i }))
    const names = screen.getAllByLabelText(/child name/i)
    await userEvent.type(names[1]!, 'Mia')
    await userEvent.click(screen.getByRole('button', { name: /send rsvp/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        children: [
          expect.objectContaining({ name: 'Leo', isSibling: false }),
          expect.objectContaining({ name: 'Mia', isSibling: true }),
        ],
      }),
    )
  })
})

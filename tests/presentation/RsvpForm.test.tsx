import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RsvpForm } from '@/presentation/components/features/guest/RsvpForm'
import { Party } from '@/domain/entities/Party'
import '@/presentation/i18n/config'

function snap() {
  const p = Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
    .addQuestion({
      kind: 'adultsCount',
      type: 'number',
      scope: 'family',
      label: 'Adults',
      options: [],
      required: true,
    })
    .addQuestion({
      kind: 'snack',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza', 'Hot dog'],
      required: true,
    })
  return p.toSnapshot()
}

describe('RsvpForm', () => {
  it('collects family + per-child answers and submits', async () => {
    const onSubmit = vi.fn()
    render(<RsvpForm snapshot={snap()} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText(/parents of/i), 'Parents of Leo')
    await userEvent.type(screen.getByLabelText(/adults/i), '2')
    await userEvent.type(screen.getByLabelText(/child name/i), 'Leo')
    await userEvent.selectOptions(screen.getByLabelText(/snack/i), 'Pizza')
    await userEvent.click(screen.getByRole('button', { name: /send rsvp/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        parentsLabel: 'Parents of Leo',
        children: [expect.objectContaining({ name: 'Leo' })],
      }),
    )
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeadcountView } from '@/presentation/components/features/host/HeadcountView'
import { Party } from '@/domain/entities/Party'
import '@/presentation/i18n/config'

function snapshot() {
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
      kind: 'custom',
      type: 'number',
      scope: 'family',
      label: 'Perros',
      options: [],
      required: false,
    })
    .addQuestion({
      kind: 'snack',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza'],
      required: false,
    })
  const [adults, dogs, snack] = p.toSnapshot().questions
  const r = p.buildRsvp({
    parentsLabel: 'Fam',
    familyAnswers: { [adults!.id]: 2, [dogs!.id]: 3 },
    children: [
      { name: 'Leo', answers: { [snack!.id]: 'Pizza' } },
      { name: 'Mia', answers: {}, isSibling: true },
    ],
  })
  return { ...p.toSnapshot(), rsvps: [r] }
}

afterEach(() => vi.restoreAllMocks())

describe('HeadcountView', () => {
  it('shows the totals, the extra totals and each child with their answers', () => {
    render(<HeadcountView snapshot={snapshot()} />)
    expect(screen.getByText('Children: 2 (1 invited · 1 siblings) · Adults: 2')).toBeInTheDocument()
    expect(screen.getByText('Perros: 3')).toBeInTheDocument()
    expect(screen.getByText(/Leo/)).toBeInTheDocument()
    expect(screen.getByText(/Pizza/)).toBeInTheDocument()
  })

  it('edits, adds, and deletes a family only once the host confirms', async () => {
    const snap = snapshot()
    const rsvpId = snap.rsvps[0]!.id
    const onEditRsvp = vi.fn()
    const onDeleteRsvp = vi.fn()
    const onAddGuest = vi.fn()
    render(
      <HeadcountView
        snapshot={snap}
        onEditRsvp={onEditRsvp}
        onDeleteRsvp={onDeleteRsvp}
        onAddGuest={onAddGuest}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEditRsvp).toHaveBeenCalledWith(rsvpId)
    await userEvent.click(screen.getByRole('button', { name: /add guest/i }))
    expect(onAddGuest).toHaveBeenCalled()

    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDeleteRsvp).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDeleteRsvp).toHaveBeenCalledWith(rsvpId)
    expect(confirm).toHaveBeenCalledTimes(2)
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeadcountView } from '@/presentation/components/features/host/HeadcountView'
import { Party } from '@/domain/entities/Party'
import '@/presentation/i18n/config'

function snap() {
  const p = Party.create({
    title: 'P',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  const r = p.buildRsvp({
    parentsLabel: 'Fam',
    familyAnswers: {},
    children: [{ name: 'Leo', answers: {} }],
  })
  return { ...p.toSnapshot(), rsvps: [r] }
}

describe('HeadcountView actions', () => {
  it('renders edit + delete per family and an add-guest action when handlers are provided', () => {
    render(
      <HeadcountView
        snapshot={snap()}
        onEditRsvp={vi.fn()}
        onDeleteRsvp={vi.fn()}
        onAddGuest={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add guest/i })).toBeInTheDocument()
  })
})

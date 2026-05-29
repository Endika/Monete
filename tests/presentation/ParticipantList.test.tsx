import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ParticipantList } from '@/presentation/components/features/guest/ParticipantList'
import { Party } from '@/domain/entities/Party'
import '@/presentation/i18n/config'

function snapTwo() {
  const p = Party.create({
    title: 'P',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  const r1 = p.buildRsvp({ parentsLabel: 'Fam A', familyAnswers: {}, children: [{ name: 'Leo', answers: {} }] })
  const r2 = p.buildRsvp({ parentsLabel: 'Fam B', familyAnswers: {}, children: [{ name: 'Mia', answers: {} }] })
  return { snapshot: { ...p.toSnapshot(), rsvps: [r1, r2] }, r1, r2 }
}

describe('ParticipantList claim-button visibility', () => {
  it('shows "this is us" on every family when none is claimed', () => {
    const { snapshot } = snapTwo()
    render(
      <ParticipantList snapshot={snapshot} onClaim={vi.fn()} onEdit={vi.fn()} onUnclaim={vi.fn()} />,
    )
    expect(screen.getAllByRole('button', { name: 'This is us' })).toHaveLength(2)
  })

  it('hides "this is us" on other families once one is claimed', () => {
    const { snapshot, r1 } = snapTwo()
    render(
      <ParticipantList
        snapshot={snapshot}
        yourRsvpId={r1.id}
        onClaim={vi.fn()}
        onEdit={vi.fn()}
        onUnclaim={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'This is us' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})

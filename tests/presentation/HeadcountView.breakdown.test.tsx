import { describe, it, expect } from 'vitest'
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
    parentsLabel: 'F',
    familyAnswers: {},
    children: [
      { name: 'Leo', answers: {} },
      { name: 'Mia', answers: {}, isSibling: true },
    ],
  })
  return { ...p.toSnapshot(), rsvps: [r] }
}

describe('HeadcountView breakdown', () => {
  it('shows invited and siblings counts', () => {
    render(<HeadcountView snapshot={snap()} />)
    expect(screen.getAllByText(/invited/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/sibling/i).length).toBeGreaterThan(0)
  })
})

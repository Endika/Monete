import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeadcountView } from '@/presentation/components/features/host/HeadcountView'
import { Party } from '@/domain/entities/Party'
import '@/presentation/i18n/config'

function snapshotWithRsvp() {
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
      options: ['Pizza'],
      required: true,
    })
  const [adults, snack] = p.toSnapshot().questions
  const r = p.buildRsvp({
    parentsLabel: 'Fam',
    familyAnswers: { [adults!.id]: 2 },
    children: [{ name: 'Leo', answers: { [snack!.id]: 'Pizza' } }],
  })
  return { ...p.toSnapshot(), rsvps: [r] }
}

describe('HeadcountView', () => {
  it('shows totals and the child rows', () => {
    render(<HeadcountView snapshot={snapshotWithRsvp()} />)
    expect(screen.getByText(/Leo/)).toBeInTheDocument()
    expect(screen.getByText(/Pizza/)).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeadcountView } from '@/presentation/components/features/host/HeadcountView'
import { Party } from '@/domain/entities/Party'
import '@/presentation/i18n/config'

function snapshotWithDogs() {
  const p = Party.create({
    title: 'P',
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
      required: false,
    })
    .addQuestion({
      kind: 'custom',
      type: 'number',
      scope: 'family',
      label: 'Perros',
      options: [],
      required: false,
    })
  const [adults, dogs] = p.toSnapshot().questions
  const r = p.buildRsvp({
    parentsLabel: 'Fam A',
    familyAnswers: { [adults!.id]: 2, [dogs!.id]: 2 },
    children: [{ name: 'Leo', answers: {} }],
  })
  return { ...p.toSnapshot(), rsvps: [r] }
}

describe('HeadcountView extraTotals', () => {
  it('renders extra numeric family question totals as chips', () => {
    render(<HeadcountView snapshot={snapshotWithDogs()} />)
    expect(screen.getByText(/Perros/)).toBeInTheDocument()
  })
})

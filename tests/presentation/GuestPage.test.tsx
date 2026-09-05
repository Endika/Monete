import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider } from '@/presentation/context/PartyContext'
import { GuestPage } from '@/presentation/components/features/guest/GuestPage'
import { buildContainer } from '@/shared/di/wiring'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import '@/presentation/i18n/config'

describe('GuestPage', () => {
  beforeEach(() => window.localStorage.clear())
  it('shows the participant list when RSVPs exist', async () => {
    const c = buildContainer({ inMemory: true })
    const { party } = await c.resolve<CreatePartyHandler>('createParty').execute({
      title: 'P',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
      allDay: false,
    })
    await c.resolve<SubmitRsvpHandler>('submitRsvp').execute({
      partyId: party.id,
      parentsLabel: 'Familia López',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: {} }],
    })
    render(
      <ContainerProvider container={c}>
        <PartyProvider partyId={party.id}>
          <GuestPage partyId={party.id} />
        </PartyProvider>
      </ContainerProvider>,
    )
    await waitFor(() => expect(screen.getByText(/Familia López/)).toBeInTheDocument())
    expect(screen.getByText(/Leo/)).toBeInTheDocument()
  })
})

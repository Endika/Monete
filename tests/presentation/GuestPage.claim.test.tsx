import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider } from '@/presentation/context/PartyContext'
import { GuestPage } from '@/presentation/components/features/guest/GuestPage'
import { buildContainer } from '@/shared/di/wiring'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import '@/presentation/i18n/config'

describe('GuestPage claim-family', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows this-is-us button, no badge initially; after claim shows badge and Edit', async () => {
    const c = buildContainer({ inMemory: true })
    const { party } = await c.resolve<CreatePartyHandler>('createParty').execute({
      title: 'Claim Party',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
      allDay: false,
    })
    await c.resolve<SubmitRsvpHandler>('submitRsvp').execute({
      partyId: party.id,
      parentsLabel: 'Familia García',
      familyAnswers: {},
      children: [{ name: 'Mia', answers: {} }],
    })

    render(
      <ContainerProvider container={c}>
        <PartyProvider partyId={party.id}>
          <GuestPage partyId={party.id} />
        </PartyProvider>
      </ContainerProvider>,
    )

    await waitFor(() => expect(screen.getByText(/Familia García/)).toBeInTheDocument())

    // Initially: "this is us" button visible, no "yours" badge
    expect(screen.getByRole('button', { name: /this is us/i })).toBeInTheDocument()
    expect(screen.queryByText(/yours/i)).not.toBeInTheDocument()

    // Click "this is us" → claim (no edit form opened)
    await userEvent.click(screen.getByRole('button', { name: /this is us/i }))

    // Badge appears, Edit button appears
    await waitFor(() => expect(screen.getByText(/yours/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()

    // "This is us" button is gone for this family
    expect(screen.queryByRole('button', { name: /this is us/i })).not.toBeInTheDocument()
  })

  it('un-claiming removes badge and restores this-is-us button', async () => {
    const c = buildContainer({ inMemory: true })
    const { party } = await c.resolve<CreatePartyHandler>('createParty').execute({
      title: 'Unclaim Party',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
      allDay: false,
    })
    await c.resolve<SubmitRsvpHandler>('submitRsvp').execute({
      partyId: party.id,
      parentsLabel: 'Familia Torres',
      familyAnswers: {},
      children: [{ name: 'Luna', answers: {} }],
    })

    render(
      <ContainerProvider container={c}>
        <PartyProvider partyId={party.id}>
          <GuestPage partyId={party.id} />
        </PartyProvider>
      </ContainerProvider>,
    )

    await waitFor(() => expect(screen.getByText(/Familia Torres/)).toBeInTheDocument())

    // Claim first
    await userEvent.click(screen.getByRole('button', { name: /this is us/i }))
    await waitFor(() => expect(screen.getByText(/yours/i)).toBeInTheDocument())

    // Un-claim
    await userEvent.click(screen.getByRole('button', { name: /this isn't us/i }))
    await waitFor(() => expect(screen.queryByText(/yours/i)).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /this is us/i })).toBeInTheDocument()
  })
})

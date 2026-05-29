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

describe('GuestPage which-family', () => {
  beforeEach(() => window.localStorage.clear())
  it('prompts which family, opens register from not-listed, back returns to list', async () => {
    const c = buildContainer({ inMemory: true })
    const { party } = await c.resolve<CreatePartyHandler>('createParty').execute({
      title: 'P',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    await c.resolve<SubmitRsvpHandler>('submitRsvp').execute({
      partyId: party.id,
      parentsLabel: 'Fam Lopez',
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
    await waitFor(() => expect(screen.getByText(/one of these families/i)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /not on the list/i }))
    expect(screen.getByLabelText(/family of/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.queryByLabelText(/family of/i)).not.toBeInTheDocument()
  })
})

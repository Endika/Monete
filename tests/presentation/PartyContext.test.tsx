import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider, useParty } from '@/presentation/context/PartyContext'
import { buildContainer } from '@/shared/di/wiring'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'

function Probe() {
  const { snapshot, status, hasPin, refresh } = useParty()
  if (status === 'loading') return <div>loading</div>
  return (
    <>
      <div>{snapshot ? snapshot.event.title : `locked:${hasPin}`}</div>
      <button type="button" onClick={() => void refresh()}>
        refresh
      </button>
    </>
  )
}

describe('PartyContext', () => {
  beforeEach(() => window.localStorage.clear())

  it('loads a party by id from the container repo', async () => {
    const container = buildContainer({ inMemory: true })
    const { party } = await container.resolve<CreatePartyHandler>('createParty').execute({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId={party.id}>
          <Probe />
        </PartyProvider>
      </ContainerProvider>,
    )
    await waitFor(() => expect(screen.getByText('Leo 5')).toBeInTheDocument())
  })

  it('exposes a locked read as hasPin true with no snapshot, then loads it once a stored pin matches', async () => {
    const container = buildContainer({ inMemory: true })
    const { party } = await container.resolve<CreatePartyHandler>('createParty').execute({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    await container
      .resolve<SetEditPinHandler>('setEditPin')
      .execute({ partyId: party.id, pin: '1234' })

    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId={party.id}>
          <Probe />
        </PartyProvider>
      </ContainerProvider>,
    )
    await waitFor(() => expect(screen.getByText('locked:true')).toBeInTheDocument())

    // Simulate the PIN being remembered on this device (e.g. verified via the PinGate),
    // then a refresh — PartyContext re-reads the stored PIN on every fetch.
    window.localStorage.setItem(`monete:pin:${party.id}`, '1234')
    await userEvent.click(screen.getByRole('button', { name: 'refresh' }))
    await waitFor(() => expect(screen.getByText('Leo 5')).toBeInTheDocument())
  })
})

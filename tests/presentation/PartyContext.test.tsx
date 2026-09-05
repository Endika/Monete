import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider, useParty } from '@/presentation/context/PartyContext'
import { buildContainer } from '@/shared/di/wiring'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'

function Probe() {
  const { snapshot, status } = useParty()
  if (status === 'loading') return <div>loading</div>
  return <div>{snapshot ? snapshot.event.title : 'none'}</div>
}

describe('PartyContext', () => {
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
})

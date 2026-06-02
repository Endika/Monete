import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider } from '@/presentation/context/PartyContext'
import { HostDashboard } from '@/presentation/components/features/host/HostDashboard'
import { buildContainer } from '@/shared/di/wiring'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'
import type { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import '@/presentation/i18n/config'

function memStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage
}

describe('HostDashboard editing details', () => {
  beforeEach(() => window.localStorage.clear())

  it('updates the hosted recents snapshot when the event title is edited', async () => {
    const container = buildContainer({ inMemory: true })
    const { party } = await container.resolve<CreatePartyHandler>('createParty').execute({
      title: 'Leo turns 5',
      address: 'Fun Park',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })

    const recents = new RecentsStore(memStorage())
    recents.addHosted({ id: party.id, title: 'Leo turns 5', startsAt: '2026-06-20T17:00:00.000Z' })

    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId={party.id}>
          <HostDashboard partyId={party.id} recents={recents} />
        </PartyProvider>
      </ContainerProvider>,
    )

    const titleInput = await screen.findByLabelText(/party title/i)
    expect(titleInput).toHaveValue('Leo turns 5')

    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Leo turns 6')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(recents.listHosted()[0]).toMatchObject({ id: party.id, title: 'Leo turns 6' })
    })
  })
})

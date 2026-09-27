import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider } from '@/presentation/context/PartyContext'
import { HostDashboard } from '@/presentation/components/features/host/HostDashboard'
import { buildContainer } from '@/shared/di/wiring'
import type { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import type { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { unlocked } from '../helpers/partyRead'
import '@/presentation/i18n/config'

describe('HostDashboard behind a party PIN', () => {
  beforeEach(() => window.localStorage.clear())

  it('lets the host unlock and add a guest, landing in the repo', async () => {
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
          <HostDashboard partyId={party.id} />
        </PartyProvider>
      </ContainerProvider>,
    )

    await userEvent.type(await screen.findByLabelText(/pin/i), '1234')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))

    await screen.findByLabelText(/party title/i)

    await userEvent.click(screen.getByRole('button', { name: /add guest/i }))
    const dialog = screen.getByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText(/family of/i), 'Familia Ruiz')
    await userEvent.click(within(dialog).getByRole('button', { name: /add guest/i }))

    const repo = container.resolve<IPartyRepository>('partyRepo')
    await waitFor(async () => {
      const row = await repo.findById(party.id, '1234')
      expect(unlocked(row).snapshot.rsvps).toHaveLength(1)
    })
    expect(unlocked(await repo.findById(party.id, '1234')).snapshot.rsvps[0]!.parentsLabel).toBe(
      'Familia Ruiz',
    )
  })
})

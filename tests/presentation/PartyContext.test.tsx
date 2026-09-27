import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider, useParty } from '@/presentation/context/PartyContext'
import { buildContainer } from '@/shared/di/wiring'
import { Container } from '@/shared/di/Container'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { RefreshPartyHandler } from '@/application/handlers/RefreshPartyHandler'
import { RateLimitedError, type IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'

function Probe() {
  const { snapshot, status, hasPin, rateLimited, refresh } = useParty()
  if (status === 'loading') return <div>loading</div>
  return (
    <>
      <div>{snapshot ? snapshot.event.title : `locked:${hasPin}`}</div>
      <div>{`status:${status} rateLimited:${rateLimited}`}</div>
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

  it('clears a stale stored PIN after one locked load, so the next load counts no fail', async () => {
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

    // A stale remembered PIN — e.g. the host rotated it since this device last unlocked.
    window.localStorage.setItem(`monete:pin:${party.id}`, '0000')

    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId={party.id}>
          <Probe />
        </PartyProvider>
      </ContainerProvider>,
    )
    await waitFor(() => expect(screen.getByText('locked:true')).toBeInTheDocument())

    // One load with the stale PIN: the key is gone and the gate is what's on screen.
    expect(window.localStorage.getItem(`monete:pin:${party.id}`)).toBeNull()

    // A second load now sends null (no stored PIN) — proving it added no fail: exactly 9
    // more wrong guesses (bringing the real total to 10, the one above plus these nine)
    // are still allowed before the 10th is throttled.
    await userEvent.click(screen.getByRole('button', { name: 'refresh' }))
    await waitFor(() => expect(screen.getByText('locked:true')).toBeInTheDocument())

    const repo = container.resolve<IPartyRepository>('partyRepo')
    for (let i = 0; i < 9; i++) await repo.findById(party.id, '0000')
    await expect(repo.findById(party.id, '0000')).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('blanks the recents entry on a locked read, keeping the entry, id and rsvpId', async () => {
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

    const recents = new RecentsStore()
    recents.addJoined({
      id: party.id,
      title: 'Leo 5',
      startsAt: '2026-06-20T17:00:00.000Z',
      rsvpId: 'r1',
    })

    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId={party.id} recents={recents}>
          <Probe />
        </PartyProvider>
      </ContainerProvider>,
    )
    await waitFor(() => expect(screen.getByText('locked:true')).toBeInTheDocument())

    expect(recents.getJoined(party.id)).toEqual({
      id: party.id,
      title: '',
      startsAt: '',
      rsvpId: 'r1',
      locked: true,
    })
  })

  it('restores the recents entry once unlocked, no longer flagged as locked', async () => {
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

    const recents = new RecentsStore()
    recents.addJoined({
      id: party.id,
      title: 'Leo 5',
      startsAt: '2026-06-20T17:00:00.000Z',
      rsvpId: 'r1',
    })

    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId={party.id} recents={recents}>
          <Probe />
        </PartyProvider>
      </ContainerProvider>,
    )
    await waitFor(() => expect(screen.getByText('locked:true')).toBeInTheDocument())
    expect(recents.getJoined(party.id)!.locked).toBe(true)

    // Unlock (e.g. via the PinGate storing the correct PIN) and refresh.
    window.localStorage.setItem(`monete:pin:${party.id}`, '1234')
    await userEvent.click(screen.getByRole('button', { name: 'refresh' }))
    await waitFor(() => expect(screen.getByText('Leo 5')).toBeInTheDocument())

    expect(recents.getJoined(party.id)).toEqual({
      id: party.id,
      title: 'Leo 5',
      startsAt: '2026-06-20T17:00:00.000Z',
      rsvpId: 'r1',
      locked: false,
    })
  })

  it('clears any stored PIN once a read comes back with hasPin:false', async () => {
    const container = buildContainer({ inMemory: true })
    const { party } = await container.resolve<CreatePartyHandler>('createParty').execute({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    // A leftover stored PIN even though the party currently has none (e.g. the host
    // removed it after this device had remembered it).
    window.localStorage.setItem(`monete:pin:${party.id}`, '1234')

    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId={party.id}>
          <Probe />
        </PartyProvider>
      </ContainerProvider>,
    )
    await waitFor(() => expect(screen.getByText('Leo 5')).toBeInTheDocument())
    expect(window.localStorage.getItem(`monete:pin:${party.id}`)).toBeNull()
  })

  it('shows the gate (status ready, not unavailable) and keeps the stored PIN on a PT429', async () => {
    const flaky = {
      findById: async (_id: string, _pin?: string | null) => {
        throw new RateLimitedError()
      },
    } as unknown as IPartyRepository
    const container = new Container()
    container.register('refreshParty', () => new RefreshPartyHandler(flaky))

    window.localStorage.setItem('monete:pin:abc1234', '1234')

    render(
      <ContainerProvider container={container}>
        <PartyProvider partyId="abc1234">
          <Probe />
        </PartyProvider>
      </ContainerProvider>,
    )

    await waitFor(() =>
      expect(screen.getByText('status:ready rateLimited:true')).toBeInTheDocument(),
    )
    expect(screen.getByText('locked:true')).toBeInTheDocument()
    // It may well be right, just throttled: keep it rather than forcing a re-entry.
    expect(window.localStorage.getItem('monete:pin:abc1234')).toBe('1234')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider } from '@/presentation/context/PartyContext'
import { PartyGate } from '@/presentation/components/common/PartyGate'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'
import { buildContainer } from '@/shared/di/wiring'
import { Container } from '@/shared/di/Container'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { DeletePartyHandler } from '@/application/handlers/DeletePartyHandler'
import { RefreshPartyHandler } from '@/application/handlers/RefreshPartyHandler'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
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

function seedRecents(store: RecentsStore, ...ids: string[]) {
  for (const id of ids)
    store.addJoined({ id, title: id, startsAt: '2026-06-20T17:00:00.000Z', rsvpId: `r-${id}` })
}

async function createParty(c: Container) {
  const { party } = await c.resolve<CreatePartyHandler>('createParty').execute({
    title: 'Leo cumple 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
    allDay: false,
  })
  return party
}

function renderGate(c: Container, partyId: string, store: RecentsStore, onHome = vi.fn()) {
  render(
    <ContainerProvider container={c}>
      <PartyProvider partyId={partyId} recents={store}>
        <PartyGate onHome={onHome}>
          <div>party contents</div>
        </PartyGate>
      </PartyProvider>
    </ContainerProvider>,
  )
  return onHome
}

describe('PartyGate', () => {
  beforeEach(() => window.localStorage.clear())

  it('renders the party when it loads', async () => {
    const c = buildContainer({ inMemory: true })
    const party = await createParty(c)
    renderGate(c, party.id, new RecentsStore(memStorage()))
    await waitFor(() => expect(screen.getByText('party contents')).toBeInTheDocument())
  })

  it('offers to forget a deleted party but changes nothing until confirmed', async () => {
    const c = buildContainer({ inMemory: true })
    const party = await createParty(c)
    const store = new RecentsStore(memStorage())
    seedRecents(store, party.id, 'other')
    await c.resolve<DeletePartyHandler>('deleteParty').execute(party.id, null)

    renderGate(c, party.id, store)

    expect(await screen.findByText('This party no longer exists')).toBeInTheDocument()
    expect(store.getJoined(party.id)).toBeDefined()
  })

  it('forgets only the open party once the user confirms', async () => {
    const c = buildContainer({ inMemory: true })
    const party = await createParty(c)
    const store = new RecentsStore(memStorage())
    seedRecents(store, party.id, 'other')
    await c.resolve<DeletePartyHandler>('deleteParty').execute(party.id, null)

    const onHome = renderGate(c, party.id, store)
    await screen.findByText('This party no longer exists')

    await userEvent.click(screen.getByRole('button', { name: 'Remove from my list' }))
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove from my list' }),
    )

    expect(store.getJoined(party.id)).toBeUndefined()
    expect(store.getJoined('other')).toBeDefined()
    expect(onHome).toHaveBeenCalled()
  })

  it('keeps the entry when the user cancels the confirmation', async () => {
    const c = buildContainer({ inMemory: true })
    const party = await createParty(c)
    const store = new RecentsStore(memStorage())
    seedRecents(store, party.id)
    await c.resolve<DeletePartyHandler>('deleteParty').execute(party.id, null)

    renderGate(c, party.id, store)
    await screen.findByText('This party no longer exists')

    await userEvent.click(screen.getByRole('button', { name: 'Remove from my list' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(store.getJoined(party.id)).toBeDefined()
  })

  it('treats a transport failure as unavailable and never touches the recents', async () => {
    const c = buildContainer({ inMemory: true })
    const party = await createParty(c)
    const store = new RecentsStore(memStorage())
    seedRecents(store, party.id)

    const repo = c.resolve<IPartyRepository>('partyRepo')
    let failing = true
    // What a paused project or a dead network looks like from the client: a throw, not a null.
    const flaky = {
      findById: async (id: string) => {
        if (failing) throw new TypeError('Failed to fetch')
        return repo.findById(id)
      },
    } as IPartyRepository
    const offline = new Container()
    offline.register('refreshParty', () => new RefreshPartyHandler(flaky))

    renderGate(offline, party.id, store)

    expect(await screen.findByText("We couldn't load the party")).toBeInTheDocument()
    expect(store.getJoined(party.id)).toBeDefined()
    expect(screen.queryByText('This party no longer exists')).not.toBeInTheDocument()

    failing = false
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(screen.getByText('party contents')).toBeInTheDocument())
  })
})

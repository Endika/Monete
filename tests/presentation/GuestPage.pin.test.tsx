import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider } from '@/presentation/context/PartyContext'
import { GuestPage } from '@/presentation/components/features/guest/GuestPage'
import { Container } from '@/shared/di/Container'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import { UpdateRsvpHandler } from '@/application/handlers/UpdateRsvpHandler'
import { RemoveRsvpHandler } from '@/application/handlers/RemoveRsvpHandler'
import { RefreshPartyHandler } from '@/application/handlers/RefreshPartyHandler'
import { VerifyPinHandler } from '@/application/handlers/VerifyPinHandler'
import { unlocked } from '../helpers/partyRead'
import '@/presentation/i18n/config'

// A fresh container wired to a *shared* repo instance, so two containers can stand in for
// two page loads (a reload) of the same backing data — buildContainer() always gets a new,
// empty in-memory repo, which would not reproduce "remembered across a reload".
function containerFor(repo: IPartyRepository): Container {
  const c = new Container()
  c.register('partyRepo', () => repo)
  c.register('createParty', () => new CreatePartyHandler(repo))
  c.register('setEditPin', () => new SetEditPinHandler(repo))
  c.register('submitRsvp', () => new SubmitRsvpHandler(repo))
  c.register('updateRsvp', () => new UpdateRsvpHandler(repo))
  c.register('removeRsvp', () => new RemoveRsvpHandler(repo))
  c.register('refreshParty', () => new RefreshPartyHandler(repo))
  c.register('verifyPin', () => new VerifyPinHandler(repo))
  return c
}

async function partyWithPinAndRsvp(repo: InMemoryPartyRepository) {
  const { party } = await new CreatePartyHandler(repo).execute({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  await new SetEditPinHandler(repo).execute({ partyId: party.id, pin: '1234' })
  await new SubmitRsvpHandler(repo).execute({
    partyId: party.id,
    parentsLabel: 'Familia López',
    familyAnswers: {},
    children: [{ name: 'Leo', answers: {} }],
    pin: '1234',
  })
  return party.id
}

function renderGuest(container: Container, partyId: string) {
  return render(
    <ContainerProvider container={container}>
      <PartyProvider partyId={partyId}>
        <GuestPage partyId={partyId} />
      </PartyProvider>
    </ContainerProvider>,
  )
}

describe('GuestPage behind a party PIN', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows only the gate when the party is PIN-protected and no PIN is remembered', async () => {
    const repo = new InMemoryPartyRepository()
    const partyId = await partyWithPinAndRsvp(repo)
    renderGuest(containerFor(repo), partyId)

    await screen.findByLabelText(/pin/i)
    expect(screen.queryByText(/Familia López/)).not.toBeInTheDocument()
  })

  it('keeps the gate up on a wrong PIN, then reveals the party and lets the family claim and edit-submit on the right one', async () => {
    const repo = new InMemoryPartyRepository()
    const partyId = await partyWithPinAndRsvp(repo)
    renderGuest(containerFor(repo), partyId)

    await userEvent.type(await screen.findByLabelText(/pin/i), '0000')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))
    await screen.findByText(/wrong pin/i)
    expect(screen.queryByText(/Familia López/)).not.toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText(/pin/i))
    await userEvent.type(screen.getByLabelText(/pin/i), '1234')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))

    await waitFor(() => expect(screen.getByText(/Familia López/)).toBeInTheDocument())

    // Claim the family, then edit-submit it — both privileged by the now-unlocked PIN.
    await userEvent.click(screen.getByRole('button', { name: /this is us/i }))
    await waitFor(() => expect(screen.getByText(/yours/i)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    const nameInput = screen.getByLabelText(/family of/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Familia López Actualizada')
    await userEvent.click(screen.getByRole('button', { name: /edit response/i }))

    await waitFor(async () => {
      const row = unlocked(await repo.findById(partyId, '1234'))
      expect(row.snapshot.rsvps[0]!.parentsLabel).toBe('Familia López Actualizada')
    })
    expect(unlocked(await repo.findById(partyId, '1234')).snapshot.rsvps).toHaveLength(1)
  })

  it('lets an unlocked family submit a brand-new RSVP, landing in the repo', async () => {
    const repo = new InMemoryPartyRepository()
    const partyId = await partyWithPinAndRsvp(repo)
    renderGuest(containerFor(repo), partyId)

    await userEvent.type(await screen.findByLabelText(/pin/i), '1234')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))
    await waitFor(() => expect(screen.getByText(/Familia López/)).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /not on the list/i }))
    await userEvent.type(screen.getByLabelText(/family of/i), 'Familia García')
    await userEvent.click(screen.getByRole('button', { name: /send rsvp/i }))

    await waitFor(async () => {
      const row = unlocked(await repo.findById(partyId, '1234'))
      expect(row.snapshot.rsvps).toHaveLength(2)
    })
    const row = unlocked(await repo.findById(partyId, '1234'))
    expect(row.snapshot.rsvps.some((r) => r.parentsLabel === 'Familia García')).toBe(true)
  })

  it('remembers the PIN for this party across a new container (a reload)', async () => {
    const repo = new InMemoryPartyRepository()
    const partyId = await partyWithPinAndRsvp(repo)

    const first = renderGuest(containerFor(repo), partyId)
    await userEvent.type(await screen.findByLabelText(/pin/i), '1234')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))
    await waitFor(() => expect(screen.getByText(/Familia López/)).toBeInTheDocument())
    first.unmount()

    // A brand-new container (and a fresh InMemoryPartyRepository would look empty), but the
    // same underlying party data plus the PIN remembered on this device (localStorage).
    renderGuest(containerFor(repo), partyId)
    await waitFor(() => expect(screen.getByText(/Familia López/)).toBeInTheDocument())
    expect(screen.queryByLabelText(/pin/i)).not.toBeInTheDocument()
  })

  it('leaves a PIN-less party unaffected — no gate at all', async () => {
    const repo = new InMemoryPartyRepository()
    const { party } = await new CreatePartyHandler(repo).execute({
      title: 'Leo 5',
      address: 'A',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
    })
    await new SubmitRsvpHandler(repo).execute({
      partyId: party.id,
      parentsLabel: 'Familia López',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: {} }],
    })
    renderGuest(containerFor(repo), party.id)
    await waitFor(() => expect(screen.getByText(/Familia López/)).toBeInTheDocument())
    expect(screen.queryByLabelText(/pin/i)).not.toBeInTheDocument()
  })
})

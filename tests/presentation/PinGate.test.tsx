import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PinGate } from '@/presentation/components/features/security/PinGate'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { EditPinProvider } from '@/presentation/context/EditPinContext'
import { buildContainer } from '@/shared/di/wiring'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import type { Container } from '@/shared/di/Container'
import '@/presentation/i18n/config'

async function setup(withPin: boolean): Promise<{ container: Container; id: string }> {
  const container = buildContainer({ inMemory: true })
  const created = await container.resolve<CreatePartyHandler>('createParty').execute({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  if (withPin) {
    await container
      .resolve<SetEditPinHandler>('setEditPin')
      .execute({ partyId: created.party.id, pin: '1234' })
  }
  return { container, id: created.party.id }
}

function renderGate(container: Container, id: string, hasPin: boolean) {
  return render(
    <ContainerProvider container={container}>
      <EditPinProvider>
        <PinGate partyId={id} hasPin={hasPin}>
          <div>secret</div>
        </PinGate>
      </EditPinProvider>
    </ContainerProvider>,
  )
}

describe('PinGate', () => {
  it('reveals children only after the correct pin is verified server-side', async () => {
    const { container, id } = await setup(true)
    renderGate(container, id, true)
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/pin/i), '1234')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))
    expect(await screen.findByText('secret')).toBeInTheDocument()
  })

  it('keeps children hidden on a wrong pin', async () => {
    const { container, id } = await setup(true)
    renderGate(container, id, true)
    await userEvent.type(screen.getByLabelText(/pin/i), '9999')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children immediately when no pin is set', async () => {
    const { container, id } = await setup(false)
    renderGate(container, id, false)
    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})

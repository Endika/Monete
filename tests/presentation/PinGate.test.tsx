import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PinGate } from '@/presentation/components/features/security/PinGate'
import { EditPin } from '@/domain/value-objects/EditPin'
import '@/presentation/i18n/config'

describe('PinGate', () => {
  it('renders children only after the correct pin', async () => {
    const hash = await EditPin.hash('1234', 'abc1234')
    render(
      <PinGate partyId="abc1234" pinHash={hash}>
        <div>secret</div>
      </PinGate>,
    )
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/pin/i), '1234')
    await userEvent.click(screen.getByRole('button', { name: /unlock|ok|enter/i }))
    expect(await screen.findByText('secret')).toBeInTheDocument()
  })

  it('renders children immediately when no pin is set', () => {
    render(
      <PinGate partyId="abc1234" pinHash={null}>
        <div>secret</div>
      </PinGate>,
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})

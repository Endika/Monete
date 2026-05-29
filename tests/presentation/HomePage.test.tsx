import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { HomePage } from '@/presentation/components/features/home/HomePage'
import { buildContainer } from '@/shared/di/wiring'
import '@/presentation/i18n/config'

describe('HomePage', () => {
  it('creates a party and calls onCreated with the new id', async () => {
    const container = buildContainer({ inMemory: true })
    const onCreated = vi.fn()
    render(
      <ContainerProvider container={container}>
        <HomePage onCreated={onCreated} />
      </ContainerProvider>,
    )
    await userEvent.type(screen.getByLabelText(/party title/i), 'Leo turns 5')
    await userEvent.type(screen.getByLabelText(/date & time/i), '2026-06-20T17:00')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onCreated).toHaveBeenCalledWith(expect.stringMatching(/^[a-z0-9]{7}$/))
  })
})

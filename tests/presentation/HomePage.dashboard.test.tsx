import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomePage } from '@/presentation/components/features/home/HomePage'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { buildContainer } from '@/shared/di/wiring'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'
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

describe('HomePage dashboard', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows the organizing section when there are hosted recents', () => {
    const store = new RecentsStore(memStorage())
    store.addHosted({ id: 'abc1234', title: 'Leo turns 5', startsAt: '2026-06-20T17:00:00.000Z' })
    render(
      <ContainerProvider container={buildContainer({ inMemory: true })}>
        <HomePage onCreated={vi.fn()} onOpenParty={vi.fn()} recents={store} />
      </ContainerProvider>,
    )
    expect(screen.getByText('Leo turns 5')).toBeInTheDocument()
  })
})

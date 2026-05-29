import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppHeader } from '@/presentation/components/common/AppHeader'
import '@/presentation/i18n/config'

describe('AppHeader', () => {
  it('calls onHome when the logo is clicked', async () => {
    const onHome = vi.fn()
    render(<AppHeader onHome={onHome} />)
    await userEvent.click(screen.getByRole('button', { name: /monete/i }))
    expect(onHome).toHaveBeenCalled()
  })
})

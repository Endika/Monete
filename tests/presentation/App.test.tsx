import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import '@/presentation/i18n/config'

describe('App routing', () => {
  beforeEach(() => window.history.pushState({}, '', '/'))

  it('shows the home create form with no party param', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })
})

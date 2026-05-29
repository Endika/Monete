import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageSwitcher } from '@/presentation/components/common/LanguageSwitcher'
import '@/presentation/i18n/config'

describe('LanguageSwitcher', () => {
  it('renders all six languages with their native names', () => {
    render(<LanguageSwitcher />)
    for (const name of ['Español', 'English', 'Galego', 'Euskara', 'Català', 'Valencià']) {
      expect(screen.getByText(new RegExp(name, 'i'))).toBeInTheDocument()
    }
  })
})

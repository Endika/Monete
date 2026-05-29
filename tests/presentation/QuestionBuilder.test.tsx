import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionBuilder } from '@/presentation/components/features/host/QuestionBuilder'
import '@/presentation/i18n/config'

describe('QuestionBuilder', () => {
  it('emits a custom select question with edited options', async () => {
    const onUpsert = vi.fn()
    render(<QuestionBuilder onUpsert={onUpsert} onRemove={vi.fn()} questions={[]} />)
    await userEvent.click(screen.getByRole('button', { name: /add question/i }))
    await userEvent.type(screen.getByLabelText(/label/i), 'What to drink?')
    await userEvent.selectOptions(screen.getByLabelText(/type/i), 'select')
    await userEvent.type(screen.getByLabelText(/options/i), 'Water, Juice')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'select',
        label: 'What to drink?',
        options: ['Water', 'Juice'],
      }),
    )
  })
})

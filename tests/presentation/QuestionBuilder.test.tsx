import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
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

  it('adds a preset once however often it is tapped while saving, and lets a failed add go', async () => {
    let fail!: (e: Error) => void
    const onUpsert = vi.fn(() => new Promise<void>((_, reject) => (fail = reject)))
    render(<QuestionBuilder onUpsert={onUpsert} onRemove={vi.fn()} questions={[]} />)
    const chip = screen.getByRole('button', { name: /allergies/i })
    await userEvent.click(chip)
    await userEvent.click(chip)
    expect(onUpsert).toHaveBeenCalledTimes(1)
    expect(chip).toBeDisabled()

    await act(async () => fail(new Error('offline')))
    expect(chip).toBeEnabled()
  })
})

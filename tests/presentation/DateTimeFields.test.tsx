import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTimeFields } from '@/presentation/components/features/event/DateTimeFields'
import '@/presentation/i18n/config'

describe('DateTimeFields', () => {
  it('emits the start date when the date is set', async () => {
    const onChange = vi.fn()
    render(
      <DateTimeFields
        value={{ startDate: '', startTime: '', endDate: '', endTime: '' }}
        onChange={onChange}
      />,
    )
    await userEvent.type(screen.getByLabelText(/date/i), '2026-06-20')
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ startDate: '2026-06-20' }))
  })
})

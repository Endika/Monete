import { describe, it, expect } from 'vitest'
import { isEditPin } from '@/application/dtos/SetEditPinDTO'

describe('isEditPin', () => {
  it('accepts 4 to 6 digits and nothing else', () => {
    expect(['1234', '123456'].map(isEditPin)).toEqual([true, true])
    expect(['', '123', '1234567', '12a4', ' 1234'].map(isEditPin)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ])
  })
})

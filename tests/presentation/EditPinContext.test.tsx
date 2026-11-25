import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EditPinProvider, useEditPin } from '@/presentation/context/EditPinContext'

function Probe() {
  const { pin, setPin } = useEditPin()
  return (
    <>
      <output>{pin ?? 'none'}</output>
      <button onClick={() => setPin('2222')}>set</button>
    </>
  )
}

describe('EditPinProvider', () => {
  beforeEach(() => window.localStorage.clear())

  it('holds the PIN of the party it is given, even when that party changes', () => {
    window.localStorage.setItem('monete:pin:a', '1111')
    const { rerender } = render(
      <EditPinProvider partyId="a">
        <Probe />
      </EditPinProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('1111')

    rerender(
      <EditPinProvider partyId="b">
        <Probe />
      </EditPinProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('none')

    fireEvent.click(screen.getByRole('button'))
    expect(window.localStorage.getItem('monete:pin:b')).toBe('2222')
    expect(window.localStorage.getItem('monete:pin:a')).toBe('1111')
    expect(screen.getByRole('status')).toHaveTextContent('2222')
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressAutocomplete } from '@/presentation/components/features/event/AddressAutocomplete'
import * as photon from '@/infrastructure/geo/photonSearch'
import '@/presentation/i18n/config'

describe('AddressAutocomplete', () => {
  it('shows suggestions and emits the picked address + coords', async () => {
    vi.spyOn(photon, 'searchAddresses').mockResolvedValue([
      { label: 'Plaza Mayor, Madrid', lat: 40.4, lng: -3.7 },
    ])
    const onChange = vi.fn()
    render(<AddressAutocomplete value="" lat={null} lng={null} onChange={onChange} />)
    await userEvent.type(screen.getByLabelText(/address/i), 'plaza')
    const opt = await screen.findByText(/Plaza Mayor, Madrid/)
    await userEvent.click(opt)
    expect(onChange).toHaveBeenCalledWith({ address: 'Plaza Mayor, Madrid', lat: 40.4, lng: -3.7 })
  })
})

import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressAutocomplete } from '@/presentation/components/features/event/AddressAutocomplete'
import * as gp from '@/infrastructure/geo/googlePlaces'
import '@/presentation/i18n/config'

afterEach(() => vi.unstubAllEnvs())

describe('AddressAutocomplete (Google path)', () => {
  it('uses googleAutocomplete when key is set and emits coords from details on pick', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'k')

    vi.spyOn(gp, 'googleAutocomplete').mockResolvedValue([
      { placeId: 'p1', label: 'Plaza Mayor, Madrid' },
    ])
    vi.spyOn(gp, 'googlePlaceDetails').mockResolvedValue({
      label: 'Plaza Mayor, Madrid',
      lat: 40.4,
      lng: -3.7,
    })

    const onChange = vi.fn()
    render(<AddressAutocomplete value="" lat={null} lng={null} onChange={onChange} />)

    await userEvent.type(screen.getByLabelText(/address/i), 'plaza')

    const opt = await screen.findByText(/Plaza Mayor, Madrid/)
    await userEvent.click(opt)

    expect(onChange).toHaveBeenLastCalledWith({
      address: 'Plaza Mayor, Madrid',
      lat: 40.4,
      lng: -3.7,
    })
  })
})

import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddressAutocomplete } from '@/presentation/components/features/event/AddressAutocomplete'
import * as gp from '@/infrastructure/geo/googlePlaces'
import * as photon from '@/infrastructure/geo/photonSearch'
import { GeoLookupError } from '@/infrastructure/geo/GeoLookupError'
import '@/presentation/i18n/config'

afterEach(() => vi.unstubAllEnvs())

describe('AddressAutocomplete error handling', () => {
  it('falls back to Photon when Google fails outright', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'k')
    vi.spyOn(gp, 'googleAutocomplete').mockRejectedValue(new GeoLookupError('boom'))
    vi.spyOn(photon, 'searchAddresses').mockResolvedValue([
      { label: 'Plaza Mayor, Madrid', lat: 40.4, lng: -3.7 },
    ])

    render(<AddressAutocomplete value="" lat={null} lng={null} onChange={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/address/i), 'plaza')

    expect(await screen.findByText(/Plaza Mayor, Madrid/)).toBeInTheDocument()
  })

  it('shows the app error when Google fails and the Photon fallback also fails', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'k')
    vi.spyOn(gp, 'googleAutocomplete').mockRejectedValue(new GeoLookupError('boom'))
    vi.spyOn(photon, 'searchAddresses').mockRejectedValue(new GeoLookupError('photon down too'))

    render(<AddressAutocomplete value="" lat={null} lng={null} onChange={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/address/i), 'plaza')

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't search for addresses/i)
  })

  it('shows the app error when there is no Google key and Photon fails', async () => {
    vi.spyOn(photon, 'searchAddresses').mockRejectedValue(new GeoLookupError('photon down'))

    render(<AddressAutocomplete value="" lat={null} lng={null} onChange={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/address/i), 'plaza')

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't search for addresses/i)
  })

  it('shows the app error, and does not save a coordinate-less place, when place details fails', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'k')
    vi.spyOn(gp, 'googleAutocomplete').mockResolvedValue([
      { placeId: 'p1', label: 'Plaza Mayor, Madrid' },
    ])
    vi.spyOn(gp, 'googlePlaceDetails').mockRejectedValue(new GeoLookupError('missing fields'))

    const onChange = vi.fn()
    render(<AddressAutocomplete value="" lat={null} lng={null} onChange={onChange} />)
    await userEvent.type(screen.getByLabelText(/address/i), 'plaza')
    const opt = await screen.findByText(/Plaza Mayor, Madrid/)
    onChange.mockClear()
    await userEvent.click(opt)

    expect(await screen.findByRole('alert')).toHaveTextContent(/map location/i)
    expect(onChange).not.toHaveBeenCalled()
  })
})

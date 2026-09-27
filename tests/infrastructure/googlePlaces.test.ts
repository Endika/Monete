import { describe, it, expect, vi, afterEach } from 'vitest'
import { googleAutocomplete, googlePlaceDetails } from '@/infrastructure/geo/googlePlaces'
import { GeoLookupError } from '@/infrastructure/geo/GeoLookupError'

afterEach(() => vi.unstubAllGlobals())

describe('googlePlaces', () => {
  it('maps autocomplete suggestions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          suggestions: [
            {
              placePrediction: {
                placeId: 'p1',
                text: { text: 'Plaza Mayor, Madrid' },
              },
            },
          ],
        }),
      }),
    )
    const out = await googleAutocomplete('plaza', 'k')
    expect(out).toEqual([{ placeId: 'p1', label: 'Plaza Mayor, Madrid' }])
  })

  it('returns [] for short query, without calling the network', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await googleAutocomplete('ab', 'k')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns [] for a genuine empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
    expect(await googleAutocomplete('plaza', 'k')).toEqual([])
  })

  it('throws on an HTTP failure instead of hiding it as no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    await expect(googleAutocomplete('plaza', 'k')).rejects.toBeInstanceOf(GeoLookupError)
  })

  it('throws on a network failure instead of hiding it as no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))
    await expect(googleAutocomplete('plaza', 'k')).rejects.toBeInstanceOf(GeoLookupError)
  })

  it('maps place details to label+coords', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          location: { latitude: 40.4, longitude: -3.7 },
          formattedAddress: 'Plaza Mayor',
          displayName: { text: 'Plaza Mayor de Madrid' },
        }),
      }),
    )
    expect(await googlePlaceDetails('p1', 'k')).toEqual({
      label: 'Plaza Mayor',
      name: 'Plaza Mayor de Madrid',
      lat: 40.4,
      lng: -3.7,
    })
  })

  it('throws on a details HTTP failure instead of returning null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(googlePlaceDetails('p1', 'k')).rejects.toBeInstanceOf(GeoLookupError)
  })

  it('throws when the response is missing coordinates instead of returning null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ formattedAddress: 'Plaza Mayor' }),
      }),
    )
    await expect(googlePlaceDetails('p1', 'k')).rejects.toBeInstanceOf(GeoLookupError)
  })

  it('throws on a details network failure instead of returning null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))
    await expect(googlePlaceDetails('p1', 'k')).rejects.toBeInstanceOf(GeoLookupError)
  })
})

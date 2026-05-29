import { describe, it, expect, vi, afterEach } from 'vitest'
import { googleAutocomplete, googlePlaceDetails } from '@/infrastructure/geo/googlePlaces'

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

  it('returns [] for short query', async () => {
    expect(await googleAutocomplete('ab', 'k')).toEqual([])
  })

  it('maps place details to label+coords', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          location: { latitude: 40.4, longitude: -3.7 },
          formattedAddress: 'Plaza Mayor',
        }),
      }),
    )
    expect(await googlePlaceDetails('p1', 'k')).toEqual({
      label: 'Plaza Mayor',
      lat: 40.4,
      lng: -3.7,
    })
  })

  it('returns null on details error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await googlePlaceDetails('p1', 'k')).toBeNull()
  })
})

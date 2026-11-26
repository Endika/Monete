import { describe, it, expect, vi, afterEach } from 'vitest'
import { googleAutocomplete, googlePlaceDetails } from '@/infrastructure/geo/googlePlaces'
import { GeoLookupError } from '@/infrastructure/geo/GeoLookupError'

afterEach(() => vi.unstubAllGlobals())

const answering = (body: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => body })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('googleAutocomplete', () => {
  it('posts the query and keeps only complete suggestions', async () => {
    const fetchMock = answering({
      suggestions: [
        {},
        { placePrediction: { placeId: 'p2' } },
        { placePrediction: { text: { text: 'No id' } } },
        { placePrediction: { placeId: 'p1', text: { text: 'Plaza Mayor, Madrid' } } },
      ],
    })
    expect(await googleAutocomplete('abc', 'k')).toEqual([
      { placeId: 'p1', label: 'Plaza Mayor, Madrid' },
    ])
    expect(fetchMock).toHaveBeenCalledWith('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': 'k' },
      body: JSON.stringify({ input: 'abc' }),
    })
  })

  it('returns [] for a query under 3 characters once trimmed, without calling the network', async () => {
    const fetchMock = answering({})
    expect(await googleAutocomplete('  ab  ', 'k')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns [] for a genuine empty result', async () => {
    answering({})
    expect(await googleAutocomplete('plaza', 'k')).toEqual([])
  })

  it('throws on an HTTP failure instead of hiding it as no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    await expect(googleAutocomplete('plaza', 'k')).rejects.toThrow(
      'Google Places autocomplete failed: 429',
    )
  })

  it('throws on a network failure, keeping the cause', async () => {
    const cause = new TypeError('network down')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause))
    await expect(googleAutocomplete('plaza', 'k')).rejects.toMatchObject({
      name: GeoLookupError.name,
      cause,
    })
  })
})

describe('googlePlaceDetails', () => {
  it('maps place details to label+coords, a zero coordinate included', async () => {
    const fetchMock = answering({
      location: { latitude: 51.48, longitude: 0 },
      formattedAddress: 'Blackheath Ave',
      displayName: { text: 'Royal Observatory' },
    })
    expect(await googlePlaceDetails('p1', 'k')).toEqual({
      label: 'Blackheath Ave',
      name: 'Royal Observatory',
      lat: 51.48,
      lng: 0,
    })
    expect(fetchMock).toHaveBeenCalledWith('https://places.googleapis.com/v1/places/p1', {
      headers: {
        'X-Goog-Api-Key': 'k',
        'X-Goog-FieldMask': 'location,formattedAddress,displayName',
      },
    })
  })

  it('leaves the name empty when the place has none', async () => {
    answering({ location: { latitude: 40.4, longitude: -3.7 }, formattedAddress: 'Plaza Mayor' })
    expect((await googlePlaceDetails('p1', 'k')).name).toBe('')
  })

  it('throws on a details HTTP failure instead of returning null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(googlePlaceDetails('p1', 'k')).rejects.toThrow('Google place details failed: 500')
  })

  it.each([
    ['latitude', { location: { longitude: -3.7 }, formattedAddress: 'Plaza Mayor' }],
    ['longitude', { location: { latitude: 40.4 }, formattedAddress: 'Plaza Mayor' }],
  ])('throws when the response has no %s instead of returning null', async (_, body) => {
    answering(body)
    await expect(googlePlaceDetails('p1', 'k')).rejects.toThrow('missing location fields')
  })

  it('throws on a details network failure, keeping the cause', async () => {
    const cause = new TypeError('network down')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause))
    await expect(googlePlaceDetails('p1', 'k')).rejects.toMatchObject({
      name: GeoLookupError.name,
      cause,
    })
  })
})

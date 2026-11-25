import { describe, it, expect, vi } from 'vitest'
import { searchAddresses } from '@/infrastructure/geo/photonSearch'
import { GeoLookupError } from '@/infrastructure/geo/GeoLookupError'

const photonResponse = {
  features: [
    {
      geometry: { coordinates: [-3.7038, 40.4168] },
      properties: { name: 'Plaza Mayor', city: 'Madrid', country: 'España' },
    },
  ],
}

describe('searchAddresses', () => {
  it('maps photon features to {label, lat, lng}', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => photonResponse })
    vi.stubGlobal('fetch', fetchMock)
    const out = await searchAddresses('plaza mayor', 'es')
    expect(out[0]!.lat).toBe(40.4168)
    expect(out[0]!.lng).toBe(-3.7038)
    expect(out[0]!.label).toMatch(/Plaza Mayor/)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('photon.komoot.io/api/?q=plaza%20mayor'),
    )
    vi.unstubAllGlobals()
  })

  it('builds the label from street, number, postcode, city, state and country', async () => {
    const feature = {
      geometry: { coordinates: [1, 2] },
      properties: {
        street: 'Calle Mayor',
        housenumber: '5',
        postcode: '28013',
        city: 'Madrid',
        state: 'Madrid',
        country: 'España',
      },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [feature] }) }),
    )
    expect((await searchAddresses('calle mayor', 'es'))[0]!.label).toBe(
      'Calle Mayor 5, 28013, Madrid, Madrid, España',
    )
    vi.unstubAllGlobals()
  })

  it.each([
    ['en', 'en'],
    ['de', 'de'],
    ['fr', 'fr'],
    ['it', 'it'],
    ['es', 'en'],
  ])('sends lang %s to photon as %s, with the query trimmed', async (lang, sent) => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)
    await searchAddresses('  abc  ', lang)
    expect(fetchMock).toHaveBeenCalledWith(
      `https://photon.komoot.io/api/?q=abc&lang=${sent}&limit=5`,
    )
    vi.unstubAllGlobals()
  })

  it('returns [] on a short query, without calling the network', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await searchAddresses('', 'es')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('returns [] for a genuine empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
    expect(await searchAddresses('xyz', 'es')).toEqual([])
    vi.unstubAllGlobals()
  })

  it('throws on an HTTP failure instead of hiding it as no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    const failure = searchAddresses('xyz', 'es')
    await expect(failure).rejects.toBeInstanceOf(GeoLookupError)
    await expect(failure).rejects.toThrow('Photon search failed: 503')
    vi.unstubAllGlobals()
  })

  it('throws on a network failure instead of hiding it as no results', async () => {
    const cause = new TypeError('offline')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause))
    await expect(searchAddresses('xyz', 'es')).rejects.toMatchObject({
      message: 'Photon search request failed',
      cause,
    })
    vi.unstubAllGlobals()
  })
})

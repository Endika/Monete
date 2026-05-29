import { describe, it, expect, vi } from 'vitest'
import { searchAddresses } from '@/infrastructure/geo/photonSearch'

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

  it('returns [] on short query or fetch error', async () => {
    expect(await searchAddresses('', 'es')).toEqual([])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await searchAddresses('xyz', 'es')).toEqual([])
    vi.unstubAllGlobals()
  })
})

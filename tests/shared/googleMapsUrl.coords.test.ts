import { describe, it, expect } from 'vitest'
import { googleMapsUrl } from '@/shared/utils/googleMapsUrl'

describe('googleMapsUrl coords', () => {
  it('uses coords when present', () => {
    expect(googleMapsUrl('whatever', { lat: 40.4, lng: -3.7 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=40.4,-3.7',
    )
  })
  it.each([
    { lat: null, lng: -3.7 },
    { lat: 40.4, lng: null },
  ])('falls back to the address when a coordinate is missing: %o', (coords) => {
    expect(googleMapsUrl('Plaza Mayor', coords)).toContain('query=Plaza%20Mayor')
  })
})

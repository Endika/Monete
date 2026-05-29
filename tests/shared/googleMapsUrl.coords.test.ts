import { describe, it, expect } from 'vitest'
import { googleMapsUrl } from '@/shared/utils/googleMapsUrl'

describe('googleMapsUrl coords', () => {
  it('uses coords when present', () => {
    expect(googleMapsUrl('whatever', { lat: 40.4, lng: -3.7 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=40.4,-3.7',
    )
  })
  it('falls back to address text without coords', () => {
    expect(googleMapsUrl('Plaza Mayor')).toContain('query=Plaza%20Mayor')
  })
})

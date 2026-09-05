import { describe, it, expect } from 'vitest'
import { googleMapsUrl } from '@/shared/utils/googleMapsUrl'

describe('googleMapsUrl', () => {
  it('builds an encoded maps search url', () => {
    expect(googleMapsUrl('Fun Park 12, Madrid')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Fun%20Park%2012%2C%20Madrid',
    )
  })
})

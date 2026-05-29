import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapEmbed } from '@/presentation/components/features/event/MapEmbed'
import '@/presentation/i18n/config'

afterEach(() => vi.unstubAllEnvs())

describe('MapEmbed', () => {
  it('renders an embed iframe with the key and coords when a key is set', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'testkey')
    const { container } = render(<MapEmbed address="Plaza Mayor" lat={40.4} lng={-3.7} />)
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe!.getAttribute('src')).toContain('maps/embed/v1/place')
    expect(iframe!.getAttribute('src')).toContain('key=testkey')
    expect(iframe!.getAttribute('src')).toContain('40.4%2C-3.7') // q=40.4,-3.7 url-encoded
  })

  it('renders nothing (no iframe) when no key is configured', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '')
    const { container } = render(<MapEmbed address="Plaza Mayor" lat={null} lng={null} />)
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('renders nothing when there is no address and no coords', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'testkey')
    const { container } = render(<MapEmbed address="" lat={null} lng={null} />)
    expect(container.querySelector('iframe')).toBeNull()
  })
})

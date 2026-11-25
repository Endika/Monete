import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

async function load() {
  vi.resetModules()
  return (await import('@/infrastructure/sync/SupabaseClient')).getSupabase
}

describe('getSupabase', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it.each(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'])(
    'throws when %s is missing',
    async (name) => {
      vi.stubEnv(name, '')
      const getSupabase = await load()
      expect(() => getSupabase()).toThrow('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    },
  )

  it('returns the same client on every call', async () => {
    const getSupabase = await load()
    expect(getSupabase()).toBe(getSupabase())
  })

  it('targets the monete schema and does not persist a session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const client = (await load())()
    await client.from('parties').select()
    const headers = new Headers((fetchMock.mock.calls[0]![1] as RequestInit).headers)
    expect(headers.get('Accept-Profile')).toBe('monete')
    expect((client.auth as unknown as { persistSession: boolean }).persistSession).toBe(false)
  })
})

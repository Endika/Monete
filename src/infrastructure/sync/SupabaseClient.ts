import { createClient } from '@supabase/supabase-js'

/** Monete's tables and RPCs live in the `monete` schema, not `public`. */
function createMoneteClient(url: string, key: string) {
  return createClient(url, key, { db: { schema: 'monete' }, auth: { persistSession: false } })
}

export type MoneteClient = ReturnType<typeof createMoneteClient>

let cached: MoneteClient | null = null

export function getSupabase(): MoneteClient {
  if (cached) return cached
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  cached = createMoneteClient(url, key)
  return cached
}

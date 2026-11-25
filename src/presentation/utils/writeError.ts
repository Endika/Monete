const MESSAGE_KEYS = new Map([
  ['PAYLOAD_TOO_LARGE', 'common.tooLarge'],
  ['STALE_CLIENT', 'common.updateRequired'],
  ['WRONG_PIN', 'host.wrongPin'],
  ['RATE_LIMITED', 'host.tooManyAttempts'],
])

export function errorCode(e: unknown): string | undefined {
  return e instanceof Error ? (e as Error & { code?: string }).code : undefined
}

/** Map a repository error to a user-facing message, honouring the server caps/guards. */
export function messageForError(t: (key: string) => string, e: unknown): string {
  const key = MESSAGE_KEYS.get(errorCode(e) ?? '')
  if (key) return t(key)
  return e instanceof Error ? e.message : String(e)
}

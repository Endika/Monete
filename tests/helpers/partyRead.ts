import type { ReadResult, UnlockedRead } from '@/domain/repositories/IPartyRepository'

/** Narrow a findById result for tests that assume the party read is not locked. */
export function unlocked(row: ReadResult | null): UnlockedRead {
  if (!row || row.locked) throw new Error('expected an unlocked party read')
  return row
}

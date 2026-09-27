import type { PartySnapshot } from '@/domain/entities/Party'
import {
  type IPartyRepository,
  type UnlockedRead,
  type SaveResult,
  VersionConflictError,
  WrongPinError,
} from '@/domain/repositories/IPartyRepository'

const MAX_RETRIES = 3

export async function withOptimisticRetry(
  repo: IPartyRepository,
  partyId: string,
  mutate: (row: UnlockedRead) => PartySnapshot,
  pin: string | null = null,
): Promise<SaveResult> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const row = await repo.findById(partyId, pin)
    if (!row) throw new Error('Party not found')
    if (row.locked) throw new WrongPinError()
    const next = mutate(row)
    try {
      return await repo.update(partyId, next, row.version, pin)
    } catch (err) {
      if (!(err instanceof VersionConflictError)) throw err
    }
  }
  throw new Error('Could not save: too many concurrent writes')
}

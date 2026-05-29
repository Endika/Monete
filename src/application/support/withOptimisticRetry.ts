import type { PartySnapshot } from '@/domain/entities/Party'
import {
  type IPartyRepository,
  type SaveResult,
  VersionConflictError,
} from '@/domain/repositories/IPartyRepository'

const MAX_RETRIES = 3

export async function withOptimisticRetry(
  repo: IPartyRepository,
  partyId: string,
  mutate: (row: { snapshot: PartySnapshot; version: number }) => PartySnapshot,
): Promise<SaveResult> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const row = await repo.findById(partyId)
    if (!row) throw new Error('Party not found')
    const next = mutate(row)
    try {
      return await repo.update(partyId, next, row.version)
    } catch (err) {
      if (!(err instanceof VersionConflictError)) throw err
    }
  }
  throw new Error('Could not save: too many concurrent writes')
}

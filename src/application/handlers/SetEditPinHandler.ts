import { SetEditPinSchema, type SetEditPinInput } from '@/application/dtos/SetEditPinDTO'
import { Party } from '@/domain/entities/Party'
import { EditPin } from '@/domain/value-objects/EditPin'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { withOptimisticRetry } from '@/application/support/withOptimisticRetry'

export class SetEditPinHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: SetEditPinInput): Promise<void> {
    const p = SetEditPinSchema.parse(input)
    const hash = p.pin === null ? null : await EditPin.hash(p.pin, p.partyId)
    await withOptimisticRetry(this.repo, p.partyId, (row) =>
      Party.restore(row.snapshot).setEditPin(hash).toSnapshot(),
    )
  }
}

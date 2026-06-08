import {
  EditPartyDetailsSchema,
  type EditPartyDetailsInput,
} from '@/application/dtos/EditPartyDetailsDTO'
import { Party } from '@/domain/entities/Party'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { withOptimisticRetry } from '@/application/support/withOptimisticRetry'

export class EditPartyDetailsHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: EditPartyDetailsInput): Promise<void> {
    const p = EditPartyDetailsSchema.parse(input)
    await withOptimisticRetry(
      this.repo,
      p.partyId,
      (row) =>
        Party.restore(row.snapshot)
          .editDetails({
            title: p.title,
            venueName: p.venueName,
            address: p.address,
            lat: p.lat,
            lng: p.lng,
            startsAt: p.startsAt,
            endsAt: p.endsAt,
            requirements: p.requirements,
            allDay: p.allDay,
          })
          .toSnapshot(),
      p.pin ?? null,
    )
  }
}

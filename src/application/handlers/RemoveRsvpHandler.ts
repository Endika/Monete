import { RemoveRsvpSchema, type RemoveRsvpInput } from '@/application/dtos/RemoveRsvpDTO'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export class RemoveRsvpHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: RemoveRsvpInput): Promise<void> {
    const p = RemoveRsvpSchema.parse(input)
    await this.repo.removeRsvp(p.partyId, p.rsvpId)
  }
}

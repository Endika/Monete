import type { PartySnapshot } from '@/domain/entities/Party'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export class RefreshPartyHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(partyId: string): Promise<{ snapshot: PartySnapshot; version: number } | null> {
    return this.repo.findById(partyId)
  }
}

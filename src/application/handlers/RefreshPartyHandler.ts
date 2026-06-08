import type { IPartyRepository, ReadResult } from '@/domain/repositories/IPartyRepository'

export class RefreshPartyHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(partyId: string): Promise<ReadResult | null> {
    return this.repo.findById(partyId)
  }
}

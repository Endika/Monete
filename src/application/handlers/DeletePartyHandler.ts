import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export class DeletePartyHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(partyId: string, pin: string | null): Promise<void> {
    await this.repo.deleteParty(partyId, pin)
  }
}

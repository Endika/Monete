import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export class VerifyPinHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(partyId: string, pin: string): Promise<boolean> {
    return this.repo.verifyPin(partyId, pin)
  }
}

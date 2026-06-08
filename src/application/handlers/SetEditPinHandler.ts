import { SetEditPinSchema, type SetEditPinInput } from '@/application/dtos/SetEditPinDTO'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export class SetEditPinHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: SetEditPinInput): Promise<void> {
    const p = SetEditPinSchema.parse(input)
    // Hashing happens server-side (set_party_pin); the plaintext never lands in a blob.
    await this.repo.setPin(p.partyId, p.pin, p.currentPin ?? null)
  }
}

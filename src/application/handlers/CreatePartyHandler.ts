import { CreatePartySchema, type CreatePartyInput } from '@/application/dtos/CreatePartyDTO'
import { Party, type PartySnapshot } from '@/domain/entities/Party'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export interface CreatePartyResult {
  party: PartySnapshot
  version: number
}

export class CreatePartyHandler {
  constructor(private readonly repo: IPartyRepository) {}

  async execute(input: CreatePartyInput): Promise<CreatePartyResult> {
    const parsed = CreatePartySchema.parse(input)
    const party = Party.create(parsed)
    const saved = await this.repo.create(party.toSnapshot())
    return { party: saved.snapshot, version: saved.version }
  }
}

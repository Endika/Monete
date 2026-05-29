import { generatePartyId } from '@/shared/utils/partyIdGenerator'

export class PartyId {
  private constructor(readonly value: string) {}

  static of(value: string): PartyId {
    if (!/^[a-z0-9]{7}$/.test(value)) throw new Error('PartyId: invalid format')
    return new PartyId(value)
  }

  static generate(): PartyId {
    return PartyId.of(generatePartyId())
  }
}

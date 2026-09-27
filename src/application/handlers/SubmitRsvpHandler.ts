import { SubmitRsvpSchema, type SubmitRsvpInput } from '@/application/dtos/SubmitRsvpDTO'
import { Party } from '@/domain/entities/Party'
import { type IPartyRepository, WrongPinError } from '@/domain/repositories/IPartyRepository'

export class SubmitRsvpHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: SubmitRsvpInput): Promise<{ rsvpId: string }> {
    const p = SubmitRsvpSchema.parse(input)
    const pin = p.pin ?? null
    const row = await this.repo.findById(p.partyId, pin)
    if (!row) throw new Error('Party not found')
    if (row.locked) throw new WrongPinError()
    // Validate against the current question set, then atomically append.
    const rsvp = Party.restore(row.snapshot).buildRsvp({
      parentsLabel: p.parentsLabel,
      familyAnswers: p.familyAnswers,
      children: p.children,
    })
    await this.repo.appendRsvp(p.partyId, rsvp, pin)
    return { rsvpId: rsvp.id }
  }
}

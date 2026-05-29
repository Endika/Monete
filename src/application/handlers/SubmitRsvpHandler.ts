import { SubmitRsvpSchema, type SubmitRsvpInput } from '@/application/dtos/SubmitRsvpDTO'
import { Party } from '@/domain/entities/Party'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export class SubmitRsvpHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: SubmitRsvpInput): Promise<{ rsvpId: string }> {
    const p = SubmitRsvpSchema.parse(input)
    const row = await this.repo.findById(p.partyId)
    if (!row) throw new Error('Party not found')
    // Validate against the current question set, then atomically append.
    const rsvp = Party.restore(row.snapshot).buildRsvp({
      parentsLabel: p.parentsLabel,
      familyAnswers: p.familyAnswers,
      children: p.children,
    })
    await this.repo.appendRsvp(p.partyId, rsvp)
    return { rsvpId: rsvp.id }
  }
}

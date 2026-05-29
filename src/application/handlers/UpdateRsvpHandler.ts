import { UpdateRsvpSchema, type UpdateRsvpInput } from '@/application/dtos/UpdateRsvpDTO'
import { Party } from '@/domain/entities/Party'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'

export class UpdateRsvpHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: UpdateRsvpInput): Promise<void> {
    const p = UpdateRsvpSchema.parse(input)
    const row = await this.repo.findById(p.partyId)
    if (!row) throw new Error('Party not found')
    const next = Party.restore(row.snapshot).updateRsvp(p.rsvpId, {
      parentsLabel: p.parentsLabel,
      familyAnswers: p.familyAnswers,
      children: p.children,
    })
    const rsvp = next.toSnapshot().rsvps.find((r) => r.id === p.rsvpId)!
    await this.repo.updateRsvp(p.partyId, p.rsvpId, rsvp)
  }
}

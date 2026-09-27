import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import { WrongPinError } from '@/domain/repositories/IPartyRepository'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { unlocked } from '../helpers/partyRead'

async function setup() {
  const repo = new InMemoryPartyRepository()
  const { party } = await new CreatePartyHandler(repo).execute({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  await new UpsertQuestionHandler(repo).execute({
    partyId: party.id,
    kind: 'snack',
    type: 'select',
    scope: 'child',
    label: 'Snack',
    options: ['Pizza', 'Hot dog'],
    required: true,
  })
  const qid = unlocked(await repo.findById(party.id)).snapshot.questions[0]!.id
  return { repo, partyId: party.id, qid }
}

describe('SubmitRsvpHandler', () => {
  it('appends a validated rsvp', async () => {
    const { repo, partyId, qid } = await setup()
    await new SubmitRsvpHandler(repo).execute({
      partyId,
      parentsLabel: 'Parents of Leo',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
    })
    expect(unlocked(await repo.findById(partyId)).snapshot.rsvps).toHaveLength(1)
  })

  it('rejects an invalid select answer before appending', async () => {
    const { repo, partyId, qid } = await setup()
    await expect(
      new SubmitRsvpHandler(repo).execute({
        partyId,
        parentsLabel: 'P',
        familyAnswers: {},
        children: [{ name: 'Leo', answers: { [qid]: 'Sushi' } }],
      }),
    ).rejects.toThrow(/option/i)
    expect(unlocked(await repo.findById(partyId)).snapshot.rsvps).toHaveLength(0)
  })

  it('refuses a submission without the PIN on a PIN-protected party', async () => {
    const { repo, partyId, qid } = await setup()
    await new SetEditPinHandler(repo).execute({ partyId, pin: '1234' })
    await expect(
      new SubmitRsvpHandler(repo).execute({
        partyId,
        parentsLabel: 'P',
        familyAnswers: {},
        children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
      }),
    ).rejects.toBeInstanceOf(WrongPinError)
  })

  it('accepts a submission with the correct PIN on a PIN-protected party', async () => {
    const { repo, partyId, qid } = await setup()
    await new SetEditPinHandler(repo).execute({ partyId, pin: '1234' })
    await new SubmitRsvpHandler(repo).execute({
      partyId,
      parentsLabel: 'P',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
      pin: '1234',
    })
    expect(unlocked(await repo.findById(partyId, '1234')).snapshot.rsvps).toHaveLength(1)
  })
})

import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import { UpdateRsvpHandler } from '@/application/handlers/UpdateRsvpHandler'
import { RemoveRsvpHandler } from '@/application/handlers/RemoveRsvpHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { WrongPinError } from '@/domain/repositories/IPartyRepository'
import { unlocked } from '../helpers/partyRead'

async function setup() {
  const repo = new InMemoryPartyRepository()
  const { party } = await new CreatePartyHandler(repo).execute({
    title: 'P',
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

describe('rsvp edit/remove handlers', () => {
  it('SubmitRsvpHandler returns the new rsvpId', async () => {
    const { repo, partyId, qid } = await setup()
    const res = await new SubmitRsvpHandler(repo).execute({
      partyId,
      parentsLabel: 'A',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
    })
    expect(res.rsvpId).toMatch(/[0-9a-f-]{36}/)
  })

  it('updates a rsvp by id', async () => {
    const { repo, partyId, qid } = await setup()
    const { rsvpId } = await new SubmitRsvpHandler(repo).execute({
      partyId,
      parentsLabel: 'A',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
    })
    await new UpdateRsvpHandler(repo).execute({
      partyId,
      rsvpId,
      parentsLabel: 'A2',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [qid]: 'Hot dog' } }],
    })
    const r = unlocked(await repo.findById(partyId)).snapshot.rsvps[0]!
    expect(r.parentsLabel).toBe('A2')
    expect(r.children[0]!.answers[qid]).toBe('Hot dog')
  })

  it('removes a rsvp by id', async () => {
    const { repo, partyId, qid } = await setup()
    const { rsvpId } = await new SubmitRsvpHandler(repo).execute({
      partyId,
      parentsLabel: 'A',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
    })
    await new RemoveRsvpHandler(repo).execute({ partyId, rsvpId })
    expect(unlocked(await repo.findById(partyId)).snapshot.rsvps).toHaveLength(0)
  })

  it('updates the targeted rsvp, not the first one', async () => {
    const { repo, partyId, qid } = await setup()
    const submit = (label: string) =>
      new SubmitRsvpHandler(repo).execute({
        partyId,
        parentsLabel: label,
        familyAnswers: {},
        children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
      })
    await submit('First')
    const { rsvpId } = await submit('Second')
    await new UpdateRsvpHandler(repo).execute({
      partyId,
      rsvpId,
      parentsLabel: 'Second edited',
      familyAnswers: {},
      children: [{ name: 'Leo', answers: { [qid]: 'Pizza' } }],
    })
    const labels = unlocked(await repo.findById(partyId)).snapshot.rsvps.map((r) => r.parentsLabel)
    expect(labels).toEqual(['First', 'Second edited'])
  })

  it.each([
    [
      'submit',
      (repo: InMemoryPartyRepository, partyId: string, pin?: string) =>
        new SubmitRsvpHandler(repo).execute({
          partyId,
          parentsLabel: 'A',
          familyAnswers: {},
          children: [{ name: 'Leo' }],
          pin,
        }),
    ],
    [
      'update',
      (repo: InMemoryPartyRepository, partyId: string, pin?: string) =>
        new UpdateRsvpHandler(repo).execute({
          partyId,
          rsvpId: 'r',
          parentsLabel: 'A',
          familyAnswers: {},
          children: [{ name: 'Leo' }],
          pin,
        }),
    ],
  ])('%s rejects an unknown party and a locked one', async (_name, run) => {
    const { repo, partyId } = await setup()
    await expect(run(repo, 'nope123')).rejects.toThrow('Party not found')
    await new SetEditPinHandler(repo).execute({ partyId, pin: '1234' })
    await expect(run(repo, partyId)).rejects.toBeInstanceOf(WrongPinError)
  })
})

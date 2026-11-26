import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import { RemoveQuestionHandler } from '@/application/handlers/RemoveQuestionHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { unlocked } from '../helpers/partyRead'

async function freshParty(repo: InMemoryPartyRepository) {
  const r = await new CreatePartyHandler(repo).execute({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  })
  return r.party.id
}

describe('host config handlers', () => {
  it('adds then removes a question', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new UpsertQuestionHandler(repo).execute({
      partyId: id,
      kind: 'snack',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza'],
      required: true,
    })
    const qid = unlocked(await repo.findById(id)).snapshot.questions[0]!.id
    await new RemoveQuestionHandler(repo).execute({ partyId: id, questionId: qid })
    expect(unlocked(await repo.findById(id)).snapshot.questions).toEqual([])
  })

  it('sets a pin, then reads it back as hasPin', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    expect((await repo.findById(id))?.hasPin).toBe(false)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    expect((await repo.findById(id))?.hasPin).toBe(true)
  })
})

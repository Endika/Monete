import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { EditPartyDetailsHandler } from '@/application/handlers/EditPartyDetailsHandler'
import { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import { RemoveQuestionHandler } from '@/application/handlers/RemoveQuestionHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'

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
  it('edits details', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new EditPartyDetailsHandler(repo).execute({
      partyId: id,
      title: 'Leo turns 5',
      address: 'Fun Park',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: 'Socks',
    })
    expect((await repo.findById(id))?.snapshot.event.address).toBe('Fun Park')
  })

  it('forwards coordinates and allDay when editing details', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new EditPartyDetailsHandler(repo).execute({
      partyId: id,
      title: 'Leo turns 5',
      address: 'Fun Park',
      startsAt: '2026-06-20T00:00:00.000Z',
      endsAt: null,
      requirements: '',
      allDay: true,
      lat: 40.4168,
      lng: -3.7038,
    })
    const event = (await repo.findById(id))!.snapshot.event
    expect(event.allDay).toBe(true)
    expect(event.lat).toBe(40.4168)
    expect(event.lng).toBe(-3.7038)
  })

  it('forwards venueName when editing details', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new EditPartyDetailsHandler(repo).execute({
      partyId: id,
      title: 'Leo turns 5',
      address: 'Fun Park',
      startsAt: '2026-06-20T17:00:00.000Z',
      endsAt: null,
      requirements: '',
      venueName: 'Jungle Park',
    })
    expect((await repo.findById(id))?.snapshot.event.venueName).toBe('Jungle Park')
  })

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
    const qid = (await repo.findById(id))!.snapshot.questions[0]!.id
    await new RemoveQuestionHandler(repo).execute({ partyId: id, questionId: qid })
    expect((await repo.findById(id))?.snapshot.questions).toEqual([])
  })

  it('updates an existing question when questionId is supplied', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    await new UpsertQuestionHandler(repo).execute({
      partyId: id,
      kind: 'custom',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza'],
      required: false,
    })
    const qid = (await repo.findById(id))!.snapshot.questions[0]!.id
    await new UpsertQuestionHandler(repo).execute({
      partyId: id,
      questionId: qid,
      kind: 'custom',
      type: 'select',
      scope: 'child',
      label: 'Snack',
      options: ['Pizza', 'Sushi'],
      required: true,
    })
    expect((await repo.findById(id))!.snapshot.questions[0]!.options).toEqual(['Pizza', 'Sushi'])
  })

  it('sets a pin, then reads it back as hasPin', async () => {
    const repo = new InMemoryPartyRepository()
    const id = await freshParty(repo)
    expect((await repo.findById(id))?.hasPin).toBe(false)
    await new SetEditPinHandler(repo).execute({ partyId: id, pin: '1234' })
    expect((await repo.findById(id))?.hasPin).toBe(true)
  })
})

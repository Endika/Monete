import { describe, it, expect } from 'vitest'
import { buildContainer } from '@/shared/di/wiring'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { EditPartyDetailsHandler } from '@/application/handlers/EditPartyDetailsHandler'
import { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import { RemoveQuestionHandler } from '@/application/handlers/RemoveQuestionHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { VerifyPinHandler } from '@/application/handlers/VerifyPinHandler'
import { DeletePartyHandler } from '@/application/handlers/DeletePartyHandler'
import { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import { UpdateRsvpHandler } from '@/application/handlers/UpdateRsvpHandler'
import { RemoveRsvpHandler } from '@/application/handlers/RemoveRsvpHandler'
import { RefreshPartyHandler } from '@/application/handlers/RefreshPartyHandler'

describe('wiring', () => {
  it.each([
    ['createParty', CreatePartyHandler],
    ['editPartyDetails', EditPartyDetailsHandler],
    ['upsertQuestion', UpsertQuestionHandler],
    ['removeQuestion', RemoveQuestionHandler],
    ['setEditPin', SetEditPinHandler],
    ['verifyPin', VerifyPinHandler],
    ['deleteParty', DeletePartyHandler],
    ['submitRsvp', SubmitRsvpHandler],
    ['updateRsvp', UpdateRsvpHandler],
    ['removeRsvp', RemoveRsvpHandler],
    ['refreshParty', RefreshPartyHandler],
  ])('resolves %s backed by the in-memory repo in test mode', (key, handler) => {
    const c = buildContainer({ inMemory: true })
    expect(c.resolve(key)).toBeInstanceOf(handler)
  })
})

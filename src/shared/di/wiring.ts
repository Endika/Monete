import { Container } from '@/shared/di/Container'
import { getSupabase } from '@/infrastructure/sync/SupabaseClient'
import { SupabasePartyRepository } from '@/infrastructure/persistence/SupabasePartyRepository'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { CreatePartyHandler } from '@/application/handlers/CreatePartyHandler'
import { EditPartyDetailsHandler } from '@/application/handlers/EditPartyDetailsHandler'
import { UpsertQuestionHandler } from '@/application/handlers/UpsertQuestionHandler'
import { RemoveQuestionHandler } from '@/application/handlers/RemoveQuestionHandler'
import { SetEditPinHandler } from '@/application/handlers/SetEditPinHandler'
import { VerifyPinHandler } from '@/application/handlers/VerifyPinHandler'
import { SubmitRsvpHandler } from '@/application/handlers/SubmitRsvpHandler'
import { UpdateRsvpHandler } from '@/application/handlers/UpdateRsvpHandler'
import { RemoveRsvpHandler } from '@/application/handlers/RemoveRsvpHandler'
import { RefreshPartyHandler } from '@/application/handlers/RefreshPartyHandler'

export function buildContainer(opts: { inMemory?: boolean } = {}): Container {
  const c = new Container()
  c.register<IPartyRepository>('partyRepo', () =>
    opts.inMemory ? new InMemoryPartyRepository() : new SupabasePartyRepository(getSupabase()),
  )
  c.register('createParty', () => new CreatePartyHandler(c.resolve('partyRepo')))
  c.register('editPartyDetails', () => new EditPartyDetailsHandler(c.resolve('partyRepo')))
  c.register('upsertQuestion', () => new UpsertQuestionHandler(c.resolve('partyRepo')))
  c.register('removeQuestion', () => new RemoveQuestionHandler(c.resolve('partyRepo')))
  c.register('setEditPin', () => new SetEditPinHandler(c.resolve('partyRepo')))
  c.register('verifyPin', () => new VerifyPinHandler(c.resolve('partyRepo')))
  c.register('submitRsvp', () => new SubmitRsvpHandler(c.resolve('partyRepo')))
  c.register('updateRsvp', () => new UpdateRsvpHandler(c.resolve('partyRepo')))
  c.register('removeRsvp', () => new RemoveRsvpHandler(c.resolve('partyRepo')))
  c.register('refreshParty', () => new RefreshPartyHandler(c.resolve('partyRepo')))
  return c
}

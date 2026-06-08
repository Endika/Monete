import { describe, it, expect } from 'vitest'
import { InMemoryPartyRepository } from '@/infrastructure/persistence/InMemoryPartyRepository'
import { PayloadTooLargeError } from '@/domain/repositories/IPartyRepository'
import { Party, type Rsvp } from '@/domain/entities/Party'

function snap() {
  return Party.create({
    title: 'Leo 5',
    address: 'A',
    startsAt: '2026-06-20T17:00:00.000Z',
    endsAt: null,
    requirements: '',
  }).toSnapshot()
}

function rsvp(overrides: Partial<Rsvp> = {}): Rsvp {
  return {
    id: 'r1',
    parentsLabel: 'Family',
    familyAnswers: {},
    children: [{ id: 'c1', name: 'Kid', isSibling: false, isBirthday: false, answers: {} }],
    createdAt: '2026-05-29T00:00:00.000Z',
    ...overrides,
  }
}

// These mirror the SQL caps in 0004_harden_access.sql — the fake enforces the same
// contract the client relies on. The SQL itself is verified manually against the DB.
describe('RSVP caps (anti-ballooning / egress abuse)', () => {
  it('rejects a single RSVP larger than the per-rsvp byte cap', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    const huge = rsvp({ parentsLabel: 'x'.repeat(9000) })
    await expect(repo.appendRsvp(s.id, huge)).rejects.toBeInstanceOf(PayloadTooLargeError)
  })

  it('rejects appending past the RSVP count cap', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    // Seed the blob with 300 rsvps directly, then attempt to append the 301st.
    s.rsvps = Array.from({ length: 300 }, (_, i) => rsvp({ id: `seed-${i}` }))
    await repo.create(s)
    await expect(repo.appendRsvp(s.id, rsvp({ id: 'overflow' }))).rejects.toBeInstanceOf(
      PayloadTooLargeError,
    )
  })

  it('rejects an RSVP edit that would push the total blob past the cap', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    // Seed near the total cap, plus a small target rsvp to edit.
    s.rsvps = [
      rsvp({ id: 'filler', parentsLabel: 'x'.repeat(256000) }),
      rsvp({ id: 'target' }),
    ]
    await repo.create(s)
    // The replacement is under the per-rsvp cap but tips the total blob over MAX_PARTY_BYTES.
    await expect(
      repo.updateRsvp(s.id, 'target', rsvp({ id: 'target', parentsLabel: 'y'.repeat(8000) })),
    ).rejects.toBeInstanceOf(PayloadTooLargeError)
  })

  it('allows a normal RSVP under the caps', async () => {
    const repo = new InMemoryPartyRepository()
    const s = snap()
    await repo.create(s)
    await repo.appendRsvp(s.id, rsvp())
    expect((await repo.findById(s.id))?.snapshot.rsvps).toHaveLength(1)
  })
})

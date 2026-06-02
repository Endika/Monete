import { describe, it, expect } from 'vitest'
import { RecentsStore } from '@/infrastructure/persistence/RecentsStore'

function memStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage
}

describe('RecentsStore', () => {
  it('adds + lists hosted, most-recent-first, de-duped', () => {
    const s = new RecentsStore(memStorage())
    s.addHosted({ id: 'a', title: 'A', startsAt: '2026-06-20T17:00:00.000Z' })
    s.addHosted({ id: 'b', title: 'B', startsAt: '2026-06-21T17:00:00.000Z' })
    s.addHosted({ id: 'a', title: 'A2', startsAt: '2026-06-20T17:00:00.000Z' })
    expect(s.listHosted().map((e) => e.id)).toEqual(['a', 'b'])
    expect(s.listHosted()[0]!.title).toBe('A2')
  })

  it('tracks joined with rsvpId and looks one up', () => {
    const s = new RecentsStore(memStorage())
    s.addJoined({ id: 'p1', title: 'P', startsAt: '2026-06-20T17:00:00.000Z', rsvpId: 'r1' })
    expect(s.getJoined('p1')!.rsvpId).toBe('r1')
  })

  it('removeJoined drops the entry for a party', () => {
    const s = new RecentsStore(memStorage())
    s.addJoined({ id: 'p1', title: 'P', startsAt: 'x', rsvpId: 'r1' })
    s.removeJoined('p1')
    expect(s.getJoined('p1')).toBeUndefined()
  })

  it('updateHosted updates an existing entry in place without reordering', () => {
    const s = new RecentsStore(memStorage())
    s.addHosted({ id: 'a', title: 'Old A', startsAt: '2026-01-01T00:00:00.000Z' })
    s.addHosted({ id: 'b', title: 'B', startsAt: '2026-02-01T00:00:00.000Z' })
    // current order is most-recent-first: ['b', 'a']
    s.updateHosted('a', { title: 'New A', startsAt: '2026-03-01T00:00:00.000Z' })
    const list = s.listHosted()
    expect(list.map((e) => e.id)).toEqual(['b', 'a'])
    expect(list.find((e) => e.id === 'a')).toEqual({
      id: 'a',
      title: 'New A',
      startsAt: '2026-03-01T00:00:00.000Z',
    })
  })

  it('updateHosted is a no-op when the id is not present', () => {
    const s = new RecentsStore(memStorage())
    s.addHosted({ id: 'a', title: 'A', startsAt: '2026-01-01T00:00:00.000Z' })
    s.updateHosted('missing', { title: 'X' })
    expect(s.listHosted()).toEqual([{ id: 'a', title: 'A', startsAt: '2026-01-01T00:00:00.000Z' }])
  })
})

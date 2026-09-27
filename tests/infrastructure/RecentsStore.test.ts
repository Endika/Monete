import { describe, it, expect, vi } from 'vitest'
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

  it('updateJoined updates an existing entry in place, keeping its rsvpId', () => {
    const s = new RecentsStore(memStorage())
    s.addJoined({ id: 'p1', title: 'P', startsAt: '2026-01-01T00:00:00.000Z', rsvpId: 'r1' })
    s.updateJoined('p1', { title: 'P2' })
    expect(s.getJoined('p1')).toEqual({
      id: 'p1',
      title: 'P2',
      startsAt: '2026-01-01T00:00:00.000Z',
      rsvpId: 'r1',
    })
  })

  it('blankLocked clears title/startsAt, sets locked:true, keeps the entry, its id and rsvpId', () => {
    const s = new RecentsStore(memStorage())
    s.addHosted({ id: 'h1', title: 'Hosted party', startsAt: '2026-01-01T00:00:00.000Z' })
    s.addJoined({
      id: 'j1',
      title: 'Joined party',
      startsAt: '2026-02-01T00:00:00.000Z',
      rsvpId: 'r1',
    })

    s.blankLocked('h1')
    s.blankLocked('j1')

    expect(s.listHosted()).toEqual([{ id: 'h1', title: '', startsAt: '', locked: true }])
    expect(s.getJoined('j1')).toEqual({
      id: 'j1',
      title: '',
      startsAt: '',
      rsvpId: 'r1',
      locked: true,
    })
  })

  it('blankLocked on an unknown id touches neither list', () => {
    const s = new RecentsStore(memStorage())
    s.addHosted({ id: 'h1', title: 'Hosted party', startsAt: '2026-01-01T00:00:00.000Z' })
    s.blankLocked('missing')
    expect(s.listHosted()).toEqual([
      { id: 'h1', title: 'Hosted party', startsAt: '2026-01-01T00:00:00.000Z' },
    ])
  })

  it('refreshEntry repopulates title/startsAt and clears locked, keeping rsvpId', () => {
    const s = new RecentsStore(memStorage())
    s.addJoined({
      id: 'j1',
      title: 'Joined party',
      startsAt: '2026-02-01T00:00:00.000Z',
      rsvpId: 'r1',
    })
    s.blankLocked('j1')
    expect(s.getJoined('j1')!.locked).toBe(true)

    s.refreshEntry('j1', { title: 'Joined party', startsAt: '2026-02-01T00:00:00.000Z' })

    expect(s.getJoined('j1')).toEqual({
      id: 'j1',
      title: 'Joined party',
      startsAt: '2026-02-01T00:00:00.000Z',
      rsvpId: 'r1',
      locked: false,
    })
  })

  // Format guards: a hardcoded literal of what a real device already has on disk, never one
  // produced by a save call in this test — that would only prove a round-trip, not that an
  // older shape still loads.
  it('format guard: loads a hosted list with an old entry (no locked) and a locked one', () => {
    const storage = memStorage()
    storage.setItem(
      'monete:hosted',
      '[{"id":"h1","title":"Old one","startsAt":"2026-01-01T00:00:00.000Z"},' +
        '{"id":"h2","title":"","startsAt":"","locked":true}]',
    )
    const s = new RecentsStore(storage)
    expect(s.listHosted()).toEqual([
      { id: 'h1', title: 'Old one', startsAt: '2026-01-01T00:00:00.000Z' },
      { id: 'h2', title: '', startsAt: '', locked: true },
    ])
  })

  it('format guard: loads a joined list with an old entry (no rsvpId/locked) and a claimed one', () => {
    const storage = memStorage()
    storage.setItem(
      'monete:joined',
      '[{"id":"j1","title":"Old one","startsAt":"2026-01-01T00:00:00.000Z"},' +
        '{"id":"j2","title":"Joined party","startsAt":"2026-02-01T00:00:00.000Z","rsvpId":"r1","locked":false}]',
    )
    const s = new RecentsStore(storage)
    expect(s.listJoined()).toEqual([
      { id: 'j1', title: 'Old one', startsAt: '2026-01-01T00:00:00.000Z' },
      {
        id: 'j2',
        title: 'Joined party',
        startsAt: '2026-02-01T00:00:00.000Z',
        rsvpId: 'r1',
        locked: false,
      },
    ])
  })

  it('reads an unparseable stored list as empty instead of throwing', () => {
    const storage = memStorage()
    storage.setItem('monete:hosted', '{not json')
    const s = new RecentsStore(storage)
    expect(s.listHosted()).toEqual([])
  })

  it('reads a parseable non-array stored list as empty instead of crashing', () => {
    const storage = memStorage()
    storage.setItem('monete:joined', '{"oops":"this is an object, not a list"}')
    const s = new RecentsStore(storage)
    expect(s.listJoined()).toEqual([])
  })

  it('blankLocked never overwrites an unparseable stored list', () => {
    const storage = memStorage()
    storage.setItem('monete:hosted', '{not json')
    storage.setItem('monete:joined', '{not json either')
    const setItemSpy = vi.spyOn(storage, 'setItem')

    const s = new RecentsStore(storage)
    s.blankLocked('h1')

    expect(setItemSpy).not.toHaveBeenCalled()
    expect(storage.getItem('monete:hosted')).toBe('{not json')
    expect(storage.getItem('monete:joined')).toBe('{not json either')
  })

  it('blankLocked never overwrites a parseable non-array stored list', () => {
    const storage = memStorage()
    storage.setItem('monete:hosted', '{"not":"an array"}')
    const setItemSpy = vi.spyOn(storage, 'setItem')

    const s = new RecentsStore(storage)
    s.blankLocked('h1')

    expect(setItemSpy).not.toHaveBeenCalled()
    expect(storage.getItem('monete:hosted')).toBe('{"not":"an array"}')
  })

  it('refreshEntry never overwrites an unreadable stored list', () => {
    const storage = memStorage()
    storage.setItem('monete:joined', '[not valid json')
    const setItemSpy = vi.spyOn(storage, 'setItem')

    const s = new RecentsStore(storage)
    s.refreshEntry('j1', { title: 'Party', startsAt: '2026-01-01T00:00:00.000Z' })

    expect(setItemSpy).not.toHaveBeenCalled()
    expect(storage.getItem('monete:joined')).toBe('[not valid json')
  })

  it('a user action (addHosted) may write even though the stored list was unreadable', () => {
    const storage = memStorage()
    storage.setItem('monete:hosted', '{not json')
    const s = new RecentsStore(storage)

    s.addHosted({ id: 'h1', title: 'Fresh start', startsAt: '2026-01-01T00:00:00.000Z' })

    expect(s.listHosted()).toEqual([
      { id: 'h1', title: 'Fresh start', startsAt: '2026-01-01T00:00:00.000Z' },
    ])
  })

  it('a user action (removeJoined) may write even though the stored list was unreadable', () => {
    const storage = memStorage()
    storage.setItem('monete:joined', '{not json')
    const s = new RecentsStore(storage)

    expect(() => s.removeJoined('j1')).not.toThrow()
    expect(s.listJoined()).toEqual([])
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSubmitting } from '@/presentation/hooks/useSubmitting'

describe('useSubmitting', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('transitions idle → submitting → saved → idle', async () => {
    const { result } = renderHook(() => useSubmitting())

    expect(result.current.status).toBe('idle')

    let runPromise: Promise<void>
    await act(async () => {
      runPromise = result.current.run(async () => {
        /* resolves immediately */
      })
      await runPromise
    })

    expect(result.current.status).toBe('saved')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.status).toBe('idle')
  })

  it('resets to idle and rethrows on error', async () => {
    const { result } = renderHook(() => useSubmitting())
    const boom = new Error('boom')

    await act(async () => {
      await expect(
        result.current.run(async () => {
          throw boom
        }),
      ).rejects.toThrow('boom')
    })

    expect(result.current.status).toBe('idle')
  })

  it('disables double-submit while submitting', async () => {
    let resolve!: () => void
    const slow = new Promise<void>((res) => {
      resolve = res
    })

    const { result } = renderHook(() => useSubmitting())
    const calls: string[] = []

    let firstRun: Promise<void>
    act(() => {
      firstRun = result.current.run(async () => {
        calls.push('first')
        await slow
      })
    })

    expect(result.current.status).toBe('submitting')

    await act(async () => {
      resolve()
      await firstRun!
    })

    expect(calls).toEqual(['first'])
    expect(result.current.status).toBe('saved')
  })

  it('restarts the saved timer when run again before it fires', async () => {
    const { result } = renderHook(() => useSubmitting())
    const ok = async () => {}

    await act(async () => result.current.run(ok))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    await act(async () => result.current.run(ok))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.status).toBe('saved')
  })

  it('cancels the pending timer on unmount', async () => {
    const { result, unmount } = renderHook(() => useSubmitting())

    await act(async () => result.current.run(async () => {}))
    expect(vi.getTimerCount()).toBe(1)
    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { useInstallPrompt } from '@/presentation/hooks/useInstallPrompt'

function fireInstallPrompt(userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>) {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice,
  })
  act(() => {
    window.dispatchEvent(event)
  })
  return event
}

function stubEnvironment(env: { userAgent?: string; platform?: string; touchPoints?: number }) {
  vi.stubGlobal('navigator', {
    userAgent: env.userAgent ?? 'Mozilla/5.0 (X11)',
    platform: env.platform ?? 'Linux x86_64',
    maxTouchPoints: env.touchPoints ?? 0,
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, 'standalone')
})

describe('useInstallPrompt', () => {
  it('does nothing when prompting without a captured event', async () => {
    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.canInstall).toBe(false)
    await act(() => result.current.promptInstall())
    expect(result.current.canInstall).toBe(false)
  })

  it('captures beforeinstallprompt, prompts once and clears it afterwards', async () => {
    const { result, unmount } = renderHook(() => useInstallPrompt())
    const event = fireInstallPrompt(Promise.resolve({ outcome: 'accepted' }))

    expect(event.defaultPrevented).toBe(true)
    expect(result.current.canInstall).toBe(true)

    await act(() => result.current.promptInstall())

    expect(event.prompt).toHaveBeenCalledOnce()
    expect(result.current.canInstall).toBe(false)
    unmount()
  })

  it('reports canInstall as false when rendered on the server', () => {
    fireInstallPrompt(Promise.resolve({ outcome: 'dismissed' }))
    function Probe() {
      return <span>{String(useInstallPrompt().canInstall)}</span>
    }

    expect(renderToString(<Probe />)).toContain('false')
  })

  it.each([
    ['iPhone UA', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' }, true],
    ['iPad UA', { userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0)' }, true],
    ['iPadOS desktop UA', { platform: 'MacIntel', touchPoints: 5 }, true],
    ['Mac without touch', { platform: 'MacIntel', touchPoints: 0 }, false],
    ['Mac with a single touch point', { platform: 'MacIntel', touchPoints: 1 }, false],
    ['touch device that is not a Mac', { platform: 'Win32', touchPoints: 5 }, false],
    ['touch device with empty platform', { platform: '', touchPoints: 5 }, false],
    ['plain desktop', {}, false],
  ])('detects iOS: %s', (_name, env, expected) => {
    stubEnvironment(env)

    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.isIos).toBe(expected)
  })

  it.each([
    ['no signal', undefined, undefined, false],
    ['display-mode standalone', true, undefined, true],
    ['navigator.standalone', false, true, true],
    ['both signals', true, true, true],
    ['display-mode browser, navigator.standalone false', false, false, false],
  ])('detects standalone: %s', (_name, displayMode, navigatorStandalone, expected) => {
    if (displayMode !== undefined) {
      vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
          matches: displayMode && query === '(display-mode: standalone)',
        })),
      )
    }
    if (navigatorStandalone !== undefined) {
      Object.defineProperty(navigator, 'standalone', {
        value: navigatorStandalone,
        configurable: true,
      })
    }

    const { result } = renderHook(() => useInstallPrompt())

    expect(result.current.isStandalone).toBe(expected)
  })
})

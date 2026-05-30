import { useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'submitting' | 'saved'

export function useSubmitting(): {
  status: Status
  run: (fn: () => Promise<void>) => Promise<void>
} {
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const run = async (fn: () => Promise<void>) => {
    if (timer.current) clearTimeout(timer.current)
    setStatus('submitting')
    try {
      await fn()
      setStatus('saved')
      timer.current = setTimeout(() => setStatus('idle'), 2000)
    } catch (e) {
      setStatus('idle')
      throw e
    }
  }

  return { status, run }
}

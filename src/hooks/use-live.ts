'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// 实时数据 Hook：自动轮询 + 页面可见时刷新 + 手动刷新
export function useLive<T>(url: string | null, intervalMs = 60000) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [tick, setTick] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(
    async (silent: boolean) => {
      if (!url) return
      if (abortRef.current) abortRef.current.abort()
      const ac = new AbortController()
      abortRef.current = ac
      if (!silent) setLoading(true)
      try {
        const res = await fetch(url, { signal: ac.signal, cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as T
        if (ac.signal.aborted) return
        setData(json)
        setError(null)
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(String(e?.message ?? e))
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    },
    [url]
  )

  useEffect(() => {
    load(false)
  }, [load, tick])

  useEffect(() => {
    if (!url) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load(true)
    }, intervalMs)
    const onVis = () => {
      if (document.visibilityState === 'visible') load(true)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [url, intervalMs, load])

  const refresh = useCallback(() => setTick((x) => x + 1), [])
  return { data, error, loading, refresh }
}

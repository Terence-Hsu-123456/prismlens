// 轻量内存缓存：TTL + 在途请求去重（避免并发重复拉取外部数据源）
type Entry = { value: unknown; expires: number }

const store = new Map<string, Entry>()
const inflight = new Map<string, Promise<unknown>>()

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key)
  if (!hit) return undefined
  if (Date.now() > hit.expires) {
    store.delete(key)
    return undefined
  }
  return hit.value as T
}

export function cacheSet(key: string, value: unknown, ttlMs: number) {
  store.set(key, { value, expires: Date.now() + ttlMs })
  if (store.size > 1200) {
    const now = Date.now()
    for (const [k, v] of store) if (now > v.expires) store.delete(k)
  }
}

export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cacheGet<T>(key)
  if (hit !== undefined) return hit
  const pending = inflight.get(key) as Promise<T> | undefined
  if (pending) return pending
  const p = (async () => {
    try {
      const v = await fn()
      cacheSet(key, v, ttlMs)
      return v
    } finally {
      inflight.delete(key)
    }
  })()
  inflight.set(key, p)
  return p
}

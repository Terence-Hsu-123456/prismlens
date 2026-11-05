// 财务质量指标（ROE / 净利率 / 营收增长）：quoteSummary 为单只接口且依赖 crumb（限流严重），
// 策略：内存长缓存（24h，季报级慢变量）+ 后台泵逐只预取（间隔 500ms 防限流）；
// screener API 每次刷新时同步读取已有缓存 + 触发缺失标的的后台补齐（fire-and-forget，渐进增强）
import { yahooQuoteSummary } from './yahoo'

export type Fundamentals = {
  roe: number | null // returnOnEquity（小数，0.15 = 15%）
  profitMargin: number | null // profitMargins（小数）
  revenueGrowth: number | null // revenueGrowth（小数，0.2 = +20%）
}

const NULL_FUND: Fundamentals = { roe: null, profitMargin: null, revenueGrowth: null }

const store = new Map<string, { f: Fundamentals; at: number }>()
const queue: string[] = []
const queued = new Set<string>()
const failedUntil = new Map<string, number>()
let pumping = false

const TTL = 24 * 3600_000
const RETRY_BACKOFF = 10 * 60_000 // 拉取失败后 10 分钟内不重试（防 crumb 限流风暴）

const rv = (v: any) => (v && typeof v === 'object' && 'raw' in v ? v.raw : v)
const num = (v: any): number | null => {
  const n = rv(v)
  return typeof n === 'number' && isFinite(n) ? n : null
}

async function fetchOne(sym: string): Promise<Fundamentals | null> {
  try {
    const data = await yahooQuoteSummary(sym, 'financialData')
    const fin = data?.quoteSummary?.result?.[0]?.financialData
    if (!fin) return null
    const f: Fundamentals = {
      roe: num(fin.returnOnEquity),
      profitMargin: num(fin.profitMargins),
      revenueGrowth: num(fin.revenueGrowth),
    }
    return f.roe != null || f.profitMargin != null || f.revenueGrowth != null ? f : null
  } catch {
    return null
  }
}

// 后台泵：逐只拉取（指数/ETF 没有财务数据，失败快速跳过）
function pump() {
  if (pumping) return
  pumping = true
  ;(async () => {
    while (queue.length) {
      const sym = queue.shift()!
      queued.delete(sym)
      if (Date.now() < (failedUntil.get(sym) ?? 0)) continue
      const f = await fetchOne(sym)
      if (f) {
        store.set(sym, { f, at: Date.now() })
      } else {
        failedUntil.set(sym, Date.now() + RETRY_BACKOFF)
        await new Promise((r) => setTimeout(r, 1500))
      }
      await new Promise((r) => setTimeout(r, 500))
    }
  })()
    .catch(() => {})
    .finally(() => {
      pumping = false
    })
}

// 同步读（不阻塞 API 响应）
export function getFundamentals(sym: string): Fundamentals {
  const hit = store.get(sym)
  if (hit && Date.now() - hit.at < TTL) return hit.f
  return NULL_FUND
}

// 触发缺失标的的后台刷新（fire-and-forget；自动去重 + 失败退避）
export function ensureFundamentals(symbols: string[]) {
  const now = Date.now()
  let added = false
  for (const s of symbols) {
    if (!s || queued.has(s)) continue
    const hit = store.get(s)
    if (hit && now - hit.at < TTL) continue
    if (now < (failedUntil.get(s) ?? 0)) continue
    queue.push(s)
    queued.add(s)
    added = true
  }
  if (added) pump()
}

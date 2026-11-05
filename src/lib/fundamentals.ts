// 财务质量指标泵（ROE / 净利率 / 营收增长 / PE / PB / 股息率 / 行业）：
// quoteSummary 为单只接口且依赖 crumb（限流严重）→ 后台泵逐只渐进补齐（间隔 600ms 防限流）；
// 结果直接写回 SQLite 公司池（ScreenCompany），跨重启持久累积；内存缓存仅供精选池同步即时读取
import { db } from '@/lib/db'
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

// Yahoo sector → 统一行业 key
function sectorFromYahoo(s: string | null): string | null {
  if (!s) return null
  const m: Record<string, string> = {
    Technology: 'tech',
    'Consumer Cyclical': 'consumer',
    'Consumer Defensive': 'consumer',
    Healthcare: 'health',
    'Financial Services': 'finance',
    Energy: 'energy',
    Industrials: 'industrial',
    'Basic Materials': 'materials',
    Utilities: 'utility',
    'Communication Services': 'comm',
    'Real Estate': 'realestate',
  }
  return m[s.trim()] ?? null
}

// 拉取一只：财务 + 估值 + 行业，并写回 DB（渐进增强）
async function fetchOne(sym: string): Promise<Fundamentals | null> {
  try {
    const data = await yahooQuoteSummary(sym, 'assetProfile,financialData,summaryDetail')
    const r0 = data?.quoteSummary?.result?.[0]
    if (!r0) return null
    const fin = r0.financialData
    const det = r0.summaryDetail
    const asset = r0.assetProfile

    const f: Fundamentals = {
      roe: num(fin?.returnOnEquity),
      profitMargin: num(fin?.profitMargins),
      revenueGrowth: num(fin?.revenueGrowth),
    }
    const pe = num(det?.trailingPE)
    const pbRaw = num(det?.priceToBook)
    const divRaw = num(det?.dividendYield)
    const dividendYield = divRaw != null && divRaw > 0 ? (divRaw < 1 ? divRaw * 100 : divRaw) : null
    const sector = sectorFromYahoo(asset?.sector ?? null)

    const hasAny =
      f.roe != null || f.profitMargin != null || f.revenueGrowth != null ||
      pe != null || (pbRaw != null && pbRaw > 0) || dividendYield != null || sector != null
    if (!hasAny) return null

    // 写回公司池（存在才写；若 DB 尚无该行则跳过——下次同步的泵会再补）
    try {
      await db.screenCompany.update({
        where: { symbol: sym },
        data: {
          ...(f.roe != null ? { roe: f.roe * 100 } : {}),
          ...(f.profitMargin != null ? { profitMargin: f.profitMargin * 100 } : {}),
          ...(f.revenueGrowth != null ? { revenueGrowth: f.revenueGrowth * 100 } : {}),
          ...(pe != null && pe > 0 ? { pe } : {}),
          ...(pbRaw != null && pbRaw > 0 ? { pb: pbRaw } : {}),
          ...(dividendYield != null ? { dividendYield } : {}),
          ...(sector != null ? { sector } : {}),
        },
      })
    } catch {
      /* 行不存在（已被清理）忽略 */
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
        await new Promise((r) => setTimeout(r, 600))
      } else {
        failedUntil.set(sym, Date.now() + RETRY_BACKOFF)
        await new Promise((r) => setTimeout(r, 1500))
      }
    }
  })()
    .catch(() => {})
    .finally(() => {
      pumping = false
    })
}

// 同步读（不阻塞 API 响应；精选池同步时用）
export function getFundamentals(sym: string): Fundamentals {
  const hit = store.get(sym)
  if (hit && Date.now() - hit.at < TTL) return hit.f
  return NULL_FUND
}

// 触发缺失标的的后台刷新（fire-and-forget；自动去重 + 失败退避；按市值降序传入优先补大市值）
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

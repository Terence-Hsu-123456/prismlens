// 服务端筛股引擎：拉取真实公司池行情 → 结构化 → 过滤（腾讯主源 + Yahoo 补全）
import { cached } from './cache'
import { getQuotes, type YQuote } from './quotes'
import { UNIVERSE, MARKET_CURRENCY } from './universe'
import { toUSD } from './format'
import { getFundamentals, ensureFundamentals } from './fundamentals'

export type ScreenRow = {
  symbol: string
  nameZh: string
  nameEn: string
  nameJa: string
  market: string
  country: string
  sector: string
  stage: string
  tags: string[]
  price: number
  currency: string
  changePercent: number | null
  marketCap: number | null
  pe: number | null
  pb: number | null
  dividendYield: number | null
  roe: number | null // %
  profitMargin: number | null // %
  revenueGrowth: number | null // %
  asOf: number
  degraded: boolean
}

function dividendOf(q: YQuote): number | null {
  if (typeof q.trailingAnnualDividendYield === 'number') return q.trailingAnnualDividendYield * 100
  if (typeof q.dividendYield === 'number') {
    // 不同市场字段口径不同：部分返回小数，部分直接是百分比
    return q.dividendYield > 0 && q.dividendYield < 1 ? q.dividendYield * 100 : q.dividendYield
  }
  return null
}

export async function loadUniverseRows() {
  return cached('universe:rows:v3', 60_000, async () => {
    const syms = UNIVERSE.map((u) => u.s)
    let quotes: Record<string, YQuote> = {}
    try {
      quotes = await getQuotes(syms)
    } catch {
      quotes = {}
    }
    const rows: ScreenRow[] = []
    for (const u of UNIVERSE) {
      const q = quotes[u.s]
      if (!q || typeof q.regularMarketPrice !== 'number' || !isFinite(q.regularMarketPrice)) continue
      const f = getFundamentals(u.s)
      rows.push({
        symbol: u.s,
        nameZh: u.n.zh,
        nameEn: u.n.en,
        nameJa: u.n.ja ?? u.n.en,
        market: u.mkt,
        country: u.ctry,
        sector: u.sec,
        stage: u.stage,
        tags: u.tags,
        price: q.regularMarketPrice,
        currency: q.currency ?? u.cur ?? MARKET_CURRENCY[u.mkt],
        changePercent: typeof q.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : null,
        marketCap: typeof q.marketCap === 'number' ? q.marketCap : null,
        pe: typeof q.trailingPE === 'number' ? q.trailingPE : null,
        pb: typeof q.priceToBook === 'number' && q.priceToBook > 0 ? q.priceToBook : null,
        dividendYield: dividendOf(q),
        roe: f.roe != null ? f.roe * 100 : null,
        profitMargin: f.profitMargin != null ? f.profitMargin * 100 : null,
        revenueGrowth: f.revenueGrowth != null ? f.revenueGrowth * 100 : null,
        asOf: typeof q.regularMarketTime === 'number' ? q.regularMarketTime * 1000 : Date.now(),
        degraded: !!q._degraded,
      })
    }
    // 缺财务指标的标的 → 后台泵逐只预取（下次刷新渐次补齐，不阻塞本次响应）
    ensureFundamentals(syms)
    // 若可用报价少于公司池六成，标记降级（数据源波动）
    const degraded = rows.length < syms.length * 0.6
    return { rows, asOf: Date.now(), degraded }
  })
}

export type Filters = {
  market?: string
  sector?: string
  stage?: string
  capMinUSD?: number | null
  peMax?: number | null
  pbMax?: number | null
  divMin?: number | null
  roeMin?: number | null
  pmMin?: number | null
  revMin?: number | null
  kw?: string
}

export function applyFilters(rows: ScreenRow[], f: Filters): ScreenRow[] {
  const kw = (f.kw ?? '').trim().toLowerCase()
  return rows
    .filter((r) => {
      if (f.market && f.market !== 'ALL' && r.market !== f.market) return false
      if (f.sector && f.sector !== 'ALL' && r.sector !== f.sector) return false
      if (f.stage && f.stage !== 'ALL' && r.stage !== f.stage) return false
      if (f.capMinUSD) {
        const usd = toUSD(r.marketCap, r.currency)
        if (usd == null || usd < f.capMinUSD) return false
      }
      if (f.peMax != null) {
        if (r.pe == null || r.pe <= 0 || r.pe > f.peMax) return false
      }
      if (f.pbMax != null) {
        if (r.pb == null || r.pb <= 0 || r.pb > f.pbMax) return false
      }
      if (f.divMin != null && f.divMin > 0) {
        if (r.dividendYield == null || r.dividendYield < f.divMin) return false
      }
      if (f.roeMin != null) {
        if (r.roe == null || r.roe < f.roeMin) return false
      }
      if (f.pmMin != null) {
        if (r.profitMargin == null || r.profitMargin < f.pmMin) return false
      }
      if (f.revMin != null) {
        if (r.revenueGrowth == null || r.revenueGrowth < f.revMin) return false
      }
      if (kw) {
        const hay = `${r.nameZh} ${r.nameEn} ${r.nameJa} ${r.tags.join(' ')} ${r.sector} ${r.stage} ${r.symbol}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (toUSD(b.marketCap, b.currency) ?? 0) - (toUSD(a.marketCap, a.currency) ?? 0))
}

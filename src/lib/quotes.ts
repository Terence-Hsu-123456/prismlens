// 统一行情门面：腾讯主源（A股/港股/美股/核心指数/商品）+ Yahoo 补充（日韩印欧/财务字段）
// 策略：腾讯能覆盖的用腾讯（稳、快、无限流），Yahoo 负责其余市场与字段补全；单源故障自动降级
import { yahooQuotes, yahooChart, type YQuote } from './yahoo'
import { tencentQuotes, tencentKline, tencentMinute, tencentCode, type ChartPoint } from './tencent'

export type { ChartPoint }
export type { YQuote }

// 腾讯行情缺失、需要从 Yahoo 补全的字段（腾讯美股不提供估值字段）
const FILL_KEYS = [
  'marketCap',
  'trailingPE',
  'forwardPE',
  'priceToBook',
  'fiftyTwoWeekHigh',
  'fiftyTwoWeekLow',
  'fiftyDayAverage',
  'twoHundredDayAverage',
  'dividendYield',
  'trailingAnnualDividendYield',
  'trailingAnnualDividendRate',
  'averageDailyVolume3Month',
  'epsTrailingTwelveMonths',
  'bookValue',
  'longName',
  'shortName',
] as const

// 合并：腾讯的价格/时间为准，Yahoo 补全估值与统计字段
function mergeQuote(t: TQuoteN, y: YQuote | undefined): TQuoteN {
  if (!y) return t
  const out: Record<string, any> = { ...y, ...t }
  for (const k of FILL_KEYS) {
    const tv = t[k]
    const yv = y[k]
    if ((tv == null || tv === '') && yv != null) out[k] = yv
  }
  out._degraded = !y
  return out
}

type TQuoteN = Record<string, any>

export async function getQuotes(symbols: string[]): Promise<Record<string, YQuote>> {
  const uniq = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)))
  if (!uniq.length) return {}
  const tSyms = uniq.filter((s) => !!tencentCode(s))
  const rest = uniq.filter((s) => !tencentCode(s))

  const [tRes, yRes] = await Promise.allSettled([
    tSyms.length ? tencentQuotes(tSyms) : Promise.resolve({} as Record<string, TQuoteN>),
    // Yahoo 拉全部：既覆盖非腾讯市场，也补全腾讯缺失的估值字段
    yahooQuotes(uniq),
  ])

  const t = tRes.status === 'fulfilled' ? tRes.value : {}
  const y = yRes.status === 'fulfilled' ? yRes.value : {}

  const out: Record<string, YQuote> = {}
  for (const s of uniq) {
    const tq = t[s]
    const yq = y[s]
    if (tq && yq) out[s] = mergeQuote(tq, yq)
    else if (tq) out[s] = { ...tq, _degraded: true }
    else if (yq) out[s] = yq
  }
  if (!Object.keys(out).length) throw new Error('all quote sources failed')
  return out
}

export type ChartRange = '1D' | '1M' | '6M' | '1Y' | '5Y'

export async function getChart(symbol: string, range: ChartRange): Promise<{ points: ChartPoint[]; source: string }> {
  const sym = symbol.toUpperCase()
  const code = tencentCode(sym)
  if (code) {
    try {
      if (range === '1D') {
        // 腾讯分钟线仅 A股可用
        if (/^(\d{6})\.(SS|SZ)$/i.test(sym)) {
          const pts = await tencentMinute(sym)
          if (pts.length < 2) throw new Error('insufficient minute points')
          return { points: pts, source: 'tencent-minute' }
        }
      } else {
        const cfg: Record<string, { freq: 'day' | 'week' | 'month'; count: number }> = {
          '1M': { freq: 'day', count: 25 },
          '6M': { freq: 'day', count: 130 },
          '1Y': { freq: 'day', count: 250 },
          '5Y': { freq: 'week', count: 260 },
        }
        const c = cfg[range]
        if (c) {
          const pts = await tencentKline(sym, c.freq, c.count)
          // 部分品种（如美股指数）仅返回1个点，视为不可用 → Yahoo 兜底
          if (pts.length < 10) throw new Error('insufficient kline points')
          return { points: pts, source: 'tencent-kline' }
        }
      }
    } catch {
      // 腾讯K线失败 → Yahoo 兜底
    }
  }
  const yMap: Record<ChartRange, { range: string; interval: string }> = {
    '1D': { range: '1d', interval: '5m' },
    '1M': { range: '1mo', interval: '1d' },
    '6M': { range: '6mo', interval: '1d' },
    '1Y': { range: '1y', interval: '1d' },
    '5Y': { range: '5y', interval: '1wk' },
  }
  const y = yMap[range]
  const ch = await yahooChart(sym, y.range, y.interval)
  return { points: ch.points, source: 'yahoo' }
}

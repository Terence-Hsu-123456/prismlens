// Yahoo Finance 补充数据源（日韩印欧市场、财务明细、新闻）
// A股/港股/美股主源已迁移至 tencent.ts，由 quotes.ts 统一路由
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
const Q1 = 'https://query1.finance.yahoo.com'
const Q2 = 'https://query2.finance.yahoo.com'

// ---------- cookie + crumb（v7/v10 接口需要） ----------
// 注意：getcrumb 接口限流很严（IP 级 "Too Many Requests"），
// 策略：① crumb 尽量长缓存；② 429 时退避重试；③ 拿不到 crumb 时降级用 chart meta（见 yahooQuotes/quoteSummary）
let crumbCache: { cookie: string; crumb: string; exp: number } | null = null
let crumbPromise: Promise<{ cookie: string; crumb: string }> | null = null
// 限流冷却：getcrumb 被限流后 5 分钟内不再请求，让 v7 快速失败 → chart meta 兑底接管
let crumbFailUntil = 0
const FALLBACK_COOKIE =
  'A3=d=AQABDGsidmUCEJjTPqNeoVUd3pGvVMk2DFsFEgEBAQGHCGx2ZgM2S2s2eM4&S=AQAB3gPZqOpnCCtB1rkFaNizCxb1Ccp2aQ'

async function fetchCrumbOnce(cookie: string, host: string): Promise<string> {
  const r = await fetch(`${host}/v1/test/getcrumb`, {
    headers: { 'User-Agent': UA, Cookie: cookie, Accept: '*/*', Referer: 'https://finance.yahoo.com/' },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  })
  const crumb = (await r.text()).trim()
  if (!crumb || crumb.length > 60 || /too many requests/i.test(crumb)) {
    throw new Error(`crumb fetch failed (HTTP ${r.status})`)
  }
  return crumb
}

async function getCrumb(): Promise<{ cookie: string; crumb: string }> {
  if (crumbCache && Date.now() < crumbCache.exp) return crumbCache
  if (Date.now() < crumbFailUntil) throw new Error('crumb cooling down')
  if (crumbPromise) return crumbPromise
  crumbPromise = (async () => {
    try {
      let cookie = ''
      try {
        const res = await fetch('https://fc.yahoo.com/??.1', {
          headers: { 'User-Agent': UA, Accept: 'text/html' },
          redirect: 'follow',
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        })
        const sc = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []
        cookie = sc.map((c) => c.split(';')[0]).join('; ')
      } catch {
        // fc.yahoo.com 404/超时是常态 → 用 fallback cookie
      }
      if (!cookie) cookie = FALLBACK_COOKIE

      // 主机轮换 + 退避重试（应对 IP 级限流）
      let lastErr: unknown
      for (const [host, delay] of [
        [Q1, 0],
        [Q2, 1500],
        [Q1, 4000],
      ] as const) {
        if (delay) await new Promise((r) => setTimeout(r, delay))
        try {
          const crumb = await fetchCrumbOnce(cookie, host)
          crumbCache = { cookie, crumb, exp: Date.now() + 90 * 60_000 }
          return crumbCache
        } catch (e) {
          lastErr = e
        }
      }
      crumbFailUntil = Date.now() + 5 * 60_000
      throw lastErr ?? new Error('crumb fetch failed')
    } finally {
      crumbPromise = null
    }
  })()
  return crumbPromise
}

// crumb 完全不可用时的降级：返回上次成功的结果（stale），否则 null
function staleCrumb(): { cookie: string; crumb: string } | null {
  return crumbCache // 可能已过期，但 crumb 实际长期有效，值得一试
}

// ---------- 基础请求 ----------
async function jget(url: string, headers: Record<string, string> = {}, retries = 1): Promise<any> {
  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json,text/*;q=0.9', ...headers },
        signal: AbortSignal.timeout(9000),
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      lastErr = e
      if (i < retries) await new Promise((r) => setTimeout(r, 400))
    }
  }
  throw lastErr
}

// ---------- 批量实时报价 ----------
export type YQuote = Record<string, any>

// v7 quote 接口依赖 crumb 认证，被限流/超时时整批失败；
// v8 chart 接口无需 crumb 且极稳定，其 meta 含实时价格 → 作为兜底报价源
async function quoteFromChart(symbol: string): Promise<YQuote | null> {
  try {
    const { meta } = await yahooChart(symbol, '1d', '5m')
    const price = meta?.regularMarketPrice
    if (typeof price !== 'number' || !isFinite(price)) return null
    const prev = typeof meta?.previousClose === 'number' ? meta.previousClose : meta?.chartPreviousClose ?? null
    const chg = typeof prev === 'number' && prev !== 0 ? ((price - prev) / prev) * 100 : null
    return {
      symbol,
      currency: meta?.currency ?? 'USD',
      shortName: meta?.shortName ?? meta?.longName ?? symbol,
      longName: meta?.longName ?? meta?.shortName ?? symbol,
      fullExchangeName: meta?.fullExchangeName ?? meta?.exchangeName ?? '',
      exchangeName: meta?.exchangeName ?? '',
      regularMarketPrice: price,
      regularMarketChange: typeof prev === 'number' ? price - prev : null,
      regularMarketChangePercent: chg,
      regularMarketPreviousClose: prev,
      regularMarketDayHigh: meta?.regularMarketDayHigh ?? null,
      regularMarketDayLow: meta?.regularMarketDayLow ?? null,
      regularMarketVolume: meta?.regularMarketVolume ?? null,
      fiftyTwoWeekHigh: meta?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: meta?.fiftyTwoWeekLow ?? null,
      regularMarketTime: typeof meta?.regularMarketTime === 'number' ? meta.regularMarketTime * 1000 : null,
      _quoteSource: 'yahoo-chart-meta',
    }
  } catch {
    return null
  }
}

export async function yahooQuotes(symbols: string[]): Promise<Record<string, YQuote>> {
  const uniq = Array.from(new Set(symbols.filter(Boolean)))
  if (!uniq.length) return {}
  const out: Record<string, YQuote> = {}

  // 1) v7 批量报价（快，覆盖字段全；依赖 crumb，可能被限流）
  // 总预算 9s：超时/失败都不致命 → chart meta 兑底接管
  try {
    const v7 = (async () => {
      const chunks: string[][] = []
      for (let i = 0; i < uniq.length; i += 22) chunks.push(uniq.slice(i, i + 22))
      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const { cookie, crumb } = await getCrumb()
          const url = `${Q1}/v7/finance/quote?symbols=${encodeURIComponent(chunk.join(','))}&crumb=${encodeURIComponent(crumb)}`
          const data = await jget(url, { Cookie: cookie })
          return (data?.quoteResponse?.result ?? []) as YQuote[]
        })
      )
      const map: Record<string, YQuote> = {}
      for (const arr of results) for (const q of arr) if (q?.symbol) map[q.symbol.toUpperCase()] = q
      return map
    })()
    const timed = await Promise.race([
      v7,
      new Promise<null>((r) => setTimeout(() => r(null), 9000)),
    ])
    if (timed) Object.assign(out, timed)
  } catch {
    // v7 失败不致命 → 走 chart meta 兑底
  }

  // 2) 缺失的标的用 chart meta 逐个补齐（限并发，防止限流）
  const missing = uniq.filter((s) => !out[s.toUpperCase()])
  if (missing.length) {
    const CONC = 6
    for (let i = 0; i < missing.length; i += CONC) {
      const batch = missing.slice(i, i + CONC)
      const got = await Promise.all(batch.map((s) => quoteFromChart(s)))
      for (let j = 0; j < batch.length; j++) {
        const q = got[j]
        if (q) out[batch[j].toUpperCase()] = q
      }
    }
  }

  if (!Object.keys(out).length) throw new Error('quote response empty')
  return out
}

// ---------- K 线 ----------
export type ChartPoint = { t: number; close: number }

export async function yahooChart(symbol: string, range = '1y', interval = '1d') {
  const url = `${Q1}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false&events=div%2Csplit`
  const data = await jget(url)
  const r = data?.chart?.result?.[0]
  if (!r) throw new Error('no chart data')
  const ts: number[] = r.timestamp ?? []
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? []
  const points: ChartPoint[] = []
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i]
    if (typeof c === 'number' && isFinite(c)) points.push({ t: ts[i] * 1000, close: c })
  }
  return { meta: r.meta ?? {}, points }
}

// ---------- 搜索 ----------
export async function yahooSearch(q: string, lang = 'en', region = 'US') {
  const url = `${Q2}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&lang=${lang}&region=${region}`
  const data = await jget(url)
  return ((data?.quotes ?? []) as any[]).filter((x) => x?.symbol)
}

// ---------- 新闻 ----------
// 注意：实测该接口携带 lang/region 参数时会返回空新闻，因此不传
export async function yahooNews(q: string) {
  const url = `${Q2}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=0&newsCount=8`
  const data = await jget(url)
  return (data?.news ?? []) as any[]
}

// ---------- 公司档案/财报摘要 ----------
// 财报是季报级慢变量：长缓存（2h）+ 失败时返回上次成功结果（stale-while-error），
// 避免 crumb 限流导致详情页财务区块全空
const summCache = new Map<string, { data: any; exp: number }>()
const summLastGood = new Map<string, any>()

export async function yahooQuoteSummary(symbol: string, modules: string) {
  const key = `${symbol}:${modules}`
  const hit = summCache.get(key)
  if (hit && Date.now() < hit.exp) return hit.data

  // crumb 获取降级链：新 crumb → stale crumb → 失败（走 lastGood）
  let auth: { cookie: string; crumb: string } | null = null
  try {
    auth = await getCrumb()
  } catch {
    auth = staleCrumb()
  }
  if (auth) {
    try {
      const url = `${Q1}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(auth.crumb)}`
      const data = await jget(url, { Cookie: auth.cookie })
      summCache.set(key, { data, exp: Date.now() + 2 * 3600_000 })
      summLastGood.set(key, data)
      return data
    } catch {
      // fallthrough → lastGood
    }
  }
  const last = summLastGood.get(key)
  if (last) return last
  throw new Error('quoteSummary unavailable')
}

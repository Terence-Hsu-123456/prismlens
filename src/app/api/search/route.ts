// 真实公司搜索：Yahoo 全库搜索 + 精选公司池兜底
import { NextRequest, NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { yahooSearch, yahooQuotes } from '@/lib/yahoo'
import { UNIVERSE, UNIVERSE_BY_SYMBOL, DEFAULT_SYMBOLS, MARKET_CURRENCY, MARKETS } from '@/lib/universe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Hit = {
  symbol: string
  name: string
  exchange: string
  market: string | null
  flag: string
  price: number | null
  changePercent: number | null
  currency: string | null
}

function flagOf(market: string | null, country?: string | null): string {
  if (country) {
    const m = MARKETS.find((x) => x.key === country)
    if (m) return m.flag
  }
  return MARKETS.find((m) => m.key === market)?.flag ?? '🌐'
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  const langRaw = req.nextUrl.searchParams.get('lang') ?? 'zh-CN'
  const lang = ['zh-CN', 'en-US', 'ja-JP'].includes(langRaw) ? langRaw : 'zh-CN'

  try {
    if (!q) {
      // 热门推荐（带实时价）
      const data = await cached(`search:default:${lang}`, 120_000, async () => {
        let quotes: Record<string, any> = {}
        try {
          quotes = await yahooQuotes(DEFAULT_SYMBOLS)
        } catch {
          quotes = {}
        }
        return DEFAULT_SYMBOLS.map((s) => {
          const u = UNIVERSE_BY_SYMBOL[s]
          const qq = quotes[s]
          return {
            symbol: s,
            name: u ? (lang === 'zh-CN' ? u.n.zh : lang === 'ja-JP' ? u.n.ja ?? u.n.en : u.n.en) : qq?.shortName ?? s,
            exchange: qq?.fullExchangeName ?? '',
            market: u?.mkt ?? null,
            flag: flagOf(u?.mkt ?? null, u?.ctry),
            price: qq?.regularMarketPrice ?? null,
            changePercent: qq?.regularMarketChangePercent ?? null,
            currency: qq?.currency ?? (u ? MARKET_CURRENCY[u.mkt] : null),
          }
        })
      })
      return NextResponse.json({ hits: data, asOf: Date.now() }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const ql = q.toLowerCase()
    const data = await cached(`search:${q}:${lang}`, 300_000, async () => {
      const yl = lang === 'zh-CN' ? 'zh-Hans' : lang === 'ja-JP' ? 'ja' : 'en'
      const region = /[\u4e00-\u9fff]/.test(q) ? 'CN' : /[\u3040-\u30ff]/.test(q) ? 'JP' : 'US'

      // Yahoo 全库搜索（覆盖所有真实上市公司，包括未收录池的）
      let yhits: any[] = []
      try {
        yhits = await yahooSearch(q, yl, region)
      } catch {
        yhits = []
      }

      // 精选池匹配（保证知名公司一定搜得到）
      const umatches = UNIVERSE.filter((u) => {
        const hay = `${u.s} ${u.n.zh} ${u.n.en} ${u.n.ja ?? ''} ${u.tags.join(' ')}`.toLowerCase()
        return hay.includes(ql)
      })

      const seen = new Set<string>()
      const hits: Hit[] = []

      for (const y of yhits) {
        if (!y?.symbol || seen.has(y.symbol)) continue
        const type = String(y.quoteType ?? '').toUpperCase()
        if (type && !['EQUITY', 'ETF', 'INDEX'].includes(type)) continue
        seen.add(y.symbol)
        const u = UNIVERSE_BY_SYMBOL[y.symbol]
        hits.push({
          symbol: y.symbol,
          name: y.longname || y.shortname || y.symbol,
          exchange: y.exchDisp || y.exchange || '',
          market: u?.mkt ?? null,
          flag: flagOf(u?.mkt ?? null, u?.ctry),
          price: null,
          changePercent: null,
          currency: null,
        })
      }
      for (const u of umatches) {
        if (seen.has(u.s)) continue
        seen.add(u.s)
        hits.push({
          symbol: u.s,
          name: lang === 'zh-CN' ? u.n.zh : lang === 'ja-JP' ? u.n.ja ?? u.n.en : u.n.en,
          exchange: u.mkt,
          market: u.mkt,
          flag: flagOf(u.mkt, u.ctry),
          price: null,
          changePercent: null,
          currency: null,
        })
      }

      // 为命中的标的补实时价
      const wantQuotes = hits.slice(0, 8).map((h) => h.symbol)
      if (wantQuotes.length) {
        try {
          const quotes = await yahooQuotes(wantQuotes)
          for (const h of hits) {
            const qq = quotes[h.symbol]
            if (qq) {
              h.price = typeof qq.regularMarketPrice === 'number' ? qq.regularMarketPrice : null
              h.changePercent = typeof qq.regularMarketChangePercent === 'number' ? qq.regularMarketChangePercent : null
              h.currency = qq.currency ?? null
            }
          }
        } catch {
          /* 价格获取失败不阻塞搜索 */
        }
      }
      return hits.slice(0, 12)
    })

    return NextResponse.json({ hits: data, asOf: Date.now() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'search failed', hits: [] }, { status: 502 })
  }
}

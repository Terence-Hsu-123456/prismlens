// 个股详情：真实报价（腾讯主源）+ 财报摘要 + 真实新闻
import { NextRequest, NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getQuotes } from '@/lib/quotes'
import { yahooQuoteSummary, yahooNews } from '@/lib/yahoo'
import { UNIVERSE_BY_SYMBOL } from '@/lib/universe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// quoteSummary 的数值字段是 {raw, fmt} 包装，需要解包
const rv = (v: any) => (v && typeof v === 'object' && 'raw' in v ? v.raw : v)

const pick = (o: any, keys: string[]) => {
  const out: Record<string, any> = {}
  if (!o) return out
  for (const k of keys) out[k] = rv(o[k] ?? null)
  return out
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const sym = decodeURIComponent(symbol).toUpperCase()
  const langRaw = req.nextUrl.searchParams.get('lang') ?? 'zh-CN'
  const lang = ['zh-CN', 'en-US', 'ja-JP'].includes(langRaw) ? langRaw : 'zh-CN'
  const u = UNIVERSE_BY_SYMBOL[sym]

  try {
    const data = await cached(`stock:${sym}:${lang}`, 300_000, async () => {
      // 注意：Yahoo 新闻接口实测携带 lang/region 参数时返回空，故不传
      const [quoteRes, summRes, newsRes] = await Promise.allSettled([
        getQuotes([sym]),
        yahooQuoteSummary(
          sym,
          'assetProfile,summaryProfile,financialData,defaultKeyStatistics,summaryDetail,price,recommendationTrend,incomeStatementHistory'
        ),
        yahooNews(sym),
      ])

      if (quoteRes.status !== 'fulfilled' && summRes.status !== 'fulfilled') {
        throw new Error('STOCK_DATA_UNAVAILABLE')
      }

      const q = quoteRes.status === 'fulfilled' ? quoteRes.value[sym] : null
      const summ = summRes.status === 'fulfilled' ? (summRes.value?.quoteSummary?.result?.[0] ?? null) : null

      const quote = pick(q ?? summ?.price ?? {}, [
        'symbol', 'shortName', 'longName', 'currency', 'exchangeName', 'fullExchangeName',
        'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent', 'regularMarketTime',
        'marketCap', 'trailingPE', 'forwardPE', 'priceToBook', 'trailingAnnualDividendYield', 'dividendYield',
        'fiftyDayAverage', 'twoHundredDayAverage', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
        'epsTrailingTwelveMonths', 'bookValue', 'regularMarketVolume', 'averageDailyVolume3Month',
      ])
      if (!quote.symbol) quote.symbol = sym

      const fin = summ?.financialData ?? null
      const ke = summ?.defaultKeyStatistics ?? null
      const sd = summ?.summaryDetail ?? null
      const prof = summ?.assetProfile ?? summ?.summaryProfile ?? null

      const financials = fin
        ? pick(fin, [
            'totalRevenue', 'netIncomeToCommon', 'grossMargins', 'operatingMargins', 'profitMargins',
            'returnOnEquity', 'debtToEquity', 'freeCashflow', 'revenueGrowth', 'earningsGrowth',
            'targetMeanPrice', 'recommendationKey', 'numberOfAnalystOpinions', 'financialCurrency',
          ])
        : null

      const keyStats = ke ? pick(ke, ['trailingEps', 'pegRatio', 'beta', 'priceToBook', 'sharesOutstanding']) : null
      const summaryDetail = sd ? pick(sd, ['dividendYield', 'payoutRatio', 'fiveYearAvgDividendYield']) : null
      const profile = prof ? pick(prof, ['sector', 'industry', 'country', 'website', 'longBusinessSummary']) : null

      const recTrend = summ?.recommendationTrend?.trend ?? null
      const incomeHistory = (summ?.incomeStatementHistory?.incomeStatementHistory ?? [])
        .slice(0, 5)
        .map((x: any) => {
          const endDate = rv(x?.endDate)
          return {
            year: endDate ? new Date(endDate * 1000).getUTCFullYear() : null,
            revenue: rv(x?.totalRevenue) ?? null,
            netIncome: rv(x?.netIncome) ?? null,
          }
        })
        .filter((x: any) => x.revenue != null)

      const news = newsRes.status === 'fulfilled'
        ? ((newsRes.value ?? []) as any[])
            .slice(0, 8)
            .map((n) => ({
              title: n?.title ?? '',
              publisher: n?.publisher ?? '',
              link: n?.link ?? '#',
              time: n?.providerPublishTime ? n.providerPublishTime * 1000 : null,
            }))
            .filter((n) => n.title)
        : []

      return {
        symbol: sym,
        universe: u
          ? {
              market: u.mkt,
              country: u.ctry,
              sector: u.sec,
              stage: u.stage,
              tags: u.tags,
              nameZh: u.n.zh,
              nameEn: u.n.en,
              nameJa: u.n.ja ?? u.n.en,
            }
          : null,
        quote,
        financials,
        keyStats,
        summaryDetail,
        profile,
        recommendationTrend: recTrend,
        incomeHistory,
        news,
        asOf: Date.now(),
      }
    })

    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'stock load failed' }, { status: 502 })
  }
}

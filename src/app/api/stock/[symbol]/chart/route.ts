// 个股 K 线（真实历史行情：腾讯主源 + Yahoo 兜底）
import { NextRequest, NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getChart, type ChartRange } from '@/lib/quotes'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TTL: Record<ChartRange, number> = {
  '1D': 60_000,
  '1M': 300_000,
  '6M': 300_000,
  '1Y': 300_000,
  '5Y': 600_000,
}

// K线元信息（币种按市场推断，供前端展示）
function currencyOf(sym: string): string {
  if (/\.SS$|\.SZ$/.test(sym)) return 'CNY'
  if (/\.HK$/.test(sym)) return 'HKD'
  if (/\.T$/.test(sym)) return 'JPY'
  if (/\.KS$/.test(sym)) return 'KRW'
  if (/\.NS$/.test(sym)) return 'INR'
  if (/\.DE$|\.PA$/.test(sym)) return 'EUR'
  if (/\.SW$/.test(sym)) return 'CHF'
  if (/\.L$/.test(sym)) return 'GBP'
  if (/\.CO$/.test(sym)) return 'DKK'
  return 'USD'
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const sym = decodeURIComponent(symbol).toUpperCase()
  const rangeKey = (req.nextUrl.searchParams.get('range') ?? '1Y').toUpperCase() as ChartRange
  const range: ChartRange = (['1D', '1M', '6M', '1Y', '5Y'] as ChartRange[]).includes(rangeKey) ? rangeKey : '1Y'

  try {
    const data = await cached(`chart:v2:${sym}:${range}`, TTL[range], async () => {
      const ch = await getChart(sym, range)
      return {
        symbol: sym,
        range,
        source: ch.source,
        meta: { currency: currencyOf(sym), previousClose: ch.points[0]?.close ?? null },
        points: ch.points,
        asOf: Date.now(),
      }
    })
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'chart load failed', points: [] }, { status: 502 })
  }
}

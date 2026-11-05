// 全球市场总览：核心指数 + 宏观脉搏（真实数据，腾讯主源 + Yahoo 补充）
import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getQuotes, getChart } from '@/lib/quotes'
import { INDICES, PULSE } from '@/lib/universe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function loadMarkets() {
  const quotes = await getQuotes([...INDICES.map((i) => i.s), ...PULSE.map((p) => p.s)]).catch(() => ({} as Record<string, any>))

  const indices = await Promise.all(
    INDICES.map(async (def) => {
      const q = quotes[def.s]
      let spark: number[] = []
      try {
        const ch = await cached(`spark:${def.s}`, 10 * 60_000, () => getChart(def.s, '6M'))
        spark = ch.points.map((p) => Math.round(p.close * 100) / 100)
      } catch {
        spark = []
      }
      return {
        symbol: def.s,
        key: def.key,
        group: def.group,
        currency: def.cur,
        tz: def.tz,
        price: typeof q?.regularMarketPrice === 'number' ? q.regularMarketPrice : null,
        changePercent: typeof q?.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : null,
        spark,
      }
    })
  )

  const pulse = PULSE.map((p) => {
    const q = quotes[p.s]
    return {
      symbol: p.s,
      key: p.key,
      kind: p.kind,
      price: typeof q?.regularMarketPrice === 'number' ? q.regularMarketPrice : null,
      changePercent: typeof q?.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : null,
    }
  })

  return {
    indices,
    pulse,
    asOf: Date.now(),
    ok: Object.keys(quotes).length > 0,
    partial: Object.keys(quotes).length < INDICES.length + PULSE.length,
  }
}

export async function GET() {
  try {
    const data = await cached('markets:v2', 60_000, loadMarkets)
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'markets load failed' }, { status: 502 })
  }
}

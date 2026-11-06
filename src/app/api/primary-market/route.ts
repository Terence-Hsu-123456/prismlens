// 一级市场融资轮次（天使轮/VC/PE）：种子播种 + AI 资讯抓取动态入库（primary-sync），
// 新融资事件随同步自动进入面板
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensurePrimarySeed, ensurePrimarySync } from '@/lib/primary-sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    await ensurePrimarySeed()
    // AI 融资资讯同步（TTL 12h，fire-and-forget 不阻塞响应）
    // Vercel 只读快照部署：AI 抓取依赖 Z.ai 平台 SDK，部署环境跳过，直接读打包数据
    if (!process.env.VERCEL) void ensurePrimarySync()

    const sp = req.nextUrl.searchParams
    const limit = Math.min(Math.max(parseInt(sp.get('limit') ?? '1000', 10) || 1000, 20), 2000)

    const [rows, total, sumAgg, valRows, byStage, byMarket, aiCount, latestRow] = await Promise.all([
      db.fundingRound.findMany({ orderBy: [{ date: 'desc' }, { amountUsd: 'desc' }], take: limit }),
      db.fundingRound.count(),
      db.fundingRound.aggregate({ _sum: { amountUsd: true } }),
      db.fundingRound.findMany({ where: { valuationUsd: { not: null } }, select: { valuationUsd: true }, orderBy: { valuationUsd: 'asc' } }),
      db.fundingRound.groupBy({ by: ['stage'], _count: true }),
      db.fundingRound.groupBy({ by: ['market'], _count: true }),
      db.fundingRound.count({ where: { source: 'ai' } }),
      db.fundingRound.findFirst({ orderBy: [{ date: 'desc' }, { amountUsd: 'desc' }], select: { date: true } }),
    ])

    const rounds = rows.map((r) => {
      let tags: string[] = []
      try {
        tags = JSON.parse(r.tags) as string[]
      } catch {
        tags = []
      }
      return { ...r, tags }
    })
    const vals = valRows.map((r) => r.valuationUsd).filter((v): v is number => v != null)
    const median = vals.length ? vals[Math.floor(vals.length / 2)] : null

    return NextResponse.json(
      {
        rounds,
        stats: {
          companies: total,
          totalAmount: sumAgg._sum.amountUsd ?? 0,
          medianValuation: median,
          latest: latestRow?.date ?? '',
          aiCount,
          byStage: Object.fromEntries(byStage.map((g) => [g.stage, g._count])),
          byMarket: Object.fromEntries(byMarket.map((g) => [g.market, g._count])),
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'primary market failed' }, { status: 502 })
  }
}

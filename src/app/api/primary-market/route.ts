// 一级市场融资轮次（天使轮/VC/PE）：首次访问自动播种公开报道整理数据，
// 之后动态返回（新轮次入库后立即展示）
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { FUNDING_SEED } from '@/lib/primary-seed'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function ensureSeed(): Promise<void> {
  const n = await db.fundingRound.count()
  if (n > 0) return
  await db.fundingRound.createMany({
    data: FUNDING_SEED.map((f) => ({
      company: f.company,
      companyEn: f.companyEn,
      market: f.market,
      sector: f.sector,
      stage: f.stage,
      roundLabel: f.roundLabel,
      date: f.date,
      amountUsd: f.amountUsd,
      valuationUsd: f.valuationUsd,
      leadInvestors: f.leadInvestors,
      desc: f.desc,
      tags: JSON.stringify(f.tags),
    })),
  })
}

export async function GET(_req: NextRequest) {
  try {
    await ensureSeed()
    const rows = await db.fundingRound.findMany({ orderBy: [{ date: 'desc' }, { amountUsd: 'desc' }] })
    const rounds = rows.map((r) => {
      let tags: string[] = []
      try {
        tags = JSON.parse(r.tags) as string[]
      } catch {
        tags = []
      }
      return { ...r, tags }
    })
    const amounts = rounds.map((r) => r.amountUsd).filter((v): v is number => v != null)
    const vals = rounds.map((r) => r.valuationUsd).filter((v): v is number => v != null)
    const median = (arr: number[]) => {
      if (!arr.length) return null
      const s = [...arr].sort((a, b) => a - b)
      return s[Math.floor(s.length / 2)]
    }
    return NextResponse.json(
      {
        rounds,
        stats: {
          companies: rounds.length,
          totalAmount: amounts.reduce((a, b) => a + b, 0),
          medianValuation: median(vals),
          latest: rounds[0]?.date ?? '',
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'primary market failed' }, { status: 502 })
  }
}

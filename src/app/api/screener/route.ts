// 智能筛股：定量 + 定性条件过滤真实公司池
import { NextRequest, NextResponse } from 'next/server'
import { loadUniverseRows, applyFilters } from '@/lib/screener'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const numOrNull = (k: string) => {
    const v = sp.get(k)
    return v == null || v === '' ? null : Number(v)
  }
  try {
    const { rows, asOf, degraded } = await loadUniverseRows()
    const filtered = applyFilters(rows, {
      market: sp.get('market') ?? 'ALL',
      sector: sp.get('sector') ?? 'ALL',
      stage: sp.get('stage') ?? 'ALL',
      capMinUSD: numOrNull('cap'),
      peMax: numOrNull('peMax'),
      pbMax: numOrNull('pbMax'),
      divMin: numOrNull('divMin'),
      roeMin: numOrNull('roeMin'),
      pmMin: numOrNull('pmMin'),
      revMin: numOrNull('revMin'),
      kw: sp.get('kw') ?? '',
    }).slice(0, 60)

    return NextResponse.json(
      { rows: filtered, total: filtered.length, universeSize: rows.length, asOf, degraded },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'screener failed', rows: [] }, { status: 502 })
  }
}

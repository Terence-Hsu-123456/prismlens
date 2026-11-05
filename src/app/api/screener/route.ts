// 智能筛股：全市场公司池（DB 动态同步）+ 定量/定性过滤 + 分页
import { NextRequest, NextResponse } from 'next/server'
import { queryScreener } from '@/lib/screener'
import { ensureScreenSync } from '@/lib/screen-sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const numOrNull = (k: string) => {
    const v = sp.get(k)
    return v == null || v === '' ? null : Number(v)
  }
  const limit = Math.min(Math.max(parseInt(sp.get('limit') ?? '50', 10) || 50, 1), 100)
  const offset = Math.max(parseInt(sp.get('offset') ?? '0', 10) || 0, 0)
  try {
    // TTL 到期自动后台刷新（新股入库/退市清理），不阻塞响应
    // Vercel 上数据层为只读 SQLite 快照，跳过写库型同步
    if (!process.env.VERCEL) void ensureScreenSync()
    const result = await queryScreener(
      {
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
      },
      limit,
      offset
    )
    // 公司池尚未就绪（首次启动同步中）
    const empty = result.universeSize === 0
    return NextResponse.json(
      { ...result, syncing: empty },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'screener failed', rows: [] }, { status: 502 })
  }
}

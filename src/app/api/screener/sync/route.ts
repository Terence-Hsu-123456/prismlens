// 手动/外部触发同步：GET 查看状态，POST 强制全量同步（新股入库、退市清理、行情刷新）
import { NextResponse } from 'next/server'
import { getScreenStatus, syncAll } from '@/lib/screen-sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    return NextResponse.json(await getScreenStatus(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'status failed' }, { status: 500 })
  }
}

export async function POST() {
  // 只读部署（Vercel）：数据层为构建期快照，写入会失败，明确拒绝而不是返回 502
  if (process.env.VERCEL) {
    return NextResponse.json(
      { ok: false, error: 'read-only deployment: full sync disabled' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  try {
    const r = await syncAll(true)
    return NextResponse.json(r, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'sync failed' }, { status: 502 })
  }
}

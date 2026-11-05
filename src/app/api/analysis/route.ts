// AI 三层投研分析：真实数据 + LLM
import { NextRequest, NextResponse } from 'next/server'
import { getAnalysis } from '@/lib/analysis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const symbol = String(body?.symbol ?? '').trim()
    const langRaw = body?.lang ?? 'zh-CN'
    const lang: 'zh-CN' | 'en-US' | 'ja-JP' = ['zh-CN', 'en-US', 'ja-JP'].includes(langRaw) ? langRaw : 'zh-CN'
    const force = !!body?.force
    if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

    const result = await getAnalysis(symbol, lang, force)
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'analysis failed' }, { status: 502 })
  }
}

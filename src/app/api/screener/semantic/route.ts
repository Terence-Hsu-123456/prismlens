// AI 语义筛股：自然语言 → 结构化筛选条件 → 真实数据过滤
import { NextRequest, NextResponse } from 'next/server'
import { loadUniverseRows, applyFilters, type ScreenRow } from '@/lib/screener'
import { aiJson } from '@/lib/analysis'
import { langName, type Lang } from '@/lib/i18n'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const q = String(body?.q ?? '').trim()
    const langRaw = body?.lang ?? 'zh-CN'
    const lang: Lang = ['zh-CN', 'en-US', 'ja-JP'].includes(langRaw) ? langRaw : 'zh-CN'
    if (!q) return NextResponse.json({ error: 'empty query' }, { status: 400 })

    const system = `You convert an investor's natural-language request into STRICT JSON screening criteria. Output raw JSON only, no markdown, with this schema:
{
  "market": "ALL" | "US" | "CN" | "HK" | "JP" | "KR" | "IN" | "EU",
  "sectors": string[],   // subset of: tech, consumer, finance, health, energy, industrial, materials, utility, comm, realestate
  "stage": "ALL" | "startup" | "growth" | "mature" | "turnaround",
  "capMinUSD": number | null,
  "peMax": number | null,
  "pbMax": number | null,
  "divMin": number | null,
  "roeMin": number | null,   // percent, e.g. 15 means ROE >= 15%
  "pmMin": number | null,   // net profit margin percent
  "revMin": number | null,  // revenue growth percent
  "keywords": string[],  // qualitative keywords to match company descriptions; use the user's language + useful synonyms
  "note": string         // 1-2 sentences explaining your interpretation, written in ${langName(lang)}
}
Rules: if the user does not specify something, use "ALL" / null. Keywords should be short phrases (e.g. "白酒", "AI", "高股息"). capMinUSD uses USD approximations. Examples: "高ROE" → roeMin 15; "低估便宜" → peMax 20, pbMax 3; "高分红" → divMin 3. Output raw JSON only.`

    const criteria = await aiJson(system, `User request: ${q}`)

    const { rows, asOf, degraded } = await loadUniverseRows()
    const sectors = Array.isArray(criteria.sectors) ? criteria.sectors : []
    const nn = (v: any) => (typeof v === 'number' && isFinite(v) ? v : null)
    const f = {
      market: criteria.market ?? 'ALL',
      sector: sectors.length === 1 ? sectors[0] : 'ALL',
      stage: criteria.stage ?? 'ALL',
      capMinUSD: nn(criteria.capMinUSD),
      peMax: nn(criteria.peMax),
      pbMax: nn(criteria.pbMax),
      divMin: nn(criteria.divMin),
      roeMin: nn(criteria.roeMin),
      pmMin: nn(criteria.pmMin),
      revMin: nn(criteria.revMin),
      kw: '',
    }

    const keywords: string[] = Array.isArray(criteria.keywords)
      ? criteria.keywords.map((k: any) => String(k).toLowerCase()).filter(Boolean)
      : []

    let finalRows: ScreenRow[] = []
    let relaxSteps: string[] = []
    // 渐进放宽：财务指标 → 关键词 → 市值，避免过严条件导致 0 结果
    const tryRows = (finOn: boolean, kwOn: boolean, capOn: boolean) => {
      let candidate = applyFilters(rows, {
        ...f,
        peMax: finOn ? f.peMax : null,
        pbMax: finOn ? f.pbMax : null,
        divMin: finOn ? f.divMin : null,
        roeMin: finOn ? f.roeMin : null,
        pmMin: finOn ? f.pmMin : null,
        revMin: finOn ? f.revMin : null,
        capMinUSD: capOn ? f.capMinUSD : null,
      })
      if (kwOn && keywords.length && candidate.length) {
        const kwHits = candidate.filter((r) => {
          const hay = `${r.nameZh} ${r.nameEn} ${r.nameJa} ${r.tags.join(' ')} ${r.sector} ${r.symbol}`.toLowerCase()
          return keywords.some((k) => hay.includes(k))
        })
        if (kwHits.length > 0) candidate = kwHits
      }
      return candidate
    }

    // 1) 全条件
    finalRows = tryRows(true, true, true)
    // 2) 放宽财务指标（保留市场/行业/阶段——语义核心）
    if (finalRows.length < 3) {
      finalRows = tryRows(false, true, true)
      if (finalRows.length >= 3) relaxSteps.push('financials')
    }
    if (finalRows.length < 3) {
      finalRows = tryRows(false, false, true)
      if (finalRows.length >= 3) relaxSteps.push('keywords')
    }
    // 3) 只保留市场 + 行业 + 阶段
    if (finalRows.length < 3) {
      finalRows = applyFilters(rows, { market: f.market, sector: f.sector, stage: f.stage })
      if (finalRows.length >= 3) relaxSteps.push('capMinUSD')
    }

    const relaxed = relaxSteps.length > 0
    finalRows = finalRows.slice(0, 60)
    return NextResponse.json(
      { criteria, note: criteria.note ?? '', relaxed, rows: finalRows, total: finalRows.length, asOf, degraded },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'semantic screen failed' }, { status: 502 })
  }
}

// AI 语义筛股：自然语言 → 结构化筛选条件 → 全市场公司池（DB）过滤
import { NextRequest, NextResponse } from 'next/server'
import { queryRows, applyFilters, type ScreenRow } from '@/lib/screener'
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
  "market": "ALL" | "US" | "CN" | "HK" | "JP" | "KR" | "IN" | "EU" | "AP" | "AM" | "MEA",
  "sectors": string[],   // subset of: tech, consumer, finance, health, energy, industrial, materials, utility, comm, realestate
  "stage": "ALL" | "startup" | "growth" | "mature" | "turnaround",
  "capMinUSD": number | null,
  "peMax": number | null,
  "pbMax": number | null,
  "divMin": number | null,
  "roeMin": number | null,   // percent, e.g. 15 means ROE >= 15%
  "pmMin": number | null,   // net profit margin percent
  "revMin": number | null,  // revenue growth percent
  "keywords": string[],  // qualitative keywords to match company names/industry/notes; use the user's language + useful synonyms
  "note": string         // 1-2 sentences explaining your interpretation, written in ${langName(lang)}
}
Market notes: US=United States, CN=China A-shares, HK=Hong Kong, JP=Japan, KR=South Korea, IN=India, EU=Europe, AP=other Asia-Pacific (Taiwan/Singapore/Australia/SE Asia), AM=other Americas (Canada/Brazil/Mexico/Chile), MEA=Middle East & Africa (Israel/Qatar/UAE).
Rules: if the user does not specify something, use "ALL" / null. Keywords should be short phrases (e.g. "白酒", "AI", "高股息", "白酒", "半导体设备"). capMinUSD uses USD approximations. Examples: "高ROE" → roeMin 15; "低估便宜" → peMax 20, pbMax 3; "高分红" → divMin 3. Output raw JSON only.`

    const criteria = await aiJson(system, `User request: ${q}`)

    const sectors = Array.isArray(criteria.sectors) ? criteria.sectors : []
    const nn = (v: any) => (typeof v === 'number' && isFinite(v) ? v : null)
    const base = {
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
    }

    // 候选集：市场/行业/阶段在 DB 层过滤；数值条件与关键词在内存层做放宽循环
    const candidates = await queryRows(
      { market: base.market, sector: base.sector, stage: base.stage, capMinUSD: base.capMinUSD },
      4000
    )

    const keywords: string[] = Array.isArray(criteria.keywords)
      ? criteria.keywords.map((k: any) => String(k).toLowerCase()).filter(Boolean)
      : []

    let finalRows: ScreenRow[] = []
    const relaxSteps: string[] = []
    const tryRows = (finOn: boolean, kwOn: boolean) => {
      let candidate = applyFilters(candidates, {
        ...base,
        capMinUSD: null, // cap 已在 DB 层生效
        peMax: finOn ? base.peMax : null,
        pbMax: finOn ? base.pbMax : null,
        divMin: finOn ? base.divMin : null,
        roeMin: finOn ? base.roeMin : null,
        pmMin: finOn ? base.pmMin : null,
        revMin: finOn ? base.revMin : null,
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
    finalRows = tryRows(true, true)
    // 2) 放宽财务指标（保留市场/行业/阶段——语义核心）
    if (finalRows.length < 3) {
      finalRows = tryRows(false, true)
      if (finalRows.length >= 3) relaxSteps.push('financials')
    }
    if (finalRows.length < 3) {
      finalRows = tryRows(false, false)
      if (finalRows.length >= 3) relaxSteps.push('keywords')
    }

    const relaxed = relaxSteps.length > 0
    finalRows = finalRows.slice(0, 100)
    return NextResponse.json(
      { criteria, note: criteria.note ?? '', relaxed, rows: finalRows, total: finalRows.length, asOf: Date.now(), degraded: false },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'semantic screen failed' }, { status: 502 })
  }
}

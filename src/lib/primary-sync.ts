// 一级市场动态同步引擎：
// - 种子播种：公开报道整理（primary-seed）首次入库
// - AI 抓取：融资类新闻 RSS（Google News 中/英/日/韩多语言查询）→ LLM 结构化抽取 → 校验去重 → 入库（source=ai）
// - TTL 12h：新融资事件自动进入一级市场面板 —— 动态化
import { db } from '@/lib/db'
import { FUNDING_SEED } from './primary-seed'
import { aiJson } from './analysis'

const SYNC_TTL = 12 * 3600_000
const STATE_KEY = 'pm:lastSync'

let running: Promise<{ ok: boolean; added: number; error?: string }> | null = null

// ---------- RSS 抓取 ----------

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

type FeedDef = { id: string; url: string }

const gnews = (q: string, hl: string, gl: string, ceid: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${ceid}`

// 融资专题 Feed：多语言 × 多轮次关键词（近 10 天）
export const FUNDING_FEEDS: FeedDef[] = [
  { id: 'g-en-series', url: gnews('"raises" "Series" funding valuation when:10d', 'en-US', 'US', 'US:en') },
  { id: 'g-en-seed', url: gnews('startup "seed round" OR "Series A" raises million when:10d', 'en-US', 'US', 'US:en') },
  { id: 'g-en-vc', url: gnews('venture capital funding round raises led by when:10d', 'en-US', 'US', 'US:en') },
  { id: 'g-zh-rongzi', url: gnews('完成 融资 轮 估值 亿元 when:10d', 'zh-CN', 'CN', 'CN:zh-Hans') },
  { id: 'g-zh-angel', url: gnews('天使轮 OR Pre-A OR 战略融资 when:10d', 'zh-CN', 'CN', 'CN:zh-Hans') },
  { id: 'g-ja-shikin', url: gnews('資金調達 シリーズ ラウンド when:10d', 'ja', 'JP', 'JP:ja') },
  { id: 'g-ko-tuja', url: gnews('투자 유치 시리즈 라운드 when:10d', 'ko', 'KR', 'KR:ko') },
]

// 标题中的融资信号（粗筛，降低 LLM 无效输入）
const FUNDING_RE =
  /raises?|raised|funding|series [a-f]|seed round|valuation|unicorn|融资|轮|估值|投资|领投|資金調達|調達|投資|유치|투자/i

async function fetchFeed(feed: FeedDef): Promise<{ title: string; url: string; publisher: string }[]> {
  try {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 12000)
    const res = await fetch(feed.url, { signal: ac.signal, cache: 'no-store', headers: { 'User-Agent': UA } })
    clearTimeout(timer)
    if (!res.ok) return []
    const xml = await res.text()
    // 轻量 RSS 解析（item 的 title/link/source）
    const items: { title: string; url: string; publisher: string }[] = []
    const re = /<item>([\s\S]*?)<\/item>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(xml)) && items.length < 40) {
      const block = m[1]
      const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] ?? '').trim()
      const link = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '').trim()
      const source = (block.match(/<source[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/)?.[1] ?? '').trim()
      if (title) items.push({ title, url: link, publisher: source })
    }
    return items
  } catch {
    return []
  }
}

// Google News 标题 "真实标题 - 媒体名" 拆分
function splitTitle(title: string): { title: string; publisher: string } {
  const idx = title.lastIndexOf(' - ')
  if (idx > 10 && idx < title.length - 2) {
    return { title: title.slice(0, idx).trim(), publisher: title.slice(idx + 3).trim() }
  }
  return { title, publisher: '' }
}

// ---------- LLM 抽取 ----------

type ExtractedEvent = {
  company?: string
  companyEn?: string
  market?: string
  sector?: string
  stage?: string
  roundLabel?: string
  date?: string
  amountUsd?: number | null
  valuationUsd?: number | null
  leadInvestors?: string
  desc?: string
  confidence?: number
}

const MARKETS = new Set(['CN', 'US', 'EU', 'JP', 'KR', 'IN', 'SEA', 'LATAM', 'MEA', 'OTHER'])
const SECTORS = new Set(['tech', 'consumer', 'finance', 'health', 'energy', 'industrial', 'materials', 'utility', 'comm', 'realestate'])
const STAGES = new Set(['angel', 'seed', 'a', 'b', 'c', 'd', 'e', 'f', 'pe', 'preipo'])

async function extractEvents(headlines: { title: string; publisher: string }[]): Promise<ExtractedEvent[]> {
  const lines = headlines.map((h, i) => `${i + 1}. ${h.title}`).join('\n')
  const system = `You extract structured startup FUNDING EVENTS from news headlines. Output STRICT raw JSON only (no markdown): {"events":[...]}
Each event: {"company":"original-script name","companyEn":"latin name","market":"CN|US|EU|JP|KR|IN|SEA|LATAM|MEA|OTHER","sector":"tech|consumer|finance|health|energy|industrial|materials|utility|comm|realestate","stage":"angel|seed|a|b|c|d|e|f|pe|preipo","roundLabel":"round label in Chinese like 天使轮/种子轮/A轮/B轮/C轮/D轮/E轮/F轮/PE轮/Pre-IPO","date":"YYYY-MM if reported, else null","amountUsd":number|null (convert to USD),"valuationUsd":number|null,"leadInvestors":"string or empty","desc":"one-sentence Chinese description of what the company does","confidence":0-1}
Rules: ONLY include events that are clearly about a company raising a funding round (skip rumors, skip M&A unless it's a majority stake investment, skip already-public companies' stock moves unless it's a private placement). If the headline mentions multiple different companies' rounds, emit separate events. Skip headlines where you cannot identify BOTH the company AND a funding round. confidence < 0.75 → omit the event. Max 25 events, prioritize the most concrete ones.`

  try {
    const out = await aiJson(system, `Headlines:\n${lines}`)
    return Array.isArray(out?.events) ? out.events : []
  } catch {
    return []
  }
}

// ---------- 校验 + 去重 + 入库 ----------

function normCompany(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .replace(/（.*?）|\(.*?\)/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, '')
    .slice(0, 40)
}

function sanitizeDate(v: any): string | null {
  const s = String(v ?? '').trim()
  const m = s.match(/^(\d{4})-(\d{1,2})/)
  if (!m) return null
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10)
  if (y < 2020 || y > 2100 || mo < 1 || mo > 12) return null
  return `${y}-${String(mo).padStart(2, '0')}`
}

function sanitizeAmount(v: any): number | null {
  const n = typeof v === 'number' ? v : parseFloat(v)
  if (!isFinite(n) || n <= 0) return null
  if (n < 1e5 || n > 2e11) return null // 10 万美元以下 / 2000 亿以上视为噪声
  return Math.round(n)
}

export type PrimarySyncResult = { ok: boolean; added: number; error?: string; at: number }

async function harvestOnce(): Promise<number> {
  // 1. 并行抓取全部 Feed
  const feedResults = await Promise.all(FUNDING_FEEDS.map(fetchFeed))
  const seen = new Set<string>()
  const candidates: { title: string; publisher: string; url: string; feed: string }[] = []
  feedResults.forEach((items, i) => {
    for (const it of items) {
      const st = splitTitle(it.title)
      if (!st.title || !FUNDING_RE.test(st.title)) continue
      const key = st.title.toLowerCase().slice(0, 80)
      if (seen.has(key)) continue
      seen.add(key)
      candidates.push({ title: st.title, publisher: st.publisher || it.publisher, url: it.url, feed: FUNDING_FEEDS[i].id })
    }
  })
  if (!candidates.length) return 0

  // 2. LLM 分批抽取（每批 30 条，最多 3 批 = 90 条/轮）
  const batches = []
  for (let i = 0; i < candidates.length && batches.length < 3; i += 30) {
    batches.push(candidates.slice(i, i + 30))
  }
  const extracted: ExtractedEvent[] = []
  for (const batch of batches) {
    extracted.push(...(await extractEvents(batch)))
    await new Promise((r) => setTimeout(r, 500))
  }
  if (!extracted.length) return 0

  // 3. 校验 + 库内去重 + 批内去重
  const existing = await db.fundingRound.findMany({
    select: { company: true, companyEn: true, date: true },
  })
  const existKeys = new Set<string>()
  for (const r of existing) {
    existKeys.add(`${normCompany(r.companyEn || r.company)}|${r.date.slice(0, 7)}`)
    existKeys.add(`${normCompany(r.company)}|${r.date.slice(0, 7)}`)
  }
  const batchKeys = new Set<string>()
  let added = 0
  for (const ev of extracted) {
    const company = String(ev.company ?? '').trim()
    if (!company || company.length < 2) continue
    if (typeof ev.confidence === 'number' && ev.confidence < 0.75) continue
    const stage = STAGES.has(String(ev.stage)) ? String(ev.stage) : 'a'
    const market = MARKETS.has(String(ev.market)) ? String(ev.market) : 'OTHER'
    const sector = SECTORS.has(String(ev.sector)) ? String(ev.sector) : 'tech'
    const companyEn = String(ev.companyEn ?? company).trim().slice(0, 80)
    const date = sanitizeDate(ev.date) ?? new Date().toISOString().slice(0, 7)
    const key = `${normCompany(companyEn || company)}|${date.slice(0, 7)}`
    if (existKeys.has(key) || batchKeys.has(key)) continue
    batchKeys.add(key)
    const src = candidates.find((c) => c.title.includes(company.slice(0, 8)))
    try {
      await db.fundingRound.create({
        data: {
          company: company.slice(0, 60),
          companyEn,
          market,
          sector,
          stage,
          roundLabel: String(ev.roundLabel ?? '融资轮').slice(0, 40),
          date,
          amountUsd: sanitizeAmount(ev.amountUsd),
          valuationUsd: sanitizeAmount(ev.valuationUsd),
          leadInvestors: String(ev.leadInvestors ?? '').slice(0, 120),
          desc: String(ev.desc ?? '').slice(0, 200),
          tags: '[]',
          source: 'ai',
          url: src?.url ?? '',
          publisher: (src?.publisher ?? '').slice(0, 60),
        },
      })
      added++
    } catch {
      /* 单条失败忽略 */
    }
  }
  return added
}

// ---------- 状态与编排 ----------

async function getState(key: string) {
  const s = await db.syncState.findUnique({ where: { key } })
  return s ? s.at.getTime() : 0
}

async function setState(key: string, info: string) {
  await db.syncState.upsert({ where: { key }, create: { key, at: new Date(), info }, update: { at: new Date(), info } })
}

export async function ensurePrimarySeed(): Promise<void> {
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
      source: 'seed',
    })),
  })
}

// 种子条目更新后补种：按 (companyEn+date) 逐条 upsert（只加不减，不覆盖 AI 条目）
export async function syncSeedEntries(): Promise<number> {
  let added = 0
  for (const f of FUNDING_SEED) {
    const exist = await db.fundingRound.findFirst({
      where: { companyEn: f.companyEn, date: f.date },
      select: { id: true },
    })
    if (exist) continue
    try {
      await db.fundingRound.create({
        data: {
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
          source: 'seed',
        },
      })
      added++
    } catch {
      /* ignore */
    }
  }
  return added
}

// AI 融资资讯同步（TTL 12h，fire-and-forget）
export async function ensurePrimarySync(force = false): Promise<PrimarySyncResult> {
  if (running) return running.then((r) => ({ ...r, at: Date.now() }))
  running = (async (): Promise<{ ok: boolean; added: number; error?: string }> => {
    try {
      await ensurePrimarySeed()
      const n = await db.fundingRound.count()
      const last = await getState(STATE_KEY)
      const fresh = Date.now() - last < SYNC_TTL
      if (!force && fresh && n >= FUNDING_SEED.length) return { ok: true, added: 0 }
      // 种子补齐（版本升级后新增条目自动入库）
      await syncSeedEntries()
      // AI 抓取
      const added = await harvestOnce()
      await setState(STATE_KEY, `total=${await db.fundingRound.count()} aiAdded=${added}`)
      console.log(`[primary-sync] AI harvest added=${added}`)
      return { ok: true, added }
    } catch (e: any) {
      const error = String(e?.message ?? e)
      console.log('[primary-sync] FAILED:', error.slice(0, 200))
      return { ok: false, added: 0, error }
    }
  })().finally(() => {
    running = null
  })
  return { ...(await running), at: Date.now() }
}

// 启动引导（instrumentation 调用）：种子 + 首轮 AI 抓取
export function bootstrapPrimarySync(): void {
  void (async () => {
    try {
      const n = await db.fundingRound.count()
      if (n === 0) {
        await ensurePrimarySeed()
        await harvestOnce().catch(() => 0)
        await setState(STATE_KEY, `bootstrapped total=${await db.fundingRound.count()}`)
      } else {
        await syncSeedEntries()
      }
    } catch {
      /* DB 不可用时忽略 */
    }
  })()
}

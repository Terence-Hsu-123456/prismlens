// 全市场公司池同步编排：
// - 首次/定时（TTL 30min）后台同步：A股（新浪全量+腾讯股息率+行业映射）、港股（HKEX官方名单+腾讯行情）、美股（Nasdaq官方）、
//   全球其他（TradingView Scanner ~35 国全量：日/韩/印/欧/亚太/美洲/中东非）、精选池（定性标签增强）
// - SQLite 批量 upsert（原始 SQL，秒级写入万级行）
// - 退市清理：各市场本轮未见到的行删除；新股自动入库 —— 动态化
import { db } from '@/lib/db'
import { UNIVERSE, MARKET_CURRENCY } from './universe'
import { getQuotes } from './quotes'
import { toUSD } from './format'
import { getFundamentals, ensureFundamentals } from './fundamentals'
import {
  fetchCnBulk,
  fetchHkList,
  fetchUsBulk,
  fetchGlobalBulk,
  tencentABatch,
  tencentHkBatch,
  sinaIndustryMap,
  toUsdCap,
  stageOf,
  type BulkRow,
} from './screen-sources'

export type SyncResult = {
  ok: boolean
  counts: { CN: number; HK: number; US: number; global: number; curated: number }
  errors: string[]
  durationMs: number
  at: number
}

const SYNC_TTL = 30 * 60_000 // 常规同步间隔
const INDUSTRY_TTL = 24 * 3600_000 // A股行业映射每日一次

let running: Promise<SyncResult> | null = null

// ---------- SyncState ----------

async function getState(key: string): Promise<{ at: number; info: string } | null> {
  const s = await db.syncState.findUnique({ where: { key } })
  return s ? { at: s.at.getTime(), info: s.info } : null
}

async function setState(key: string, info: string): Promise<void> {
  await db.syncState.upsert({
    where: { key },
    create: { key, at: new Date(), info },
    update: { at: new Date(), info },
  })
}

export async function getScreenStatus() {
  const [last, ind, hkList, total, cn, hk, us, jp, kr, inn, eu, ap, am, mea, curated] = await Promise.all([
    getState('screen:lastSync'),
    getState('cn:industry'),
    getState('hk:list'),
    db.screenCompany.count(),
    db.screenCompany.count({ where: { market: 'CN' } }),
    db.screenCompany.count({ where: { market: 'HK' } }),
    db.screenCompany.count({ where: { market: 'US' } }),
    db.screenCompany.count({ where: { market: 'JP' } }),
    db.screenCompany.count({ where: { market: 'KR' } }),
    db.screenCompany.count({ where: { market: 'IN' } }),
    db.screenCompany.count({ where: { market: 'EU' } }),
    db.screenCompany.count({ where: { market: 'AP' } }),
    db.screenCompany.count({ where: { market: 'AM' } }),
    db.screenCompany.count({ where: { market: 'MEA' } }),
    db.screenCompany.count({ where: { source: 'curated' } }),
  ])
  return {
    lastSyncAt: last?.at ?? 0,
    lastSyncInfo: last?.info ?? '',
    industrySyncedAt: ind?.at ?? 0,
    hkListSyncedAt: hkList?.at ?? 0,
    total,
    byMarket: { CN: cn, HK: hk, US: us, JP: jp, KR: kr, IN: inn, EU: eu, AP: ap, AM: am, MEA: mea, curated },
    syncing: running != null,
  }
}

// ---------- 批量 upsert（SQLite 原生 SQL） ----------

type UpsertVal = [
  string, string, string, string, string, string, string | null, string, string,
  number | null, string, number | null, number | null, number | null,
  number | null, number | null, number | null, number | null, number | null, number | null,
  string, string, string,
]

async function upsertRaw(rows: UpsertVal[]): Promise<void> {
  const CHUNK = 150 // 23 列 × 150 = 3450 参数（SQLite 上限内）
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const ph = chunk.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',')
    const sql = `INSERT INTO "ScreenCompany"
      (symbol,market,nameZh,nameEn,nameJa,country,sector,stage,tags,price,currency,changePercent,marketCap,capUsd,pe,pb,dividendYield,roe,profitMargin,revenueGrowth,source,seenAt,updatedAt)
      VALUES ${ph}
      ON CONFLICT("symbol") DO UPDATE SET
        market=excluded.market, nameZh=excluded.nameZh, nameEn=excluded.nameEn, nameJa=excluded.nameJa,
        country=excluded.country, sector=excluded.sector, stage=excluded.stage, tags=excluded.tags,
        price=excluded.price, currency=excluded.currency, changePercent=excluded.changePercent,
        marketCap=excluded.marketCap, capUsd=excluded.capUsd, pe=excluded.pe, pb=excluded.pb,
        dividendYield=excluded.dividendYield, roe=excluded.roe, profitMargin=excluded.profitMargin,
        revenueGrowth=excluded.revenueGrowth, source=excluded.source, seenAt=excluded.seenAt,
        "updatedAt"=datetime('now')`
    await db.$queryRawUnsafe(sql, ...chunk.flat())
  }
}

function bulkToVal(r: BulkRow, seenAt: string): UpsertVal {
  const capUsd = toUsdCap(r.marketCap, r.currency)
  const pe = r.pe
  const stage = stageOf(capUsd, r.revenueGrowth ?? null, pe)
  return [
    r.symbol, r.market, r.nameZh, r.nameEn, '', r.country, r.sector, stage, JSON.stringify(r.tags ?? []),
    r.price, r.currency, r.changePercent, r.marketCap, capUsd,
    pe, r.pb, r.dividendYield, null, null, null,
    'bulk', seenAt, seenAt,
  ]
}

async function pruneStale(market: string, before: Date): Promise<number> {
  const res = await db.screenCompany.deleteMany({
    where: { market, source: 'bulk', seenAt: { lt: before } },
  })
  return res.count
}

// ---------- 各市场同步 ----------

// A股行业映射：每日拉新浪行业分类；DB tags 反查覆盖不足时重拉（首次/失败自愈）
async function getIndustryMap(): Promise<Map<string, string> | null> {
  const st = await getState('cn:industry')
  if (!st || Date.now() - st.at > INDUSTRY_TTL) {
    const m = await sinaIndustryMap()
    if (m.size > 500) {
      await setState('cn:industry', `industries=${m.size}`)
      return m
    }
    return null
  }
  // 从 DB tags[0] 反查行业名
  const rows = await db.screenCompany.findMany({ where: { market: 'CN', source: 'bulk' }, select: { symbol: true, tags: true } })
  const m = new Map<string, string>()
  for (const r of rows) {
    try {
      const tags = JSON.parse(r.tags) as string[]
      if (tags.length) m.set(r.symbol.split('.')[0], tags[0])
    } catch {
      /* ignore */
    }
  }
  if (m.size > 500) return m
  // 覆盖不足（首次同步/历史空数据）→ 强制重拉
  const m2 = await sinaIndustryMap()
  if (m2.size > 500) {
    await setState('cn:industry', `industries=${m2.size}`)
    return m2
  }
  return null
}

async function syncCN(start: Date): Promise<number> {
  let industryMap: Map<string, string> | null = null
  try {
    industryMap = await getIndustryMap()
  } catch {
    industryMap = null
  }

  const bulk = await fetchCnBulk(industryMap ?? undefined)
  const codes = bulk.map((r) => r.symbol.split('.')[0])
  const tq = await tencentABatch(codes)
  const seenAt = start.toISOString()
  const vals: UpsertVal[] = []
  for (const r of bulk) {
    const code = r.symbol.split('.')[0]
    const q = tq.get(code)
    if (q) {
      r.price = q.price
      r.changePercent = q.pct
      if (q.pe != null) r.pe = q.pe
      if (q.pb != null) r.pb = q.pb
      if (q.mktcapY != null) r.marketCap = q.mktcapY * 1e8
      if (q.divYield != null && q.divYield > 0) r.dividendYield = q.divYield
    }
    vals.push(bulkToVal(r, seenAt))
  }
  await upsertRaw(vals)
  await pruneStale('CN', start)
  return vals.length
}

async function syncHK(start: Date): Promise<number> {
  const list = await fetchHkList()
  await setState('hk:list', `list=${list.length}`)
  const tq = await tencentHkBatch(list.map((r) => r.code))
  const seenAt = start.toISOString()
  const vals: UpsertVal[] = []
  for (const it of list) {
    const symbol = String(parseInt(it.code, 10)).padStart(4, '0') + '.HK'
    const q = tq.get(it.code)
    const nameZh = q?.nameZh || it.nameEn
    const nameEn = q?.nameEn || it.nameEn
    const price = q?.price ?? null
    const marketCap = q?.mktcapY != null ? q.mktcapY * 1e8 : null
    const capUsd = toUsdCap(marketCap, 'HKD')
    const pe = q?.pe ?? null
    const stage = stageOf(capUsd, null, pe)
    vals.push([
      symbol, 'HK', nameZh, nameEn, '', 'HK', null, stage, '[]',
      price, 'HKD', q?.pct ?? null, marketCap, capUsd,
      pe, q?.pb ?? null, null, null, null, null,
      'bulk', seenAt, seenAt,
    ])
  }
  await upsertRaw(vals)
  await pruneStale('HK', start)
  return vals.length
}

async function syncUS(start: Date): Promise<number> {
  const rows = await fetchUsBulk()
  const seenAt = start.toISOString()
  const vals = rows.map((r) => bulkToVal(r, seenAt))
  await upsertRaw(vals)
  await pruneStale('US', start)
  return vals.length
}

// 全球其他市场（TradingView ~35 国全量）：按市场 key 分组 upsert + 退市清理
const GLOBAL_MARKETS = ['JP', 'KR', 'IN', 'EU', 'AP', 'AM', 'MEA']
// 单市场抓取失败（TV 限流抖动）时，仅清理超过此时限未见到的行（自愈，不清空健康数据）
const GLOBAL_STALE_GRACE = 3 * 3600_000

async function syncGlobalTV(start: Date): Promise<number> {
  const { byMarket, errors } = await fetchGlobalBulk()
  const seenAt = start.toISOString()
  let total = 0
  for (const mk of GLOBAL_MARKETS) {
    const rows = byMarket[mk]
    if (rows && rows.length) {
      const vals = rows.map((r) => bulkToVal(r, seenAt))
      await upsertRaw(vals)
      await pruneStale(mk, start)
      total += vals.length
      console.log(`[screen-sync] global/${mk}: ${vals.length} rows`)
    } else {
      // 本轮抓取失败：只清理超过宽限期的旧行（防残留垃圾长期滞留）
      const before = new Date(start.getTime() - GLOBAL_STALE_GRACE)
      const pruned = await pruneStale(mk, before)
      if (pruned) console.log(`[screen-sync] global/${mk}: fetch failed, pruned ${pruned} stale rows`)
    }
  }
  if (errors.length && total === 0) throw new Error(errors.join('; ').slice(0, 200))
  return total
}

// 精选池：带定性标签的核心公司（tags/nameJa/人工阶段保留；全球全量同步之上的增强层）
async function syncCurated(start: Date): Promise<number> {
  const syms = UNIVERSE.map((u) => u.s)
  let quotes: Record<string, any> = {}
  try {
    quotes = await getQuotes(syms)
  } catch {
    quotes = {}
  }
  const vals: UpsertVal[] = []
  for (const u of UNIVERSE) {
    const q = quotes[u.s]
    const price = typeof q?.regularMarketPrice === 'number' && isFinite(q.regularMarketPrice) ? q.regularMarketPrice : null
    const marketCap = typeof q?.marketCap === 'number' && isFinite(q.marketCap) ? q.marketCap : null
    const currency = q?.currency ?? u.cur ?? MARKET_CURRENCY[u.mkt]
    // capUsd：getQuotes 返回的 marketCap 为本币（Yahoo 部分已折算？保守用 toUSD 统一）
    const capUsd = toUSD(marketCap, currency)
    const f = getFundamentals(u.s)
    vals.push([
      u.s, u.mkt, u.n.zh, u.n.en, u.n.ja ?? '', u.ctry, u.sec, u.stage, JSON.stringify(u.tags),
      price, currency,
      typeof q?.regularMarketChangePercent === 'number' ? q.regularMarketChangePercent : null,
      marketCap, capUsd,
      typeof q?.trailingPE === 'number' ? q.trailingPE : null,
      typeof q?.priceToBook === 'number' && q.priceToBook > 0 ? q.priceToBook : null,
      typeof q?.dividendYield === 'number' ? (q.dividendYield > 0 && q.dividendYield < 1 ? q.dividendYield * 100 : q.dividendYield) : null,
      f.roe != null ? f.roe * 100 : null,
      f.profitMargin != null ? f.profitMargin * 100 : null,
      f.revenueGrowth != null ? f.revenueGrowth * 100 : null,
      'curated', start.toISOString(), start.toISOString(),
    ])
  }
  await upsertRaw(vals)
  // 财务指标泵：后台渐进补齐（结果写回 DB）
  ensureFundamentals(syms)
  return vals.length
}

// ---------- 总编排 ----------

export async function syncAll(force = false): Promise<SyncResult> {
  if (running) return running.then((r) => r)
  running = (async (): Promise<SyncResult> => {
    const t0 = Date.now()
    const start = new Date()
    const counts = { CN: 0, HK: 0, US: 0, global: 0, curated: 0 }
    const errors: string[] = []
    const step = async (k: keyof typeof counts, fn: () => Promise<number>) => {
      const t = Date.now()
      try {
        counts[k] = await fn()
        console.log(`[screen-sync] ${k}: ${counts[k]} rows in ${Date.now() - t}ms`)
      } catch (e: any) {
        errors.push(`${k}: ${String(e?.message ?? e).slice(0, 120)}`)
        console.log(`[screen-sync] ${k} FAILED in ${Date.now() - t}ms:`, String(e?.message ?? e).slice(0, 200))
      }
    }
    await step('CN', () => syncCN(start))
    await step('HK', () => syncHK(start))
    await step('US', () => syncUS(start))
    await step('global', () => syncGlobalTV(start))
    await step('curated', () => syncCurated(start))
    const at = Date.now()
    const info = `CN=${counts.CN} HK=${counts.HK} US=${counts.US} global=${counts.global} curated=${counts.curated}${errors.length ? ' errors=' + errors.length : ''}`
    if (!errors.length || counts.CN + counts.HK + counts.US + counts.global + counts.curated > 0) {
      await setState('screen:lastSync', info)
    }
    // 泵一轮财务指标（后台渐进，写回 DB）
    try {
      const need = await db.screenCompany.findMany({
        where: { OR: [{ roe: null }, { pe: null }], capUsd: { not: null } },
        orderBy: { capUsd: 'desc' },
        take: 500,
        select: { symbol: true },
      })
      ensureFundamentals(need.map((r) => r.symbol))
    } catch { /* ignore */ }
    return { ok: errors.length < 4, counts, errors, durationMs: Date.now() - t0, at }
  })()
    .catch((e: any): SyncResult => ({ ok: false, counts: { CN: 0, HK: 0, US: 0, global: 0, curated: 0 }, errors: [String(e?.message ?? e)], durationMs: 0, at: Date.now() }))
    .finally(() => {
      running = null
    })
  return running
}

// TTL 触发（fire-and-forget，不阻塞调用方）；即使数据新鲜也会驱动财务泵渐进补齐
export async function ensureScreenSync(): Promise<void> {
  try {
    const [st, total] = await Promise.all([getState('screen:lastSync'), db.screenCompany.count()])
    const fresh = st && Date.now() - st.at < SYNC_TTL
    if (!fresh || total === 0) {
      void syncAll()
    } else {
      // 泵：补最缺的大市值公司（ROE/PE 等，写回 DB）
      const need = await db.screenCompany.findMany({
        where: { OR: [{ roe: null }, { pe: null }], capUsd: { not: null } },
        orderBy: { capUsd: 'desc' },
        take: 300,
        select: { symbol: true },
      })
      ensureFundamentals(need.map((r) => r.symbol))
    }
  } catch {
    /* DB 不可用时忽略 */
  }
}

// 启动引导：DB 为空时立即后台同步（instrumentation 调用）
export function bootstrapScreenSync(): void {
  void (async () => {
    try {
      const n = await db.screenCompany.count()
      if (n === 0) await syncAll()
      else await ensureScreenSync()
    } catch {
      /* ignore */
    }
  })()
}

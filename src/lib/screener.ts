// 服务端筛股引擎（DB 版）：公司池存于 SQLite（screen-sync 全市场动态同步），
// 本模块负责把筛选条件编译为 Prisma 查询 + 分页 + 语义筛股所需的内存过滤
import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export type ScreenRow = {
  symbol: string
  nameZh: string
  nameEn: string
  nameJa: string
  market: string
  country: string
  sector: string
  stage: string
  tags: string[]
  price: number | null
  currency: string
  changePercent: number | null
  marketCap: number | null
  capUsd: number | null
  pe: number | null
  pb: number | null
  dividendYield: number | null
  roe: number | null // %
  profitMargin: number | null // %
  revenueGrowth: number | null // %
  asOf: number
  degraded: boolean
}

export type Filters = {
  market?: string
  sector?: string
  stage?: string
  capMinUSD?: number | null
  peMax?: number | null
  pbMax?: number | null
  divMin?: number | null
  roeMin?: number | null
  pmMin?: number | null
  revMin?: number | null
  kw?: string
}

type DbRow = {
  symbol: string
  market: string
  nameZh: string
  nameEn: string
  nameJa: string
  country: string
  sector: string | null
  stage: string
  tags: string
  price: number | null
  currency: string
  changePercent: number | null
  marketCap: number | null
  capUsd: number | null
  pe: number | null
  pb: number | null
  dividendYield: number | null
  roe: number | null
  profitMargin: number | null
  revenueGrowth: number | null
}

function rowOf(r: DbRow): ScreenRow {
  let tags: string[] = []
  try {
    tags = JSON.parse(r.tags) as string[]
  } catch {
    tags = []
  }
  return {
    symbol: r.symbol,
    nameZh: r.nameZh,
    nameEn: r.nameEn || r.nameZh,
    nameJa: r.nameJa || r.nameEn || r.nameZh,
    market: r.market,
    country: r.country,
    sector: r.sector ?? '',
    stage: r.stage,
    tags,
    price: r.price,
    currency: r.currency,
    changePercent: r.changePercent,
    marketCap: r.marketCap,
    capUsd: r.capUsd,
    pe: r.pe,
    pb: r.pb,
    dividendYield: r.dividendYield,
    roe: r.roe,
    profitMargin: r.profitMargin,
    revenueGrowth: r.revenueGrowth,
    asOf: Date.now(),
    degraded: false,
  }
}

function whereOf(f: Filters): Prisma.ScreenCompanyWhereInput {
  const w: Prisma.ScreenCompanyWhereInput = {}
  if (f.market && f.market !== 'ALL') w.market = f.market
  if (f.sector && f.sector !== 'ALL') w.sector = f.sector
  if (f.stage && f.stage !== 'ALL') w.stage = f.stage
  if (f.capMinUSD) w.capUsd = { gte: f.capMinUSD } // 0/null = 不限（保留无市值数据行）
  if (f.peMax != null) w.pe = { gt: 0, lte: f.peMax }
  if (f.pbMax != null) w.pb = { gt: 0, lte: f.pbMax }
  if (f.divMin != null && f.divMin > 0) w.dividendYield = { gte: f.divMin }
  if (f.roeMin != null) w.roe = { gte: f.roeMin }
  if (f.pmMin != null) w.profitMargin = { gte: f.pmMin }
  if (f.revMin != null) w.revenueGrowth = { gte: f.revMin }
  const kw = (f.kw ?? '').trim().toLowerCase()
  if (kw) {
    w.OR = [
      { symbol: { contains: kw } },
      { nameZh: { contains: kw } },
      { nameEn: { contains: kw } },
      { nameJa: { contains: kw } },
      { tags: { contains: kw } },
    ]
  }
  return w
}

export type ScreenResult = {
  rows: ScreenRow[]
  total: number
  universeSize: number
  asOf: number
  degraded: boolean
  syncing: boolean
  lastSyncAt: number
}

// 分页查询（前端主接口）
export async function queryScreener(f: Filters, limit = 50, offset = 0): Promise<ScreenResult> {
  const where = whereOf(f)
  const [dbRows, total, universeSize, last] = await Promise.all([
    db.screenCompany.findMany({ where, orderBy: [{ capUsd: 'desc' }, { symbol: 'asc' }], take: Math.min(Math.max(limit, 1), 100), skip: Math.max(offset, 0) }),
    db.screenCompany.count({ where }),
    db.screenCompany.count(),
    db.syncState.findUnique({ where: { key: 'screen:lastSync' } }),
  ])
  return {
    rows: dbRows.map(rowOf),
    total,
    universeSize,
    asOf: last?.at.getTime() ?? Date.now(),
    degraded: false,
    syncing: false,
    lastSyncAt: last?.at.getTime() ?? 0,
  }
}

// 批量取行（AI 语义筛股：一次取回候选，再做关键词/放宽循环）
export async function queryRows(f: Filters, maxRows = 4000): Promise<ScreenRow[]> {
  const where = whereOf(f)
  const dbRows = await db.screenCompany.findMany({
    where,
    orderBy: [{ capUsd: 'desc' }, { symbol: 'asc' }],
    take: maxRows,
  })
  return dbRows.map(rowOf)
}

// JS 内存过滤（语义筛股的放宽循环用）
export function applyFilters(rows: ScreenRow[], f: Filters): ScreenRow[] {
  const kw = (f.kw ?? '').trim().toLowerCase()
  return rows
    .filter((r) => {
      if (f.market && f.market !== 'ALL' && r.market !== f.market) return false
      if (f.sector && f.sector !== 'ALL' && r.sector !== f.sector) return false
      if (f.stage && f.stage !== 'ALL' && r.stage !== f.stage) return false
      if (f.capMinUSD) {
        if (r.capUsd == null || r.capUsd < f.capMinUSD) return false
      }
      if (f.peMax != null) {
        if (r.pe == null || r.pe <= 0 || r.pe > f.peMax) return false
      }
      if (f.pbMax != null) {
        if (r.pb == null || r.pb <= 0 || r.pb > f.pbMax) return false
      }
      if (f.divMin != null && f.divMin > 0) {
        if (r.dividendYield == null || r.dividendYield < f.divMin) return false
      }
      if (f.roeMin != null) {
        if (r.roe == null || r.roe < f.roeMin) return false
      }
      if (f.pmMin != null) {
        if (r.profitMargin == null || r.profitMargin < f.pmMin) return false
      }
      if (f.revMin != null) {
        if (r.revenueGrowth == null || r.revenueGrowth < f.revMin) return false
      }
      if (kw) {
        const hay = `${r.nameZh} ${r.nameEn} ${r.nameJa} ${r.tags.join(' ')} ${r.sector} ${r.stage} ${r.symbol}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
}

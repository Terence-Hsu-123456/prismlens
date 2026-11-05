// 资讯存储层：优先使用 Prisma 数据库；在无持久化数据库的环境（如 Vercel Serverless
// 的 SQLite /tmp 路径）自动降级为进程内内存存储，保证资讯流始终可用。
//
// 背景：Vercel 上 DATABASE_URL=file:/tmp/prismlens.db 的 /tmp 属于实例级临时目录，
// 每次冷启动都是空文件，Prisma 的表不存在，所有 newsArticle 调用都会抛
// "The table main.NewsArticle does not exist in the current database"。
// 新闻本质上是可丢弃的缓存，因此降级到内存不影响功能正确性。
import { db } from '@/lib/db'

export type NewsRow = {
  id: string
  guid: string
  title: string
  url: string
  publisher: string
  source: string
  lang: string
  symbol: string | null
  publishedAt: Date
}

export type NewsWhere = {
  lang?: string
  /** 传 null 表示只要全局资讯（symbol 为空）；传字符串表示特定个股；不传则不筛选 */
  symbol?: string | null
  guidIn?: string[]
  publishedBefore?: Date
}

type MemState = { rows: NewsRow[]; seq: number }

const globalStore = globalThis as unknown as { __prismlensNewsMem?: MemState }

function memState(): MemState {
  if (!globalStore.__prismlensNewsMem) {
    globalStore.__prismlensNewsMem = { rows: [], seq: 0 }
  }
  return globalStore.__prismlensNewsMem
}

const MAX_MEMORY_ROWS = 6000

let resolved: 'db' | 'memory' | null = null

/** 探测一次数据库是否真正可用（表存在），结果在进程生命周期内缓存 */
export async function storeMode(): Promise<'db' | 'memory'> {
  if (resolved) return resolved
  try {
    await db.newsArticle.count()
    resolved = 'db'
  } catch (e) {
    resolved = 'memory'
    const msg = (e as Error)?.message ?? String(e)
    console.warn('[news-store] 数据库不可用，降级为内存存储：', msg.replace(/\s+/g, ' ').slice(0, 200))
  }
  return resolved
}

function toPrismaWhere(w: NewsWhere): any {
  const where: any = {}
  if (w.lang) where.lang = w.lang
  if (w.symbol !== undefined) where.symbol = w.symbol
  if (w.guidIn) where.guid = { in: w.guidIn }
  if (w.publishedBefore) where.publishedAt = { lt: w.publishedBefore }
  return where
}

function matchMem(r: NewsRow, w: NewsWhere): boolean {
  if (w.lang && r.lang !== w.lang) return false
  if (w.symbol !== undefined && r.symbol !== w.symbol) return false
  if (w.guidIn && !w.guidIn.includes(r.guid)) return false
  if (w.publishedBefore && !(r.publishedAt.getTime() < w.publishedBefore.getTime())) return false
  return true
}

export async function newsCount(w: NewsWhere = {}): Promise<number> {
  const mode = await storeMode()
  if (mode === 'db') {
    return db.newsArticle.count({ where: toPrismaWhere(w) })
  }
  return memState().rows.filter((r) => matchMem(r, w)).length
}

export async function newsExistingGuids(guids: string[]): Promise<Set<string>> {
  if (!guids.length) return new Set()
  const mode = await storeMode()
  if (mode === 'db') {
    const rows = await db.newsArticle.findMany({
      where: { guid: { in: guids } },
      select: { guid: true },
    })
    return new Set(rows.map((r) => r.guid))
  }
  const wanted = new Set(guids)
  const found = new Set<string>()
  for (const r of memState().rows) {
    if (wanted.has(r.guid)) found.add(r.guid)
  }
  return found
}

export async function newsInsert(rows: Omit<NewsRow, 'id'>[]): Promise<number> {
  if (!rows.length) return 0
  const mode = await storeMode()
  if (mode === 'db') {
    let inserted = 0
    for (const row of rows) {
      try {
        await db.newsArticle.create({ data: row })
        inserted++
      } catch {
        // guid 唯一约束冲突等忽略
      }
    }
    return inserted
  }
  const st = memState()
  const have = new Set(st.rows.map((r) => r.guid))
  let inserted = 0
  for (const row of rows) {
    if (have.has(row.guid)) continue
    have.add(row.guid)
    st.seq += 1
    st.rows.push({ ...row, id: `m${st.seq}` })
    inserted++
  }
  if (st.rows.length > MAX_MEMORY_ROWS) {
    st.rows.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    st.rows = st.rows.slice(0, MAX_MEMORY_ROWS)
  }
  return inserted
}

export async function newsDeleteBefore(d: Date): Promise<void> {
  const mode = await storeMode()
  if (mode === 'db') {
    await db.newsArticle.deleteMany({ where: { publishedAt: { lt: d } } })
    return
  }
  const st = memState()
  const cut = d.getTime()
  st.rows = st.rows.filter((r) => r.publishedAt.getTime() >= cut)
}

export async function newsList(w: NewsWhere, skip: number, take: number): Promise<NewsRow[]> {
  const mode = await storeMode()
  if (mode === 'db') {
    const rows = await db.newsArticle.findMany({
      where: toPrismaWhere(w),
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
    })
    return rows as NewsRow[]
  }
  const rows = memState().rows.filter((r) => matchMem(r, w))
  rows.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  return rows.slice(skip, skip + take)
}

export async function newsPublisherCount(w: NewsWhere = {}): Promise<number> {
  const mode = await storeMode()
  if (mode === 'db') {
    const groups = await db.newsArticle.groupBy({
      by: ['publisher'],
      where: toPrismaWhere(w),
      _count: { _all: true },
    })
    return groups.length
  }
  const set = new Set<string>()
  for (const r of memState().rows) {
    if (matchMem(r, w)) set.add(r.publisher)
  }
  return set.size
}

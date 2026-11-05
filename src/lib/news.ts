// 全球财经资讯聚合引擎：Google News(中/英/日) + Yahoo Finance + CNBC + MarketWatch + Investing.com
// 全部 RSS 入库去重（NewsArticle），随时间不断增量增多；支持全局流与个股公司流
import { createHash } from 'crypto'
import { XMLParser } from 'fast-xml-parser'
import {
  newsCount,
  newsDeleteBefore,
  newsExistingGuids,
  newsInsert,
  newsList,
  newsPublisherCount,
  type NewsRow,
} from '@/lib/news-store'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

export type NewsLang = 'zh' | 'en' | 'ja'

type FeedDef = {
  id: string // source 标识
  url: string
  lang: NewsLang
}

// ---------- Feed 定义 ----------
// Google News RSS：主题搜索（when:2d 只取近两天，避免历史噪音）
const g = (q: string, lang: NewsLang) => {
  const cfg: Record<NewsLang, string> = {
    zh: 'hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    en: 'hl=en-US&gl=US&ceid=US:en',
    ja: 'hl=ja&gl=JP&ceid=JP:ja',
  }
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&${cfg[lang]}`
}

// 全球资讯流：多市场 × 多语言 × 多媒体（约 14 个源并行）
export const GLOBAL_FEEDS: FeedDef[] = [
  // —— 中文财经（覆盖A股/港股/宏观/公司）——
  { id: 'g-zh-market', lang: 'zh', url: g('股市 A股 行情 when:2d', 'zh') },
  { id: 'g-zh-macro', lang: 'zh', url: g('中国经济 央行 利率 when:2d', 'zh') },
  { id: 'g-zh-tech', lang: 'zh', url: g('科技 芯片 新能源 汽车 when:2d', 'zh') },
  { id: 'g-zh-hk', lang: 'zh', url: g('港股 恒生 when:2d', 'zh') },
  // —— 英文财经（美股/宏观/行业）——
  { id: 'g-en-market', lang: 'en', url: g('stock market wall street when:2d', 'en') },
  { id: 'g-en-fed', lang: 'en', url: g('Federal Reserve interest rate inflation when:2d', 'en') },
  { id: 'g-en-earnings', lang: 'en', url: g('earnings report revenue when:2d', 'en') },
  { id: 'g-en-tech', lang: 'en', url: g('technology AI semiconductor when:2d', 'en') },
  // —— 日文财经 ——
  { id: 'g-ja-market', lang: 'ja', url: g('日本株 東証 when:2d', 'ja') },
  { id: 'g-ja-economy', lang: 'ja', url: g('日銀 円金利 経済 when:2d', 'ja') },
  // —— 专业媒体直连 ——
  { id: 'cnbc-top', lang: 'en', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114' },
  { id: 'cnbc-economy', lang: 'en', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258' },
  { id: 'marketwatch', lang: 'en', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' },
  { id: 'yahoo-mkt', lang: 'en', url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=US&lang=en-US' },
]

// 公司资讯流：按公司名+代码动态生成
export function companyFeeds(name: string, symbol: string): FeedDef[] {
  const feeds: FeedDef[] = []
  const kw = [name, symbol].filter(Boolean).join(' OR ')
  feeds.push({ id: 'g-company', lang: 'en', url: g(`${kw} when:7d`, 'en') })
  feeds.push({ id: 'g-company-zh', lang: 'zh', url: g(`${name} when:7d`, 'zh') })
  // Yahoo 特定股票头条（美股/部分港股可用）
  feeds.push({
    id: 'yahoo-company',
    lang: 'en',
    url: `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`,
  })
  return feeds
}

// ---------- RSS 解析 ----------
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
})

type RawItem = {
  guid: string
  title: string
  url: string
  publisher: string
  publishedAt: Date
}

function firstVal(v: any): any {
  if (v == null) return ''
  if (Array.isArray(v)) return v[0]
  return v
}

function textOf(v: any): string {
  const x = firstVal(v)
  if (x == null) return ''
  if (typeof x === 'object') {
    if ('#text' in x) return String(x['#text']).trim()
    if ('@_href' in x) return String(x['@_href']).trim()
    return ''
  }
  return String(x).trim()
}

// 上游 RSS 若以 ISO-8859-1 声明/传输 UTF-8 字节，会产出 â€™ 这类 mojibake；此处尝试反转修复
function fixMojibake(s: string): string {
  if (!/[\u00C2\u00C3\u00E2][\u0080-\u00BF]/.test(s)) return s
  try {
    const bytes = Uint8Array.from(Array.from(s, (ch) => ch.charCodeAt(0) & 0xff))
    const fixed = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return fixed && !fixed.includes('\uFFFD') ? fixed : s
  } catch {
    return s
  }
}

function hashGuid(link: string): string {
  return 'h' + createHash('sha1').update(link).digest('hex').slice(0, 20)
}

// 解码 HTML/XML 实体（fast-xml-parser 不处理命名实体与部分数字字符引用）
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

// Google News 标题格式：“真实标题 - 媒体名”，拆出媒体名
function splitGoogleTitle(title: string): { title: string; publisher: string } {
  const idx = title.lastIndexOf(' - ')
  if (idx > 10 && idx < title.length - 2) {
    return { title: title.slice(0, idx).trim(), publisher: title.slice(idx + 3).trim() }
  }
  return { title, publisher: '' }
}

function parseFeed(xml: string, feed: FeedDef): RawItem[] {
  try {
    const doc = parser.parse(xml)
    const channel = doc?.rss?.channel ?? doc?.rdf?.channel
    let items: any[] = doc?.rss?.channel?.item ?? doc?.['rdf:RDF']?.item ?? []
    if (!items && channel?.item) items = channel.item
    if (!Array.isArray(items)) items = items ? [items] : []
    const out: RawItem[] = []
    for (const it of items.slice(0, 40)) {
      const title = decodeEntities(textOf(it.title))
      const link = textOf(it.link) || textOf(it.guid) || ''
      if (!title || !link || title.length < 8) continue
      const pubRaw = textOf(it.pubDate) || textOf(it['dc:date']) || ''
      const ts = pubRaw ? new Date(pubRaw).getTime() : Date.now()
      const publishedAt = isFinite(ts) ? new Date(ts) : new Date()
      // 媒体名：Google News 用 <source>，否则用标题后缀，再否则用 feed id
      let publisher = decodeEntities(textOf(it.source))
      let cleanTitle = title
      if (feed.id.startsWith('g-') && !publisher) {
        const sp = splitGoogleTitle(title)
        cleanTitle = sp.title
        publisher = sp.publisher
      }
      // source 标签有值时，标题仍可能带“ - 媒体名”后缀，统一去掉
      if (publisher && cleanTitle.endsWith(` - ${publisher}`)) {
        cleanTitle = cleanTitle.slice(0, cleanTitle.length - publisher.length - 3).trim()
      }
      if (!publisher) publisher = FEED_LABEL[feed.id] ?? feed.id
      const guidRaw = textOf(it.guid) || link
      out.push({
        guid: guidRaw.startsWith('http') ? hashGuid(guidRaw) : guidRaw || hashGuid(link),
        title: fixMojibake(cleanTitle).slice(0, 300),
        url: link.slice(0, 500),
        publisher: publisher.slice(0, 80),
        publishedAt,
      })
    }
    return out
  } catch {
    return []
  }
}

const FEED_LABEL: Record<string, string> = {
  'cnbc-top': 'CNBC',
  'cnbc-economy': 'CNBC',
  marketwatch: 'MarketWatch',
  'yahoo-mkt': 'Yahoo Finance',
  'yahoo-company': 'Yahoo Finance',
  'g-company': 'Google News',
  'g-company-zh': 'Google 新闻',
}

// ---------- 抓取与入库 ----------
/** 按 XML 声明解码 RSS；避免响应头 charset 误标（如标成 ISO-8859-1）导致中文/引号乱码 */
function decodeRss(buf: ArrayBuffer): string {
  const head = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buf.slice(0, 256)))
  const m = head.match(/encoding\s*=\s*["']?([\w-]+)/i)
  const enc = (m?.[1] ?? 'utf-8').toLowerCase()
  const decoder = enc.includes('gb') ? 'gbk' : 'utf-8'
  try {
    return new TextDecoder(decoder, { fatal: false }).decode(buf)
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(buf)
  }
}

async function fetchFeed(feed: FeedDef): Promise<RawItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': UA, Accept: 'application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.8' },
      signal: AbortSignal.timeout(9000),
      cache: 'no-store',
    })
    if (!res.ok) return []
    const xml = decodeRss(await res.arrayBuffer())
    return parseFeed(xml, feed)
  } catch {
    return []
  }
}

/** 抓取一组 feed 并增量入库（按 guid 去重），返回新插入条数 */
async function ingest(feeds: FeedDef[], symbol: string | null): Promise<number> {
  const results = await Promise.all(feeds.map(fetchFeed))
  const langOf = new Map(feeds.map((f) => [f.id, f.lang]))
  // 汇总 + 按 guid 去重
  const seen = new Set<string>()
  const all: (RawItem & { source: string; lang: NewsLang })[] = []
  for (let i = 0; i < feeds.length; i++) {
    for (const it of results[i]) {
      if (seen.has(it.guid)) continue
      seen.add(it.guid)
      all.push({ ...it, source: feeds[i].id, lang: langOf.get(feeds[i].id) ?? 'en' })
    }
  }
  if (!all.length) return 0

  // 过滤已存在的 guid
  const guids = all.map((a) => a.guid)
  const existedSet = await newsExistingGuids(guids)
  const fresh = all.filter((a) => !existedSet.has(a.guid))
  if (!fresh.length) return 0

  const inserted = await newsInsert(
    fresh.map((a) => ({
      guid: a.guid,
      title: a.title,
      url: a.url,
      publisher: a.publisher,
      source: a.source,
      lang: a.lang,
      symbol,
      publishedAt: a.publishedAt,
    })),
  )
  // 清理 14 天前的旧资讯，保持库轻量
  if (inserted > 0 && Math.random() < 0.2) {
    newsDeleteBefore(new Date(Date.now() - 14 * 86400_000)).catch(() => {})
  }
  return inserted
}

// ---------- 刷新节流（避免每请求都抓） ----------
const REFRESH_INTERVAL = 4 * 60_000 // 4 分钟
let globalLast = 0
let globalRunning: Promise<number> | null = null
const companyLast = new Map<string, number>()
const companyRunning = new Map<string, Promise<number>>()

/** 全局资讯流增量刷新（带节流与并发去重） */
export function refreshGlobalNews(force = false): Promise<number> {
  const now = Date.now()
  if (!force && now - globalLast < REFRESH_INTERVAL) return Promise.resolve(0)
  if (globalRunning) return globalRunning
  globalLast = now
  globalRunning = ingest(GLOBAL_FEEDS, null)
    .catch(() => 0)
    .finally(() => {
      globalRunning = null
    })
  return globalRunning
}

/** 公司资讯流增量刷新 */
export function refreshCompanyNews(symbol: string, name: string, force = false): Promise<number> {
  const key = symbol.toUpperCase()
  const now = Date.now()
  if (!force && now - (companyLast.get(key) ?? 0) < REFRESH_INTERVAL) return Promise.resolve(0)
  const running = companyRunning.get(key)
  if (running) return running
  companyLast.set(key, now)
  const p = ingest(companyFeeds(name, key), key)
    .catch(() => 0)
    .finally(() => {
      companyRunning.delete(key)
    })
  companyRunning.set(key, p)
  return p
}

/** 冷启动：库内全局资讯不足时同步等待一次（带等待上限，避免请求长时间挂起） */
export async function ensureGlobalNews(): Promise<void> {
  const total = await newsCount({ symbol: null })
  if (total >= 80) return
  const p = refreshGlobalNews(true)
  // 最多阻塞 6 秒；超出后让抓取在后台继续，后续请求即可命中已入库的数据
  await Promise.race([p, new Promise<void>((resolve) => setTimeout(resolve, 6000))])
}

export type NewsItem = {
  id: string
  title: string
  url: string
  publisher: string
  source: string
  lang: string
  symbol: string | null
  publishedAt: number
}

/** 分页查询资讯（时间倒序），可选语言过滤与个股过滤 */
export async function listNews(opts: {
  page: number
  pageSize: number
  lang?: NewsLang | 'all'
  symbol?: string
}): Promise<{ items: NewsItem[]; total: number; hasMore: boolean; publishers: number }> {
  const { page, pageSize, lang = 'all', symbol } = opts
  const where = {
    ...(lang !== 'all' ? { lang } : {}),
    ...(symbol ? { symbol: symbol.toUpperCase() } : {}),
  }
  const skip = Math.max(0, (page - 1) * pageSize)
  const [total, publishers, rows] = await Promise.all([
    newsCount(where),
    newsPublisherCount(where),
    newsList(where, skip, pageSize),
  ])
  return {
    items: (rows as NewsRow[]).map((r) => ({
      id: r.id,
      title: fixMojibake(r.title),
      url: r.url,
      publisher: r.publisher,
      source: r.source,
      lang: r.lang,
      symbol: r.symbol,
      publishedAt: r.publishedAt.getTime(),
    })),
    total,
    hasMore: page * pageSize < total,
    publishers,
  }
}

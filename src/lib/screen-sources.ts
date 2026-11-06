// 全市场公司池数据源（全部为公开真实数据）：
// - 中国A股：新浪行情中心全量列表（~5600 只，价格/PE/PB/市值）+ 新浪行业分类（行业映射）+ 腾讯批量行情（股息率）
// - 港股：HKEX 官方名单 ListOfSecurities.xlsx（每日更新，新股自动进入）+ 腾讯港股批量行情（PE/PB/市值/中英文名）
// - 美股：Nasdaq 官方 screener（~7000 只，价格/市值/行业/国家）
// - 全球其他：TradingView Scanner（日/韩/印/欧/亚太/美洲/中东非 ~35 国全量，含 PE/PB/股息率）
// 汇率用 format.ts 的 FX_TO_USD 静态表折算 capUsd
import { FX_TO_USD } from './format'

export type BulkRow = {
  symbol: string // Yahoo 风格：600519.SS / 0700.HK / AAPL / 7203.T
  market: string // US | CN | HK | JP | KR | IN | EU | AP | AM | MEA
  nameZh: string
  nameEn: string
  country: string
  price: number | null
  currency: string
  changePercent: number | null
  marketCap: number | null // 本币
  pe: number | null
  pb: number | null
  dividendYield: number | null // %
  sector: string | null
  tags: string[]
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

async function fetchText(url: string, timeoutMs = 12000, headers: Record<string, string> = {}): Promise<string> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      cache: 'no-store',
      headers: { 'User-Agent': UA, ...headers },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url.slice(0, 80)}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

// GBK 编码响应（腾讯行情）：返回已解码字符串
async function fetchGbk(url: string, timeoutMs = 12000): Promise<string> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ac.signal, cache: 'no-store', headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url.slice(0, 80)}`)
    return new TextDecoder('gbk').decode(await res.arrayBuffer())
  } finally {
    clearTimeout(timer)
  }
}

async function fetchBuffer(url: string, timeoutMs = 30000): Promise<ArrayBuffer> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ac.signal, cache: 'no-store', headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url.slice(0, 80)}`)
    return await res.arrayBuffer()
  } finally {
    clearTimeout(timer)
  }
}

// 带并发限制的 map
async function pool<T, R>(items: T[], n: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      out[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return out
}

const num = (v: any): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN
  return isFinite(n) ? n : null
}

// ============ 行业映射 ============

// 新浪行业名 → 统一行业 key
export function sectorFromSinaIndustry(name: string): string | null {
  const s = name.trim()
  if (/银行|证券|保险|信托|金融|期货|创业投资/.test(s)) return 'finance'
  if (/医药|医疗|生物|健康|中药|制药/.test(s) && !/农药/.test(s)) return 'health'
  if (/煤炭|石油|油气|炼油/.test(s)) return 'energy'
  if (/电力|水务|燃气|供气|公用|环保/.test(s)) return /环保/.test(s) ? 'industrial' : 'utility'
  if (/房地产|地产|园区/.test(s)) return 'realestate'
  if (/传媒|文化|娱乐|影视|出版|广告|游戏/.test(s)) return 'comm'
  if (/通信|电信|通讯/.test(s)) return 'comm'
  if (/软件|计算机|信息|电子|半导体|集成电路|IT|互联网|数字经济/.test(s)) return 'tech'
  if (/钢铁|有色|金属|玻璃|水泥|建材|化工|化纤|塑料|橡胶|造纸|煤炭深加工|材料|稀土|锂|黄金|黄金贵重金属/.test(s)) return 'materials'
  if (/食品|饮料|酒|服装|纺织|零售|商贸|商业|旅游|酒店|餐饮|家电|电器|农林|牧渔|农业|种业|家具|家居|美容|日化|乳业|肉/.test(s)) return 'consumer'
  if (/汽车|机械|工程|建筑|船舶|军工|航天|航空|交通|物流|运输|电气|设备|仪器|自动化|机床|重工|电力设备|阀门|轴承/.test(s)) return 'industrial'
  return null
}

// Nasdaq / Yahoo 行业分类 → 统一行业 key
export function sectorFromEnName(name: string): string | null {
  const s = name.trim().toLowerCase()
  if (!s) return null
  if (/^technology$/.test(s)) return 'tech'
  if (/consumer (discretionary|staples|cyclical|defensive)/.test(s)) return 'consumer'
  if (/^health ?care$/.test(s)) return 'health'
  if (/^financial( services)?$/.test(s)) return 'finance'
  if (/^energy$/.test(s)) return 'energy'
  if (/^industrials?$/.test(s)) return 'industrial'
  if (/basic materials|^materials$/.test(s)) return 'materials'
  if (/^utilities?$/.test(s)) return 'utility'
  if (/communication/.test(s)) return 'comm'
  if (/real estate/.test(s)) return 'realestate'
  return null
}

// 生命周期启发式（全量批量行无法人工逐家标注，用市值/成长/盈亏推断，可解释）
export function stageOf(capUsd: number | null, revenueGrowth: number | null, pe: number | null): string {
  if (capUsd != null && isFinite(capUsd)) {
    if (capUsd >= 5e10) return 'mature' // 巨头
    if (capUsd < 2e9) return 'startup' // 小市值
  }
  if (pe != null && pe < 0 && (revenueGrowth ?? 0) < 0) return 'turnaround' // 亏损且收缩
  if (revenueGrowth != null && revenueGrowth >= 15) return 'growth'
  if (capUsd != null && capUsd < 1e10) return 'growth'
  return 'mature'
}

// ============ 中国A股：新浪全量列表 ============

type SinaStock = {
  symbol: string // sh600519
  code: string
  name: string
  trade: string
  changepercent: string
  per: string
  pb: string
  mktcap: string // 万元
}

async function sinaCount(node: string): Promise<number> {
  try {
    const t = await fetchText(
      `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount?node=${node}`,
      10000
    )
    return parseInt(t.replace(/[^0-9]/g, ''), 10) || 0
  } catch {
    return 0
  }
}

async function sinaPage(node: string, page: number, sort = 'amount'): Promise<SinaStock[]> {
  const t = await fetchText(
    `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=${page}&num=100&sort=${sort}&asc=0&node=${node}&symbol=&_s_r_a=page`,
    12000
  )
  const arr = JSON.parse(t) as SinaStock[]
  return Array.isArray(arr) ? arr : []
}

// 新浪行业分类字典：{node: 名称}（GBK 编码）
export async function sinaIndustries(): Promise<{ node: string; name: string; count: number }[]> {
  const t = await fetchGbk('https://vip.stock.finance.sina.com.cn/q/view/newSinaHy.php', 12000)
  // var S_Finance_bankuai_sinaindustry = {"new_blhy":"new_blhy,玻璃行业,19,...",...}
  const out: { node: string; name: string; count: number }[] = []
  const re = /"(new_[a-z0-9]+)":"([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(t))) {
    const parts = m[2].split(',')
    const count = parseInt(parts[2] ?? '0', 10) || 0
    out.push({ node: m[1], name: parts[1] ?? '', count })
  }
  return out
}

// 全市场 A股行业映射：代码 → 行业名（遍历新浪行业节点，每日缓存一次）
export async function sinaIndustryMap(): Promise<Map<string, string>> {
  const inds = await sinaIndustries()
  const map = new Map<string, string>()
  await pool(inds, 3, async (ind) => {
    // 逐页遍历直到空页（不信任 count，防分页遗漏）
    for (let p = 1; p <= 40; p++) {
      let rows: SinaStock[] = []
      for (let attempt = 0; attempt < 2 && !rows.length; attempt++) {
        try {
          rows = await sinaPage(ind.node, p, 'symbol')
        } catch {
          await new Promise((r) => setTimeout(r, 300))
        }
      }
      if (!rows.length) break
      for (const r of rows) map.set(r.code, ind.name)
      await new Promise((r) => setTimeout(r, 80))
    }
  })
  return map
}

// A股全量（新浪 hs_a）
export async function fetchCnBulk(industryMap?: Map<string, string>): Promise<BulkRow[]> {
  const total = (await sinaCount('hs_a')) || 6000
  const pages = Math.ceil(total / 100)
  const rows: BulkRow[] = []
  const seen = new Set<string>()
  for (let p = 1; p <= pages; p++) {
    let batch: SinaStock[] = []
    for (let attempt = 0; attempt < 2 && !batch.length; attempt++) {
      try {
        batch = await sinaPage('hs_a', p)
      } catch {
        await new Promise((r) => setTimeout(r, 400))
      }
    }
    for (const s of batch) {
      const price = num(s.trade)
      if (!price || price <= 0) continue // 停牌/异常
      if (s.symbol.startsWith('bj')) continue // 北交所源质量差，跳过
      if (seen.has(s.code)) continue
      seen.add(s.code)
      const mkt = s.symbol.startsWith('sh') ? 'SS' : 'SZ'
      const industry = industryMap?.get(s.code) ?? null
      const sector = industry ? sectorFromSinaIndustry(industry) : null
      const mktcapW = num(s.mktcap) // 万元 CNY
      rows.push({
        symbol: `${s.code}.${mkt}`,
        market: 'CN',
        nameZh: s.name,
        nameEn: s.name, // A股暂无英文名单源，回退中文名
        country: 'CN',
        price,
        currency: 'CNY',
        changePercent: num(s.changepercent),
        marketCap: mktcapW != null ? mktcapW * 1e4 : null,
        pe: num(s.per),
        pb: num(s.pb),
        dividendYield: null, // 腾讯批量行情补
        sector,
        tags: industry ? [industry] : [],
      })
    }
    if (p % 10 === 0) await new Promise((r) => setTimeout(r, 150))
  }
  return rows
}

// ============ 腾讯批量行情 ============

// A股股息率 + 行情校准：批量 q=sh600519,sz000001...（每批 60）
// 字段（0 基）：3 现价 / 31 涨跌 / 32 涨跌% / 39 PE-TTM / 44 流通市值亿 / 45 总市值亿 / 46 PB / 64 股息率TTM%
export type TencentAQuote = { price: number; pct: number; pe: number | null; pb: number | null; mktcapY: number | null; divYield: number | null }

export async function tencentABatch(codes: string[]): Promise<Map<string, TencentAQuote>> {
  const out = new Map<string, TencentAQuote>()
  // 腾讯要求带交易所前缀：6 开头沪市 sh，其余深市 sz
  const q = codes.filter((c) => /^[036]\d{5}$/.test(c))
  const chunks: string[][] = []
  for (let i = 0; i < q.length; i += 60) chunks.push(q.slice(i, i + 60))
  await pool(chunks, 5, async (chunk) => {
    try {
      const buf = await fetchGbk(`https://qt.gtimg.cn/q=${chunk.map((c) => (c[0] === '6' ? 'sh' : 'sz') + c).join(',')}`, 12000)
      for (const line of buf.split(';')) {
        const m = line.match(/v_(?:sh|sz)(\d{6})="([^"]*)"/)
        if (!m) continue
        const f = m[2].split('~')
        if (f.length < 66) continue
        const price = num(f[3])
        if (!price) continue
        out.set(m[1], {
          price,
          pct: num(f[32]) ?? 0,
          pe: num(f[39]),
          pb: num(f[46]),
          mktcapY: num(f[45]), // 亿 CNY
          divYield: num(f[64]), // %（TTM）
        })
      }
    } catch {
      /* 批次失败忽略 */
    }
  })
  return out
}

// 港股批量行情：3 现价 / 31 涨跌 / 32 涨跌% / 39 PE / 44 流通市值亿 / 45 总市值亿 / 46 英文名 / 50 PB
export type TencentHkQuote = { price: number; pct: number; pe: number | null; pb: number | null; mktcapY: number | null; nameZh: string; nameEn: string }

export async function tencentHkBatch(codes: string[]): Promise<Map<string, TencentHkQuote>> {
  const out = new Map<string, TencentHkQuote>()
  const chunks: string[][] = []
  for (let i = 0; i < codes.length; i += 60) chunks.push(codes.slice(i, i + 60))
  await pool(chunks, 5, async (chunk) => {
    try {
      const buf = await fetchGbk(`https://qt.gtimg.cn/q=${chunk.map((c) => `hk${c}`).join(',')}`, 12000)
      for (const line of buf.split(';')) {
        const m = line.match(/v_hk(\d{4,5})="([^"]*)"/)
        if (!m) continue
        const f = m[2].split('~')
        if (f.length < 51) continue
        const price = num(f[3])
        if (!price) continue
        out.set(m[1], {
          price,
          pct: num(f[32]) ?? 0,
          pe: num(f[39]),
          pb: num(f[50]),
          mktcapY: num(f[45]), // 亿 HKD
          nameZh: (f[1] ?? '').trim(),
          nameEn: (f[46] ?? '').trim(),
        })
      }
    } catch {
      /* 批次失败忽略 */
    }
  })
  return out
}

// ============ 港股：HKEX 官方名单 ============

export type HkListRow = { code: string; nameEn: string }

// HKEX ListOfSecurities.xlsx（每日更新，自动包含新上市公司）
export async function fetchHkList(): Promise<HkListRow[]> {
  const XLSX = await import('xlsx')
  const buf = await fetchBuffer('https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx', 45000)
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error('HKEX xlsx empty')
  // 文件 dimension 元数据有误（A1:R8），强制覆盖范围
  ws['!ref'] = 'A1:R20000'
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, defval: '' })
  const out: HkListRow[] = []
  for (const r of rows.slice(3)) {
    const code = String(r?.[0] ?? '').trim()
    const cat = String(r?.[2] ?? '').trim().toUpperCase()
    const sub = String(r?.[3] ?? '').trim()
    if (!/^\d{4,5}$/.test(code)) continue
    if (cat !== 'EQUITY') continue
    if (!/(Main Board|GEM|Investment Companies|Trading Only|Depositary Receipts)/i.test(sub)) continue
    // code 统一补齐 5 位（同步层负责转 Yahoo 风格 0700.HK / 腾讯风格 hk00700）
    out.push({ code: String(parseInt(code, 10)).padStart(5, '0'), nameEn: String(r?.[1] ?? '').trim() })
  }
  // 去重（同一公司多类股份各自保留）
  const seen = new Set<string>()
  return out.filter((r) => {
    if (seen.has(r.code)) return false
    seen.add(r.code)
    return true
  })
}

// ============ 美股：Nasdaq 官方 screener ============

export async function fetchUsBulk(): Promise<BulkRow[]> {
  const t = await fetchText('https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=25&download=true', 30000, {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  })
  const j = JSON.parse(t) as { data?: { rows?: any[] } }
  const rows = j?.data?.rows ?? []
  const out: BulkRow[] = []
  for (const r of rows) {
    const sym = String(r.symbol ?? '').trim().toUpperCase()
    if (!/^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(sym)) continue // 过滤权证/单位等异常代码
    const price = num(String(r.lastsale ?? '').replace(/[$,]/g, ''))
    const cap = num(String(r.marketCap ?? '').replace(/[$,]/g, ''))
    const sectorEn = String(r.sector ?? '').trim()
    const industry = String(r.industry ?? '').trim()
    const name = String(r.name ?? '').trim()
    if (!name) continue
    out.push({
      symbol: sym.replace(/\./g, '-'), // BRK.B → BRK-B（Yahoo 风格）
      market: 'US',
      nameZh: name,
      nameEn: name,
      country: countryFromNasdaq(String(r.country ?? '')),
      price: price && price > 0 ? price : null,
      currency: 'USD',
      changePercent: num(String(r.pctchange ?? '').replace('%', '')),
      marketCap: cap && cap > 0 ? cap : null,
      pe: null, // Yahoo 泵渐进补
      pb: null,
      dividendYield: null,
      sector: sectorFromEnName(sectorEn),
      tags: industry ? [industry] : [],
    })
  }
  return out
}

function countryFromNasdaq(c: string): string {
  const s = c.trim().toLowerCase()
  if (!s || /united states/.test(s)) return 'US'
  if (/china/.test(s)) return 'CN'
  if (/japan/.test(s)) return 'JP'
  if (/korea/.test(s)) return 'KR'
  if (/india/.test(s)) return 'IN'
  if (/united kingdom/.test(s)) return 'GB'
  if (/germany/.test(s)) return 'DE'
  if (/france/.test(s)) return 'FR'
  if (/canada/.test(s)) return 'CA'
  if (/switzerland/.test(s)) return 'CH'
  if (/australia/.test(s)) return 'AU'
  if (/netherlands/.test(s)) return 'NL'
  if (/israel/.test(s)) return 'IL'
  if (/singapore/.test(s)) return 'SG'
  if (/brazil/.test(s)) return 'BR'
  return 'US'
}

// ============ 汇率折算 ============

export function toUsdCap(v: number | null, currency: string): number | null {
  if (v == null || !isFinite(v)) return null
  const fx = FX_TO_USD[currency]
  if (!fx) return null
  return v * fx
}

// ============ 全球市场：TradingView Scanner（~35 国全量，含 PE/PB/股息率） ============
// TradingView Scanner 为公开接口，覆盖全球主要交易所全部上市股票：
// 每国totalCount即该国全部上市股票数，新股上市自动进入 → 动态化。
// 同一公司多交易所重复挂牌（如德国 XETR/LSX/DUS）按公司名去重，保留 Yahoo 符号最兼容的交易所。

const TV_COLUMNS = [
  'name', 'description', 'close', 'market_cap_basic', 'currency', 'sector', 'industry',
  'exchange', 'country', 'change', 'price_earnings_ttm', 'price_book_ratio', 'dividends_yield_current',
]

type TvMarketKey = 'JP' | 'KR' | 'IN' | 'EU' | 'AP' | 'AM' | 'MEA'

type TvDef = {
  slug: string // scanner.tradingview.com/{slug}/scan
  market: TvMarketKey
  country: string // TV country 字段过滤值（精确匹配；空串=不过滤）
  ctry: string // 两位国家码（旗帜/展示）
  suffix: string // 默认 Yahoo 后缀
  venues: string[] // 交易所优先级（越靠前越优先保留，Yahoo 兼容性最好）
  venueSuffix?: Record<string, string> // 交易所专属后缀覆盖（如印度 NSE→.NS / BSE→.BO）
  minor?: [string, string] // [TV 小币种, 主币种]：价格为小币种计价（/100）
}

export const TV_MARKETS: TvDef[] = [
  // —— 亚太核心 ——
  { slug: 'japan', market: 'JP', country: 'Japan', ctry: 'JP', suffix: '.T', venues: ['TSE', 'FSE', 'SGE', 'NSE'] },
  { slug: 'korea', market: 'KR', country: 'South Korea', ctry: 'KR', suffix: '.KS', venues: ['KRX'] },
  { slug: 'india', market: 'IN', country: 'India', ctry: 'IN', suffix: '.NS', venues: ['NSE', 'BSE'], venueSuffix: { NSE: '.NS', BSE: '.BO' } },
  // —— 欧洲 ——
  { slug: 'germany', market: 'EU', country: 'Germany', ctry: 'DE', suffix: '.DE', venues: ['XETR', 'FWB', 'LSX', 'GETTEX', 'DUS', 'HAN', 'MUN', 'STU', 'BER', 'SWB', 'TRADEGATE', 'LS'] },
  { slug: 'uk', market: 'EU', country: 'United Kingdom', ctry: 'GB', suffix: '.L', venues: ['LSE'], minor: ['GBX', 'GBP'] },
  { slug: 'france', market: 'EU', country: 'France', ctry: 'FR', suffix: '.PA', venues: ['EURONEXT', 'EURONEXT PARIS'] },
  { slug: 'netherlands', market: 'EU', country: 'Netherlands', ctry: 'NL', suffix: '.AS', venues: ['EURONEXT', 'EURONEXT AMSTERDAM'] },
  { slug: 'switzerland', market: 'EU', country: 'Switzerland', ctry: 'CH', suffix: '.SW', venues: ['SIX'] },
  { slug: 'italy', market: 'EU', country: 'Italy', ctry: 'IT', suffix: '.MI', venues: ['MIL', 'MILAN', 'EURONEXT MILAN'] },
  { slug: 'spain', market: 'EU', country: 'Spain', ctry: 'ES', suffix: '.MC', venues: ['BME', 'MAD'] },
  { slug: 'sweden', market: 'EU', country: 'Sweden', ctry: 'SE', suffix: '.ST', venues: ['OMXSTO', 'NGM'] },
  { slug: 'norway', market: 'EU', country: 'Norway', ctry: 'NO', suffix: '.OL', venues: ['OSL', 'OSE'] },
  { slug: 'denmark', market: 'EU', country: 'Denmark', ctry: 'DK', suffix: '.CO', venues: ['OMXCOP'] },
  { slug: 'finland', market: 'EU', country: 'Finland', ctry: 'FI', suffix: '.HE', venues: ['OMXHEX'] },
  { slug: 'poland', market: 'EU', country: 'Poland', ctry: 'PL', suffix: '.WA', venues: ['GPW', 'NEWCONNECT'] },
  { slug: 'turkey', market: 'EU', country: 'Turkey', ctry: 'TR', suffix: '.IS', venues: ['BIST'] },
  { slug: 'belgium', market: 'EU', country: 'Belgium', ctry: 'BE', suffix: '.BR', venues: ['EURONEXT', 'EURONEXT BRUSSELS'] },
  { slug: 'austria', market: 'EU', country: 'Austria', ctry: 'AT', suffix: '.VI', venues: ['VIE', 'WIEN'] },
  { slug: 'greece', market: 'EU', country: 'Greece', ctry: 'GR', suffix: '.AT', venues: ['ATHEX'] },
  { slug: 'portugal', market: 'EU', country: 'Portugal', ctry: 'PT', suffix: '.LS', venues: ['EURONEXT', 'EURONEXT LISBON'] },
  { slug: 'ireland', market: 'EU', country: 'Ireland', ctry: 'IE', suffix: '.IR', venues: ['EURONEXT', 'EURONEXT DUBLIN'] },
  { slug: 'czech', market: 'EU', country: 'Czech Republic', ctry: 'CZ', suffix: '.PR', venues: ['PSECZ', 'PRAGUE'] },
  // —— 亚太其他 ——
  { slug: 'taiwan', market: 'AP', country: 'Taiwan', ctry: 'TW', suffix: '.TW', venues: ['TWSE', 'TPEX'], venueSuffix: { TWSE: '.TW', TPEX: '.TWO' } },
  { slug: 'singapore', market: 'AP', country: 'Singapore', ctry: 'SG', suffix: '.SI', venues: ['SGX'] },
  { slug: 'australia', market: 'AP', country: 'Australia', ctry: 'AU', suffix: '.AX', venues: ['ASX'] },
  { slug: 'newzealand', market: 'AP', country: 'New Zealand', ctry: 'NZ', suffix: '.NZ', venues: ['NZSE', 'NZX'] },
  { slug: 'indonesia', market: 'AP', country: 'Indonesia', ctry: 'ID', suffix: '.JK', venues: ['IDX'] },
  { slug: 'malaysia', market: 'AP', country: 'Malaysia', ctry: 'MY', suffix: '.KL', venues: ['MYX'] },
  { slug: 'thailand', market: 'AP', country: 'Thailand', ctry: 'TH', suffix: '.BK', venues: ['SET'] },
  { slug: 'vietnam', market: 'AP', country: 'Vietnam', ctry: 'VN', suffix: '.VN', venues: ['HOSE', 'HNX'] },
  { slug: 'philippines', market: 'AP', country: 'Philippines', ctry: 'PH', suffix: '.PS', venues: ['PSE'] },
  // —— 美洲其他 ——
  { slug: 'canada', market: 'AM', country: 'Canada', ctry: 'CA', suffix: '.TO', venues: ['TSX', 'TSXV', 'NEO', 'CSE', 'NEOE'], venueSuffix: { TSX: '.TO', TSXV: '.V', NEO: '.NEO', NEOE: '.NEO', CSE: '.CN' } },
  { slug: 'brazil', market: 'AM', country: 'Brazil', ctry: 'BR', suffix: '.SA', venues: ['BMFBOVESPA', 'BVMF'] },
  { slug: 'mexico', market: 'AM', country: 'Mexico', ctry: 'MX', suffix: '.MX', venues: ['BMV'] },
  // 智利已移除：TV 数据币种标签不一致（CLP 市值 + USD 标签混用），质量不可靠
  // —— 中东非 ——
  { slug: 'israel', market: 'MEA', country: 'Israel', ctry: 'IL', suffix: '.TA', venues: ['TASE'], minor: ['ILA', 'ILS'] },
  { slug: 'qatar', market: 'MEA', country: 'Qatar', ctry: 'QA', suffix: '.QA', venues: ['QSE'] },
  { slug: 'uae', market: 'MEA', country: 'United Arab Emirates', ctry: 'AE', suffix: '.AE', venues: ['DFM', 'ADX'] },
]

// TV FactSet 行业 → 统一行业 key
export function sectorFromTv(s: string | null): string | null {
  const t = (s ?? '').trim().toLowerCase()
  if (!t) return null
  if (t === 'technology services' || t === 'electronic technology') return 'tech'
  if (t === 'finance') return 'finance'
  if (t === 'health technology' || t === 'health services') return 'health'
  if (t === 'energy minerals') return 'energy'
  if (t === 'producer manufacturing' || t === 'industrial services' || t === 'transportation' || t === 'commercial services' || t === 'government') return 'industrial'
  if (t === 'non-energy minerals' || t === 'process industries') return 'materials'
  if (t === 'utilities') return 'utility'
  if (t === 'consumer non-durables' || t === 'consumer durables' || t === 'retail trade' || t === 'distribution services' || t === 'consumer services') return 'consumer'
  if (t === 'communications') return 'comm'
  if (t === 'real estate') return 'realestate'
  return null
}

const TV_PAGE = 1000 // 单页上限
const TV_MAX_PAGES = 25 // 单国安全上限（2.5 万条）
const TV_PACE_MS = 900 // 请求间隔（TV 限流敏感：空响应=429）

// TV 货币别名归一（ILA=新谢克尔分为单位标签但数值即主币种）
const TV_CUR_ALIAS: Record<string, string> = { ILA: 'ILS', GBP: 'GBP', GBp: 'GBP', GBX: 'GBP' }

type TvPage = { total: number; rows: any[][] }

// POST 版扫描（TV 偶发 429/空响应 → 指数退避重试）
async function tvScanPost(def: TvDef, start: number): Promise<TvPage> {
  const filter: any[] = [{ left: 'type', operation: 'equal', right: 'stock' }]
  if (def.country) filter.push({ left: 'country', operation: 'equal', right: def.country })
  const body = JSON.stringify({ filter, range: [start, start + TV_PAGE], columns: TV_COLUMNS })
  let lastErr: Error | null = null
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2500 * attempt * attempt + 1500)) // 1.5s / 4s / 8.5s
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 30000)
    try {
      const res = await fetch(`https://scanner.tradingview.com/${def.slug}/scan`, {
        method: 'POST',
        signal: ac.signal,
        cache: 'no-store',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json' },
        body,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const txt = await res.text()
      if (!txt.trim()) throw new Error('empty body')
      const j = JSON.parse(txt) as { totalCount?: number; data?: { s: string; d: any[] }[] }
      return { total: j.totalCount ?? 0, rows: (j.data ?? []).map((x) => x.d ?? []) }
    } catch (e: any) {
      lastErr = new Error(String(e?.message ?? e))
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastErr ?? new Error('tv scan failed')
}

// 拉取一国全量并去重转换
export async function fetchTvMarket(def: TvDef): Promise<BulkRow[]> {
  const rows: any[][] = []
  let total = 0
  for (let p = 0; p < TV_MAX_PAGES; p++) {
    const page = await tvScanPost(def, p * TV_PAGE)
    total = page.total
    if (!page.rows.length) break
    rows.push(...page.rows)
    if (rows.length >= total) break
    await new Promise((r) => setTimeout(r, TV_PACE_MS))
  }
  // 去重：同一公司多交易所挂牌 → 保留 Yahoo 兼容性最好的交易所（venue 序）+ 市值最大
  const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, '')
  type Cand = { name: string; desc: string; venue: number; exch: string; cap: number | null; price: number | null; cur: string; pct: number | null; pe: number | null; pb: number | null; dy: number | null; sector: string | null; industry: string }
  const byCompany = new Map<string, Cand>()
  for (const d of rows) {
    // 去掉末尾多余的点（如英国 RR. → RR，拼接后缀后得到 RR.L 而非 RR..L）
    const name = String(d?.[0] ?? '').trim().replace(/\.+$/, '')
    const desc = String(d?.[1] ?? '').trim()
    if (!name || !desc) continue
    const priceRaw = num(d?.[2])
    const cap = num(d?.[3])
    const curRaw = String(d?.[4] ?? '').trim()
    const minor = def.minor && def.minor[0] === curRaw.toUpperCase() ? def.minor : null
    const currency = TV_CUR_ALIAS[minor ? minor[1] : curRaw] ?? (minor ? minor[1] : curRaw)
    const price = minor && priceRaw != null ? priceRaw / 100 : priceRaw
    const exch = String(d?.[7] ?? '').trim().toUpperCase()
    const venueIdx = def.venues.indexOf(exch)
    const cand: Cand = {
      name, desc,
      venue: venueIdx >= 0 ? venueIdx : 99,
      exch,
      cap,
      price,
      cur: currency,
      pct: num(d?.[9]),
      pe: num(d?.[10]),
      pb: num(d?.[11]),
      dy: num(d?.[12]),
      sector: sectorFromTv(d?.[5] ? String(d[5]) : null),
      industry: String(d?.[6] ?? '').trim(),
    }
    const key = normKey(desc)
    const prev = byCompany.get(key)
    if (!prev || cand.venue < prev.venue || (cand.venue === prev.venue && (cand.cap ?? 0) > (prev.cap ?? 0))) {
      byCompany.set(key, cand)
    }
  }
  // 输出：同一最终 symbol 再次去重（保留市值大者）
  const bySymbol = new Map<string, BulkRow>()
  for (const c of byCompany.values()) {
    const suffix = def.venueSuffix?.[c.exch] ?? def.suffix
    const symbol = `${c.name}${suffix}`
    const row: BulkRow = {
      symbol,
      market: def.market,
      nameZh: c.desc,
      nameEn: c.desc,
      country: def.ctry,
      price: c.price,
      currency: c.cur || 'USD',
      changePercent: c.pct,
      marketCap: c.cap,
      pe: c.pe != null && c.pe > 0 ? c.pe : null,
      pb: c.pb != null && c.pb > 0 ? c.pb : null,
      dividendYield: c.dy != null && c.dy > 0 ? c.dy : null,
      sector: c.sector,
      tags: c.industry ? [c.industry] : [],
    }
    const prev = bySymbol.get(symbol)
    if (!prev || (row.marketCap ?? 0) > (prev.marketCap ?? 0)) bySymbol.set(symbol, row)
  }
  return [...bySymbol.values()]
}

export type GlobalBulkResult = { byMarket: Record<string, BulkRow[]>; errors: string[] }

// 全量抓取所有 TV 市场（串行 + 间隔，防限流；单国失败不影响其他）
export async function fetchGlobalBulk(onProgress?: (slug: string, n: number) => void): Promise<GlobalBulkResult> {
  const byMarket: Record<string, BulkRow[]> = {}
  const errors: string[] = []
  for (const def of TV_MARKETS) {
    try {
      const rows = await fetchTvMarket(def)
      byMarket[def.market] = [...(byMarket[def.market] ?? []), ...rows]
      onProgress?.(def.slug, rows.length)
    } catch (e: any) {
      errors.push(`${def.slug}: ${String(e?.message ?? e).slice(0, 80)}`)
    }
    await new Promise((r) => setTimeout(r, TV_PACE_MS))
  }
  return { byMarket, errors }
}

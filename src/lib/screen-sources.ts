// 全市场公司池数据源（全部为公开真实数据）：
// - 中国A股：新浪行情中心全量列表（~5600 只，价格/PE/PB/市值）+ 新浪行业分类（行业映射）+ 腾讯批量行情（股息率）
// - 港股：HKEX 官方名单 ListOfSecurities.xlsx（每日更新，新股自动进入）+ 腾讯港股批量行情（PE/PB/市值/中英文名）
// - 美股：Nasdaq 官方 screener（~7000 只，价格/市值/行业/国家）
// 汇率用 format.ts 的 FX_TO_USD 静态表折算 capUsd
import { FX_TO_USD } from './format'

export type BulkRow = {
  symbol: string // Yahoo 风格：600519.SS / 0700.HK / AAPL
  market: 'US' | 'CN' | 'HK'
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

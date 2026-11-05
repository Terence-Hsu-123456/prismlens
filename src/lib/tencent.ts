// 腾讯行情主数据源：A股 / 港股 / 美股 实时行情 + 指数 + 商品 + K线（真实数据）
// 实测：qt.gtimg.cn 行情响应为 GBK 编码；web.ifzq.gtimg.cn K线为 UTF-8 JSON
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

export type ChartPoint = { t: number; close: number }

// ---------- 代码映射：Yahoo 风格代码 → 腾讯代码 ----------
const FIXED_MAP: Record<string, string> = {
  '^GSPC': 'usINX',
  '^IXIC': 'usIXIC',
  '^DJI': 'usDJI',
  '^HSI': 'hkHSI',
  '000001.SS': 'sh000001',
  '399001.SZ': 'sz399001',
  'GC=F': 'hf_GC',
  'CL=F': 'hf_CL',
}

export function tencentCode(sym: string): string | null {
  const m = sym.toUpperCase()
  if (FIXED_MAP[m]) return FIXED_MAP[m]
  let mt = /^(\d{6})\.(SS|SH)$/.exec(m)
  if (mt) return `sh${mt[1]}`
  mt = /^(\d{6})\.(SZ|XSHE)$/.exec(m)
  if (mt) return `sz${mt[1]}`
  mt = /^(\d{4,5})\.HK$/.exec(m)
  if (mt) return `hk${mt[1].padStart(5, '0')}`
  // 美股普通代码（BRK-B → usBRK_B，若腾讯不识别则由 Yahoo 兜底）
  if (/^[A-Z][A-Z0-9\-]{0,9}$/.test(m)) return `us${m.replace('-', '_')}`
  return null
}

// ---------- 时区感知的本地时间 → epoch ----------
function tzOffsetMs(tz: string, at: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(new Date(at))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  return asUTC - at
}

function epochFromLocal(raw: string, tz: string): number {
  const m = /(\d{4})[-/]?(\d{2})[-/]?(\d{2})(?:[ T]?(\d{2}):?(\d{2})?:?(\d{2})?)?/.exec(raw.trim())
  if (!m) return Date.now()
  const [, y, mo, d, h = '0', mi = '0', se = '0'] = m
  const utcGuess = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(se))
  return utcGuess - tzOffsetMs(tz, utcGuess)
}

const TZ_BY_PREFIX = (code: string): string => {
  if (code.startsWith('hk')) return 'Asia/Hong_Kong'
  if (code.startsWith('us')) return 'America/New_York'
  return 'Asia/Shanghai'
}

const fnum = (v: string | undefined): number | null => {
  if (v == null || v === '') return null
  const n = Number(v)
  return isFinite(n) ? n : null
}

// ---------- 行情解析 ----------
// A股/港股/美股（~ 分隔）关键字段位（实测校准）：
// 1名称 2代码 3现价 4昨收 5今开 6成交量(股/手) 30时间 31涨跌 32涨跌%
// 33最高 34最低 35美股=货币代码/A股=价格量额组合 36成交量 38换手率
// 39PE(TTM) 44流通市值(亿) 45总市值(亿) 46市净率
function parseTilde(code: string, f: string[]) {
  const price = fnum(f[3])
  if (price == null || price <= 0) return null
  const isUS = code.startsWith('us')
  const currency = isUS && /^[A-Z]{3}$/.test(f[35] ?? '') ? f[35] : code.startsWith('hk') ? 'HKD' : 'CNY'
  // A股成交量单位为手，换算成股
  const volRaw = fnum(f[36]) ?? fnum(f[6])
  const volume = !isUS && !code.startsWith('hk') && volRaw != null ? volRaw * 100 : volRaw
  const mcapYi = fnum(f[45]) // 亿（本币），美股该位不可靠
  const mcap = !isUS && mcapYi != null && mcapYi > 0 ? mcapYi * 1e8 : null
  const pe = fnum(f[39])
  const pb = fnum(f[46])
  return {
    symbol: '',
    shortName: f[1] || '',
    longName: f[1] || '',
    currency,
    regularMarketPrice: price,
    regularMarketChange: fnum(f[31]),
    regularMarketChangePercent: fnum(f[32]),
    regularMarketTime: f[30] ? epochFromLocal(f[30], TZ_BY_PREFIX(code)) : Date.now(),
    regularMarketDayHigh: fnum(f[33]),
    regularMarketDayLow: fnum(f[34]),
    regularMarketPreviousClose: fnum(f[4]),
    regularMarketOpen: fnum(f[5]),
    regularMarketVolume: volume,
    trailingPE: pe != null && pe > 0 ? pe : null,
    priceToBook: pb != null && pb > 0 ? pb : null,
    marketCap: mcap,
    fullExchangeName: isUS ? 'US Market' : code.startsWith('hk') ? 'HKEX' : code.startsWith('sh') ? 'SSE' : 'SZSE',
    _src: 'tencent',
  }
}

// 外盘商品（hf_ 前缀，逗号分隔）：
// 0现价 1涨跌% 4最高 5最低 6时间 7昨结 8开盘 12日期 13名称
function parseHf(code: string, f: string[]) {
  const price = fnum(f[0])
  if (price == null) return null
  return {
    symbol: '',
    shortName: f[13] || code,
    longName: f[13] || code,
    currency: 'USD',
    regularMarketPrice: price,
    regularMarketChangePercent: fnum(f[1]),
    regularMarketTime: f[12] ? epochFromLocal(`${f[12]} ${f[6] ?? ''}`, 'Asia/Shanghai') : Date.now(),
    regularMarketDayHigh: fnum(f[4]),
    regularMarketDayLow: fnum(f[5]),
    regularMarketPreviousClose: fnum(f[7]),
    regularMarketOpen: fnum(f[8]),
    fullExchangeName: 'Global Commodities',
    _src: 'tencent',
  }
}

export type TQuote = Record<string, any>

export async function tencentQuotes(symbols: string[]): Promise<Record<string, TQuote>> {
  const pairs = symbols
    .map((s) => ({ s: s.toUpperCase(), code: tencentCode(s) }))
    .filter((x): x is { s: string; code: string } => !!x.code)
  if (!pairs.length) throw new Error('no tencent-compatible symbols')
  const out: Record<string, TQuote> = {}
  for (let i = 0; i < pairs.length; i += 45) {
    const chunk = pairs.slice(i, i + 45)
    try {
      const res = await fetch(`https://qt.gtimg.cn/q=${chunk.map((c) => c.code).join(',')}`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      })
      const buf = await res.arrayBuffer()
      let text: string
      try {
        text = new TextDecoder('gbk').decode(buf)
      } catch {
        text = new TextDecoder('latin1').decode(buf)
      }
      const re = /v_(\w+)="([^"]*)"/g
      let mm: RegExpExecArray | null
      const byCode: Record<string, string[]> = {}
      while ((mm = re.exec(text))) {
        const raw = mm[2]
        // hf_ 商品为逗号分隔，其余为 ~ 分隔
        byCode[mm[1]] = /^hf_/.test(mm[1]) ? raw.split(',') : raw.split('~')
      }
      for (const { s, code } of chunk) {
        const f = byCode[code]
        if (!f) continue
        const parsed = /^hf_/.test(code) ? parseHf(code, f) : parseTilde(code, f)
        if (!parsed) continue
        out[s] = { ...parsed, symbol: s }
      }
    } catch {
      // 单块失败忽略，由上层兜底
    }
  }
  return out
}

// ---------- K线（日/周/月，前复权） ----------
export async function tencentKline(symbol: string, freq: 'day' | 'week' | 'month', count: number): Promise<ChartPoint[]> {
  const code = tencentCode(symbol)
  if (!code) throw new Error('no tencent code')
  // 美股K线需要带交易所后缀（.OQ=纳斯达克 / .N=纽交所），依次试探
  const candidates = code.startsWith('us') ? [`${code}.OQ`, `${code}.N`, code] : [code]
  let points: ChartPoint[] = []
  for (const cand of candidates) {
    try {
      const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${cand},${freq},,,${count},qfq`
      const res = await fetch(url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(9000),
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const node = data?.data?.[cand] ?? {}
      const arr: any[] = node.qfqday ?? node.qfqweek ?? node.qfqmonth ?? node.day ?? node.week ?? node.month ?? []
      points = []
      for (const row of arr) {
        const close = Number(row?.[2])
        const date = String(row?.[0] ?? '')
        if (!isFinite(close) || !/^\d{4}-\d{2}-\d{2}/.test(date)) continue
        points.push({ t: epochFromLocal(date, TZ_BY_PREFIX(code)), close })
      }
      if (points.length >= 10) return points
    } catch {
      // 尝试下一个后缀
    }
  }
  if (!points.length) throw new Error('empty kline')
  return points
}

// ---------- A股分钟线（当日分时） ----------
export async function tencentMinute(symbol: string): Promise<ChartPoint[]> {
  const code = tencentCode(symbol)
  if (!code || code.startsWith('us') || code.startsWith('hk') || code.startsWith('hf_')) throw new Error('minute not supported')
  const url = `https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=${code}`
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(9000),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const node = data?.data?.[code]?.data ?? {}
  const lines: string[] = node.data ?? []
  const dayStr = String(node.date ?? '').replace(/\D/g, '')
  const points: ChartPoint[] = []
  for (const line of lines) {
    const m = /^(\d{4})\s+([\d.]+)/.exec(line.trim())
    if (!m) continue
    const hh = Number(m[1].slice(0, 2))
    const mm = Number(m[1].slice(2, 4))
    const close = Number(m[2])
    if (!isFinite(close)) continue
    const base = dayStr
      ? epochFromLocal(`${dayStr.slice(0, 4)}-${dayStr.slice(4, 6)}-${dayStr.slice(6, 8)}`, 'Asia/Shanghai')
      : epochFromLocal(new Date().toISOString().slice(0, 10), 'Asia/Shanghai')
    points.push({ t: base + (hh * 60 + mm) * 60_000, close })
  }
  if (!points.length) throw new Error('empty minute')
  return points
}

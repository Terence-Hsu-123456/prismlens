// 多语言格式化工具（客户端/服务端通用）
export type Lang = 'zh-CN' | 'en-US' | 'ja-JP'

export function localeOf(lang: Lang): string {
  return lang
}

export function fmtPrice(v: number | null | undefined, currency: string, lang: Lang): string {
  if (v == null || !isFinite(v)) return '—'
  try {
    return new Intl.NumberFormat(localeOf(lang), {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).format(v)
  } catch {
    return `${currency} ${v.toFixed(2)}`
  }
}

export function fmtPct(v: number | null | undefined, digits = 2): string {
  if (v == null || !isFinite(v)) return '—'
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(digits)}%`
}

export function fmtNum(v: number | null | undefined, digits = 2): string {
  if (v == null || !isFinite(v)) return '—'
  return v.toFixed(digits)
}

// 大额金额：zh 万亿/亿，en T/B/M，ja 兆/億
export function fmtBigMoney(v: number | null | undefined, currency: string, lang: Lang): string {
  if (v == null || !isFinite(v)) return '—'
  const abs = Math.abs(v)
  let sym = currency
  try {
    sym = new Intl.NumberFormat(localeOf(lang), { style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(0).replace(/[\d.,\s]/g, '') || currency
  } catch {
    /* keep */
  }
  let unit = ''
  let div = 1
  if (lang === 'en-US') {
    if (abs >= 1e12) { unit = 'T'; div = 1e12 }
    else if (abs >= 1e9) { unit = 'B'; div = 1e9 }
    else if (abs >= 1e6) { unit = 'M'; div = 1e6 }
    else return `${sym}${v.toFixed(0)}`
  } else {
    if (abs >= 1e12) { unit = lang === 'ja-JP' ? '兆' : '万亿'; div = 1e12 }
    else if (abs >= 1e8) { unit = lang === 'ja-JP' ? '億' : '亿'; div = 1e8 }
    else if (abs >= 1e4) { unit = lang === 'ja-JP' ? '万' : '万'; div = 1e4 }
    else return `${sym}${v.toFixed(0)}`
  }
  return `${sym}${(v / div).toFixed(v / div >= 100 ? 0 : 2)}${unit}`
}

export function fmtCompact(v: number | null | undefined, lang: Lang): string {
  if (v == null || !isFinite(v)) return '—'
  const abs = Math.abs(v)
  if (lang === 'en-US') {
    if (abs >= 1e12) return `${(v / 1e12).toFixed(2)}T`
    if (abs >= 1e9) return `${(v / 1e9).toFixed(1)}B`
    if (abs >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  } else {
    if (abs >= 1e12) return `${(v / 1e12).toFixed(2)}${lang === 'ja-JP' ? '兆' : '万亿'}`
    if (abs >= 1e8) return `${(v / 1e8).toFixed(1)}${lang === 'ja-JP' ? '億' : '亿'}`
    if (abs >= 1e4) return `${(v / 1e4).toFixed(1)}${lang === 'ja-JP' ? '万' : '万'}`
  }
  return v.toFixed(0)
}

export function fmtClock(ts: number | null | undefined, lang: Lang): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleTimeString(localeOf(lang), { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return new Date(ts).toLocaleTimeString()
  }
}

export function fmtDateTime(ts: number | null | undefined, lang: Lang): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString(localeOf(lang), { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return new Date(ts).toLocaleString()
  }
}

export function fmtRelative(ts: number | null | undefined, lang: Lang): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const rtf = new Intl.RelativeTimeFormat(localeOf(lang), { numeric: 'auto' })
  if (mins < 60) return rtf.format(-mins, 'minute')
  const hours = Math.floor(mins / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  return rtf.format(-Math.floor(hours / 24), 'day')
}

export function fmtChartTick(ts: number, lang: Lang, intraday: boolean, timeZone?: string): string {
  try {
    if (intraday) {
      return new Intl.DateTimeFormat(localeOf(lang), { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date(ts))
    }
    return new Intl.DateTimeFormat(localeOf(lang), { year: '2-digit', month: 'short', timeZone }).format(new Date(ts))
  } catch {
    return new Date(ts).toLocaleDateString()
  }
}

export function fmtChartFull(ts: number, lang: Lang, intraday: boolean, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat(localeOf(lang), {
      ...(intraday
        ? { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: '2-digit', day: '2-digit' }),
      timeZone,
    }).format(new Date(ts))
  } catch {
    return new Date(ts).toLocaleString()
  }
}

export const FLAGS: Record<string, string> = {
  US: '🇺🇸', CN: '🇨🇳', HK: '🇭🇰', JP: '🇯🇵', KR: '🇰🇷', IN: '🇮🇳',
  DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧', CH: '🇨🇭', NL: '🇳🇱', DK: '🇩🇰', SE: '🇸🇪', EU: '🇪🇺',
  IT: '🇮🇹', ES: '🇪🇸', NO: '🇳🇴', FI: '🇫🇮', PL: '🇵🇱', TR: '🇹🇷', BE: '🇧🇪', AT: '🇦🇹',
  GR: '🇬🇷', PT: '🇵🇹', IE: '🇮🇪', CZ: '🇨🇿',
  TW: '🇹🇼', SG: '🇸🇬', AU: '🇦🇺', NZ: '🇳🇿', ID: '🇮🇩', MY: '🇲🇾', TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭',
  CA: '🇨🇦', BR: '🇧🇷', MX: '🇲🇽', CL: '🇨🇱',
  IL: '🇮🇱', QA: '🇶🇦', AE: '🇦🇪', SA: '🇸🇦', ZA: '🇿🇦',
  AP: '🌏', AM: '🌎', MEA: '🌍',
}

// 筛选用近似汇率（仅用于跨市场市值比较，展示仍用原币种）
export const FX_TO_USD: Record<string, number> = {
  USD: 1, CNY: 0.14, HKD: 0.128, JPY: 0.0066, KRW: 0.00072, INR: 0.0115,
  EUR: 1.08, GBP: 1.27, CHF: 1.13, DKK: 0.145, TWD: 0.031, AUD: 0.66,
  // 全球扩展（TradingView 全市场同步用，近似汇率仅作筛选排序）
  SEK: 0.095, NOK: 0.092, PLN: 0.25, CZK: 0.043, TRY: 0.03, HUF: 0.0028,
  SGD: 0.74, NZD: 0.6, IDR: 0.000062, MYR: 0.22, THB: 0.0285, VND: 0.00004, PHP: 0.0175,
  CAD: 0.73, BRL: 0.185, MXN: 0.049, CLP: 0.00105, ARS: 0.001,
  ILS: 0.27, QAR: 0.2747, AED: 0.2723, SAR: 0.2667, KWD: 3.26, ZAR: 0.055, EGP: 0.021,
}

export function toUSD(v: number | null | undefined, currency: string): number | null {
  if (v == null || !isFinite(v)) return null
  const fx = FX_TO_USD[currency]
  if (!fx) return null
  return v * fx
}

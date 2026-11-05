// 纯函数量化指标：基于真实收盘价序列计算
export type P = { t: number; close: number }

export function sma(vals: number[], n: number): number | null {
  if (vals.length < n) return null
  let s = 0
  for (let i = vals.length - n; i < vals.length; i++) s += vals[i]
  return s / n
}

export function rsi14(closes: number[]): number | null {
  if (closes.length < 15) return null
  let gain = 0
  let loss = 0
  const seg = closes.slice(-(14 + 1))
  for (let i = 1; i < seg.length; i++) {
    const d = seg[i] - seg[i - 1]
    if (d >= 0) gain += d
    else loss -= d
  }
  if (loss === 0) return 100
  const rs = gain / 14 / (loss / 14)
  return 100 - 100 / (1 + rs)
}

export function annualizedVol(closes: number[]): number | null {
  if (closes.length < 30) return null
  const rets: number[] = []
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) rets.push(Math.log(closes[i] / closes[i - 1]))
  }
  const n = rets.length
  if (!n) return null
  const mean = rets.reduce((a, b) => a + b, 0) / n
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)
  return Math.sqrt(variance) * Math.sqrt(252) * 100
}

export function momentumPct(closes: number[], back: number): number | null {
  if (closes.length < back + 1) return null
  const past = closes[closes.length - 1 - back]
  if (!past) return null
  return ((closes[closes.length - 1] - past) / past) * 100
}

export function maxDrawdown(closes: number[]): number | null {
  if (closes.length < 5) return null
  let peak = closes[0]
  let mdd = 0
  for (const c of closes) {
    if (c > peak) peak = c
    const dd = (peak - c) / peak
    if (dd > mdd) mdd = dd
  }
  return mdd * 100
}

export function computeTech(points: P[]) {
  const closes = points.map((p) => p.close)
  return {
    rsi14: rsi14(closes),
    annualVol: annualizedVol(closes),
    mom1M: momentumPct(closes, 21),
    mom3M: momentumPct(closes, 63),
    mom6M: momentumPct(closes, 126),
    maxDrawdown: maxDrawdown(closes),
    ma50: sma(closes, 50),
    ma200: sma(closes, 200),
  }
}

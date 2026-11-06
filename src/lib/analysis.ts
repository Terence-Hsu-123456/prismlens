// AI 三层投研分析引擎：真实数据 → LLM 结构化输出
import { cached } from './cache'
import { getQuotes, getChart } from './quotes'
import { yahooQuoteSummary, yahooNews } from './yahoo'
import { computeTech } from './quant'
import { UNIVERSE_BY_SYMBOL, PULSE } from './universe'
import { langName, type Lang } from './i18n'

// AI 接口走标准 OpenAI 协议，凭据由环境变量注入，不绑定单一托管平台
const AI_BASE = (
  process.env.ZAI_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  'https://open.bigmodel.cn/api/paas/v4'
).replace(/\/$/, '')
const AI_KEY = process.env.ZAI_API_KEY || process.env.OPENAI_API_KEY || ''
const AI_MODEL = process.env.ZAI_MODEL || 'glm-4.6'

export async function aiJson(system: string, user: string): Promise<any> {
  if (!AI_KEY) throw new Error('AI_NOT_CONFIGURED')
  const res = await fetch(`${AI_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_KEY}` },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`AI_HTTP_${res.status}:${(await res.text()).slice(0, 200)}`)
  const completion: any = await res.json()
  const text: string = completion?.choices?.[0]?.message?.content ?? ''
  const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '')
  const s = cleaned.indexOf('{')
  const e = cleaned.lastIndexOf('}')
  if (s < 0 || e <= s) throw new Error('AI response has no JSON')
  return JSON.parse(cleaned.slice(s, e + 1))
}

const num = (v: any, d = 2) => (typeof v === 'number' && isFinite(v) ? Number(v.toFixed(d)) : null)
// quoteSummary 的数值字段是 {raw, fmt} 包装，需要解包
const rv = (v: any) => (v && typeof v === 'object' && 'raw' in v ? v.raw : v)

async function gatherRealData(rawSymbol: string, lang: Lang) {
  const symbol = decodeURIComponent(rawSymbol).toUpperCase()
  const u = UNIVERSE_BY_SYMBOL[symbol]

  const [quoteRes, summRes, chartRes, newsRes, macroRes] = await Promise.allSettled([
    getQuotes([symbol]),
    yahooQuoteSummary(
      symbol,
      'assetProfile,summaryProfile,financialData,defaultKeyStatistics,summaryDetail,price,recommendationTrend,incomeStatementHistory'
    ),
    getChart(symbol, '1Y'),
    yahooNews(symbol),
    getQuotes([...PULSE.map((p) => p.s), '^GSPC']),
  ])

  const q = quoteRes.status === 'fulfilled' ? quoteRes.value[symbol] : null
  const summ = summRes.status === 'fulfilled' ? (summRes.value?.quoteSummary?.result?.[0] ?? null) : null
  const chart = chartRes.status === 'fulfilled' ? chartRes.value : null
  const news = newsRes.status === 'fulfilled' ? ((newsRes.value ?? []) as any[]).slice(0, 6) : []
  const mq = macroRes.status === 'fulfilled' ? macroRes.value : {}

  if (!q && !chart) throw new Error('NO_DATA')
  const tech = chart?.points?.length ? computeTech(chart.points) : null
  const fin = summ?.financialData ?? {}
  const ke = summ?.defaultKeyStatistics ?? {}
  const sd = summ?.summaryDetail ?? {}
  const price = summ?.price ?? {}
  const profile = summ?.assetProfile ?? summ?.summaryProfile ?? {}

  let divYield: number | null = null
  const dy = rv(sd?.dividendYield) ?? q?.dividendYield
  if (typeof dy === 'number') divYield = dy > 0 && dy < 1 ? Number((dy * 100).toFixed(2)) : Number(dy.toFixed(2))

  return {
    asOf: new Date().toISOString(),
    symbol,
    displayName: u?.n.zh ?? u?.n.en ?? q?.longName ?? q?.shortName ?? symbol,
    names: { zh: u?.n.zh ?? null, en: u?.n.en ?? q?.longName ?? null, ja: u?.n.ja ?? null },
    market: u?.mkt ?? 'OTHER',
    country: profile.country ?? u?.ctry ?? null,
    sector: profile.sector ?? (u ? `sector:${u.sec}` : null),
    industry: profile.industry ?? null,
    currency: q?.currency ?? rv(price?.currency) ?? 'USD',
    price: num(q?.regularMarketPrice ?? rv(price?.regularMarketPrice)),
    changePercent: num(q?.regularMarketChangePercent ?? rv(price?.regularMarketChangePercent)),
    marketCap: num(q?.marketCap ?? rv(price?.marketCap)),
    trailingPE: num(q?.trailingPE ?? rv(sd?.trailingPE)),
    forwardPE: num(q?.forwardPE ?? rv(sd?.forwardPE)),
    pegRatio: num(rv(ke?.pegRatio)),
    priceToBook: num(q?.priceToBook ?? rv(ke?.priceToBook) ?? rv(sd?.priceToBook)),
    dividendYieldPct: divYield,
    eps: num(rv(ke?.trailingEps) ?? q?.epsTrailingTwelveMonths),
    beta: num(rv(ke?.beta)),
    roePct: num(rv(fin?.returnOnEquity), 4),
    grossMarginPct: num(rv(fin?.grossMargins), 4),
    operatingMarginPct: num(rv(fin?.operatingMargins), 4),
    profitMarginPct: num(rv(fin?.profitMargins), 4),
    totalRevenue: num(rv(fin?.totalRevenue)),
    netIncome: num(rv(fin?.netIncomeToCommon)),
    freeCashflow: num(rv(fin?.freeCashflow)),
    debtToEquity: num(rv(fin?.debtToEquity)),
    revenueGrowthPct: num(rv(fin?.revenueGrowth), 4),
    earningsGrowthPct: num(rv(fin?.earningsGrowth), 4),
    targetMeanPrice: num(rv(fin?.targetMeanPrice)),
    recommendationKey: fin?.recommendationKey ?? null,
    analystCount: num(rv(fin?.numberOfAnalystOpinions), 0),
    fiftyTwoWeekHigh: num(q?.fiftyTwoWeekHigh ?? rv(sd?.fiftyTwoWeekHigh)),
    fiftyTwoWeekLow: num(q?.fiftyTwoWeekLow ?? rv(sd?.fiftyTwoWeekLow)),
    ma50: num(q?.fiftyDayAverage ?? tech?.ma50),
    ma200: num(q?.twoHundredDayAverage ?? tech?.ma200),
    technical: tech
      ? {
          rsi14: num(tech.rsi14, 1),
          annualizedVolatilityPct: num(tech.annualVol, 1),
          momentum1MPct: num(tech.mom1M, 1),
          momentum3MPct: num(tech.mom3M, 1),
          momentum6MPct: num(tech.mom6M, 1),
          maxDrawdown1YPct: num(tech.maxDrawdown, 1),
        }
      : null,
    incomeHistory: (summ?.incomeStatementHistory?.incomeStatementHistory ?? [])
      .slice(0, 4)
      .map((x: any) => {
        const endDate = rv(x?.endDate)
        return {
          year: endDate ? new Date(endDate * 1000).getUTCFullYear() : null,
          revenue: num(rv(x?.totalRevenue), 0),
          netIncome: num(rv(x?.netIncome), 0),
        }
      }),
    macroContext: {
      us10yYield: num(mq['^TNX']?.regularMarketPrice),
      us10yChangePct: num(mq['^TNX']?.regularMarketChangePercent),
      dollarIndex: num(mq['DX-Y.NYB']?.regularMarketPrice),
      dollarChangePct: num(mq['DX-Y.NYB']?.regularMarketChangePercent),
      goldPrice: num(mq['GC=F']?.regularMarketPrice),
      goldChangePct: num(mq['GC=F']?.regularMarketChangePercent),
      wtiCrude: num(mq['CL=F']?.regularMarketPrice),
      crudeChangePct: num(mq['CL=F']?.regularMarketChangePercent),
      vix: num(mq['^VIX']?.regularMarketPrice),
      sp500ChangePct: num(mq['^GSPC']?.regularMarketChangePercent),
      btcChangePct: num(mq['BTC-USD']?.regularMarketChangePercent),
    },
    recentNews: news
      .map((n: any) => ({
        title: n?.title ?? '',
        publisher: n?.publisher ?? '',
        time: n?.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : null,
      }))
      .filter((x) => x.title),
  }
}

function systemPrompt(lang: Lang): string {
  return `You are PrismLens AI — a senior buy-side investment analyst (CFA) who writes rigorous, data-grounded research in a three-layer framework (Macro → Industry → Company) and a four-way decision engine (Dow Theory, Value Investing, Fundamentals, Quant).

You will receive REAL market data for one listed company (quote, fundamentals, technicals, macro context, recent news). Analyze it and output STRICT JSON only (no markdown, no commentary, no code fences) with EXACTLY this schema:

{
  "macro": {
    "cyclePhase": "recovery" | "expansion" | "slowdown" | "recession",
    "summary": string,
    "rates": string,
    "risks": string[]
  },
  "industry": {
    "pest": { "political": string, "economic": string, "social": string, "technological": string },
    "fiveForces": { "supplierPower": int 1-5, "buyerPower": int 1-5, "newEntrants": int 1-5, "substitutes": int 1-5, "rivalry": int 1-5 },
    "valueChain": string,
    "competition": string
  },
  "company": {
    "financials": string,
    "valuation": { "verdict": "undervalued" | "fair" | "overvalued", "reasoning": string },
    "moat": { "score": int 1-5, "sources": string[], "reasoning": string },
    "growth": string,
    "risks": string[]
  },
  "decision": {
    "dow": { "score": int 0-100, "reasoning": string },
    "value": { "score": int 0-100, "reasoning": string },
    "fundamental": { "score": int 0-100, "reasoning": string },
    "quant": { "score": int 0-100, "reasoning": string },
    "overall": { "rating": "strong_buy" | "buy" | "hold" | "cautious" | "avoid", "score": int 0-100, "confidence": int 1-5, "conclusion": string, "suggestedAction": string }
  }
}

RULES:
1. Ground every claim in the provided REAL data and cite concrete numbers (e.g. "PE 22.4x, ROE 18%"). NEVER invent numbers.
2. If a field is null or missing, state that data is unavailable instead of fabricating.
3. fiveForces: 5 = strongest force. moat.score: 5 = widest moat. Scores must be integers within range.
4. For "macro.summary/rates", interpret the real us10y/dollar/gold/oil/vix/sp500 values given in macroContext and link them to this company.
5. For "decision.quant", explicitly use the real rsi14 / volatility / momentum / drawdown values. For "decision.dow", use price vs MA50/MA200 and momentum.
6. Write ALL human-readable strings in ${langName(lang)}. Keep each string concise (1-3 sentences); "risks" and "sources" are short phrases.
7. If the symbol is an index/ETF without financial statements, focus on macro + technical layers and note that company-level financials are not applicable.
8. Output raw JSON only.`
}

export async function buildAnalysis(symbolRaw: string, lang: Lang) {
  const data = await gatherRealData(symbolRaw, lang)
  const system = systemPrompt(lang)
  const user = `Analyze ${data.symbol} (${data.displayName}). Real market data:\n\n${JSON.stringify(data)}\n\nOutput the JSON report now.`
  try {
    const analysis = await aiJson(system, user)
    return {
      symbol: data.symbol,
      displayName: data.displayName,
      lang,
      asOf: Date.now(),
      engine: 'ai' as const,
      analysis,
    }
  } catch (e: any) {
    console.error('[analysis] AI failed:', String(e?.message ?? e).slice(0, 300))
    // AI 服务不可用（如外部部署无凭证）→ 用真实数据的规则引擎生成报告，功能不中断
    return {
      symbol: data.symbol,
      displayName: data.displayName,
      lang,
      asOf: Date.now(),
      engine: 'rules' as const,
      analysis: ruleBasedAnalysis(data),
    }
  }
}

// 规则引擎：基于真实行情/财务数据的确定性分析（AI 不可用时的兜底）
function ruleBasedAnalysis(d: any) {
  const t = d.technical
  const px = d.price ?? 0
  const pe = d.trailingPE
  const pb = d.priceToBook
  const roe = d.roePct != null ? d.roePct * 100 : null
  const dq = (b: boolean, s: string) => ({ score: b ? 75 : 45, reasoning: s })
  const dow = t
    ? dq(
        (d.ma50 != null && px >= d.ma50) || (t.momentum3MPct ?? 0) > 0,
        `价格 ${px} vs MA50 ${d.ma50 ?? '—'}，3个月动量 ${t.momentum3MPct ?? '—'}%，趋势${(d.ma50 != null && px >= d.ma50) || (t.momentum3MPct ?? 0) > 0 ? '偏强' : '偏弱'}（道氏跟随确认）`
      )
    : { score: 50, reasoning: '技术数据不足' }
  const value = dq(
    (pe != null && pe > 0 && pe < 25) || (pb != null && pb > 0 && pb < 3),
    `PE ${pe ?? '—'} / PB ${pb ?? '—'}，相对历史与同业处于${pe != null && pe > 0 && pe < 25 ? '偏低' : '中性偏高'}区间（价值维度）`
  )
  const fundamental = dq(
    (roe != null && roe > 12) || (d.revenueGrowthPct != null && d.revenueGrowthPct > 0.05),
    `ROE ${roe != null ? roe.toFixed(1) + '%' : '—'}，营收增速 ${d.revenueGrowthPct != null ? (d.revenueGrowthPct * 100).toFixed(1) + '%' : '—'}（基本面质量）`
  )
  const quant = t
    ? dq((t.momentum6MPct ?? 0) > 0 && (t.rsi14 ?? 50) < 75, `RSI ${t.rsi14 ?? '—'}，6月动量 ${t.momentum6MPct ?? '—'}%，波动率 ${t.annualizedVolatilityPct ?? '—'}%（量化因子）`)
    : { score: 50, reasoning: '量化数据不足' }
  const overall = Math.round((dow.score + value.score + fundamental.score + quant.score) / 4)
  const rating = overall >= 75 ? 'buy' : overall >= 60 ? 'buy' : overall >= 45 ? 'hold' : 'cautious'
  return {
    macro: {
      cyclePhase: d.macroContext?.vix != null && d.macroContext.vix > 25 ? 'slowdown' : 'expansion',
      summary: `美10Y ${d.macroContext?.us10yYield ?? '—'}%，VIX ${d.macroContext?.vix ?? '—'}，标普当日 ${d.macroContext?.sp500ChangePct ?? '—'}%（规则引擎基于实时宏观数据）`,
      rates: `美元指数 ${d.macroContext?.dollarIndex ?? '—'}，黄金 ${d.macroContext?.goldPrice ?? '—'}，原油 ${d.macroContext?.wtiCrude ?? '—'}`,
      risks: ['利率与汇率波动', '地缘与政策不确定性'],
    },
    industry: {
      pest: {
        political: '监管与贸易政策需持续跟踪',
        economic: '利率环境直接影响估值与需求',
        social: '消费与人口结构变化影响长期需求',
        technological: 'AI 与自动化正在重塑行业成本曲线',
      },
      fiveForces: { supplierPower: 3, buyerPower: 3, newEntrants: 3, substitutes: 3, rivalry: 3 },
      valueChain: '需结合公司具体产业链位置分析（当前为规则引擎通用判断）',
      competition: d.sector ? `所属板块 ${d.sector}，竞争格局参考行业集中度` : '行业竞争格局数据不足',
    },
    company: {
      financials: `营收 ${d.totalRevenue ?? '—'}，净利 ${d.netIncome ?? '—'}，毛利率 ${d.grossMarginPct != null ? (d.grossMarginPct * 100).toFixed(1) + '%' : '—'}，负债/权益 ${d.debtToEquity ?? '—'}`,
      valuation: {
        verdict: (pe != null && pe > 0 && pe < 25) || (pb != null && pb < 3) ? 'undervalued' : 'fair',
        reasoning: `PE ${pe ?? '—'} / PB ${pb ?? '—'} / 股息率 ${d.dividendYieldPct ?? '—'}%`,
      },
      moat: { score: roe != null && roe > 15 ? 4 : 3, sources: ['盈利能力', '规模效应'], reasoning: `ROE ${roe != null ? roe.toFixed(1) + '%' : '—'} 反映的竞争优势强度` },
      growth: `营收增速 ${d.revenueGrowthPct != null ? (d.revenueGrowthPct * 100).toFixed(1) + '%' : '—'}，盈利增速 ${d.earningsGrowthPct != null ? (d.earningsGrowthPct * 100).toFixed(1) + '%' : '—'}`,
      risks: ['行业竞争加剧', '估值回归风险'],
    },
    decision: {
      dow,
      value,
      fundamental,
      quant,
      overall: {
        rating,
        score: overall,
        confidence: 3,
        conclusion: `四维综合评分 ${overall}/100（规则引擎，基于真实市场数据计算）`,
        suggestedAction: rating === 'buy' ? '可分批关注' : rating === 'hold' ? '持有观察' : '谨慎观望',
      },
    },
  }
}

export async function getAnalysis(symbolRaw: string, lang: Lang, force = false) {
  const symbol = decodeURIComponent(symbolRaw).toUpperCase()
  const key = `analysis:${symbol}:${lang}`
  if (force) {
    const result = await buildAnalysis(symbol, lang)
    cached(key, 30 * 60_000, async () => result).catch(() => {})
    return result
  }
  return cached(key, 30 * 60_000, () => buildAnalysis(symbol, lang))
}

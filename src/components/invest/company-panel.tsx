'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PriceChart from './price-chart'
import AiReport from './ai-report'
import { CompanyNews } from './news-flow'
import { useLive } from '@/hooks/use-live'
import { useI18n } from '@/hooks/use-i18n'
import { useAppStore } from '@/lib/store'
import {
  fmtBigMoney,
  fmtClock,
  fmtCompact,
  fmtNum,
  fmtPct,
  fmtPrice,
  fmtRelative,
  FLAGS,
} from '@/lib/format'
import type { DictKey } from '@/lib/i18n'

type StockData = {
  symbol: string
  universe: {
    market: string
    country: string
    sector: string
    stage: string
    tags: string[]
    nameZh: string
    nameEn: string
    nameJa: string
  } | null
  quote: Record<string, any>
  financials: Record<string, any> | null
  keyStats: Record<string, any> | null
  summaryDetail: Record<string, any> | null
  profile: Record<string, any> | null
  recommendationTrend: any[] | null
  incomeHistory: { year: number | null; revenue: number | null; netIncome: number | null }[]
  news: { title: string; publisher: string; link: string; time: number | null }[]
  asOf: number
}
type ChartData = {
  symbol: string
  range: string
  meta: { currency: string | null; timezone: string | null; previousClose: number | null }
  points: { t: number; close: number }[]
  asOf: number
}
type Hit = {
  symbol: string
  name: string
  exchange: string
  market: string | null
  flag: string
  price: number | null
  changePercent: number | null
  currency: string | null
}

const RANGES = ['1D', '1M', '6M', '1Y', '5Y'] as const

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="truncate text-[11px] text-stone-500">{label}</div>
      <div className="mt-1 truncate text-sm font-bold tabular-nums text-stone-900">{value}</div>
      {sub && <div className="truncate text-[10px] text-stone-400">{sub}</div>}
    </div>
  )
}

export default function CompanyPanel() {
  const { t, tone, toneBg, sparkColor, lang } = useI18n()
  const symbol = useAppStore((s) => s.symbol)
  const setSymbol = useAppStore((s) => s.setSymbol)

  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<(typeof RANGES)[number]>('1Y')
  const boxRef = useRef<HTMLDivElement>(null)

  // 热门公司（无搜索词时的默认列表）
  const quick = useLive<{ hits: Hit[] }>(`/api/search?lang=${lang}`, 120_000)

  // 搜索防抖
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setHits([])
      setSearching(false)
      return
    }
    setSearching(true)
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`)
        const j = await r.json()
        setHits(j.hits ?? [])
      } catch {
        setHits([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(id)
  }, [query, lang])

  // 点击外部关闭下拉
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const stock = useLive<StockData>(
    symbol ? `/api/stock/${encodeURIComponent(symbol)}?lang=${lang}` : null,
    60_000
  )
  const chart = useLive<ChartData>(
    symbol ? `/api/stock/${encodeURIComponent(symbol)}/chart?range=${range}` : null,
    range === '1D' ? 60_000 : 300_000
  )

  const d = stock.data
  const quote = d?.quote ?? {}
  const currency = quote.currency ?? 'USD'
  const price = typeof quote.regularMarketPrice === 'number' ? quote.regularMarketPrice : null
  const chg = typeof quote.regularMarketChangePercent === 'number' ? quote.regularMarketChangePercent : null

  const dyRaw = quote.trailingAnnualDividendYield ?? d?.summaryDetail?.dividendYield
  const divPct = typeof dyRaw === 'number' ? (dyRaw > 0 && dyRaw < 1 ? dyRaw * 100 : dyRaw) : null

  const low = quote.fiftyTwoWeekLow
  const high = quote.fiftyTwoWeekHigh
  const wkPos =
    low && high && high > low && price != null ? Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100)) : null

  const nameOf = () => {
    const u = d?.universe
    if (u) return lang === 'zh-CN' ? u.nameZh : lang === 'ja-JP' ? u.nameJa || u.nameEn : u.nameEn
    return quote.longName || quote.shortName || symbol
  }

  const flag = d?.universe ? FLAGS[d.universe.market] ?? '🌐' : '🌐'
  const recKey = d?.financials?.recommendationKey
  const recLabel: DictKey | null = recKey
    ? (({ strong_buy: 'co.rec.sb', buy: 'co.rec.b', hold: 'co.rec.h', sell: 'co.rec.s', strong_sell: 'co.rec.ss' } as Record<string, DictKey>)[recKey] ?? null)
    : null
  const trend0 = d?.recommendationTrend?.[0]
  const finCurrency = d?.financials?.financialCurrency ?? currency

  const pts = chart.data?.points ?? []
  const periodChg =
    pts.length >= 2 && pts[0].close ? ((pts[pts.length - 1].close - pts[0].close) / pts[0].close) * 100 : null

  const selectSymbol = (s: string) => {
    setSymbol(s)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="space-y-5">
      {/* 搜索框 */}
      <div ref={boxRef} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={t('common.searchPh')}
          className="h-12 rounded-xl border-stone-200 bg-white pl-10 text-base focus-visible:ring-amber-700/30"
          aria-label={t('common.searchPh')}
        />
        {searching && (
          <RefreshCw className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-amber-700" />
        )}
        {open && (query.trim() ? hits.length > 0 || !searching : (quick.data?.hits?.length ?? 0) > 0) && (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
            {!query.trim() && (
              <div className="px-3 pt-2.5 text-[11px] font-medium text-stone-500">{t('co.quick')}</div>
            )}
            <div className="max-h-80 overflow-y-auto pretty-scroll p-1.5">
              {(query.trim() ? hits : quick.data?.hits ?? []).map((h) => (
                <button
                  key={h.symbol}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectSymbol(h.symbol)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-stone-100"
                >
                  <span className="text-lg leading-none">{h.flag || '🌐'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-stone-900">{h.name}</span>
                    <span className="block truncate text-[11px] text-stone-500">
                      {h.symbol} · {h.exchange}
                    </span>
                  </span>
                  {h.price != null && (
                    <span className="text-right">
                      <span className="block text-xs font-semibold tabular-nums text-stone-800">
                        {fmtPrice(h.price, h.currency ?? 'USD', lang)}
                      </span>
                      <span className={`block text-[10px] tabular-nums ${tone(h.changePercent)}`}>
                        {fmtPct(h.changePercent)}
                      </span>
                    </span>
                  )}
                </button>
              ))}
              {query.trim() && !searching && hits.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-stone-500">{t('common.noResults')}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 未选择公司 */}
      {!symbol && (
        <Card className="border-dashed border-stone-200 bg-white">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-700/10 ring-1 ring-amber-700/25">
              <Building2 className="h-6 w-6 text-amber-700" />
            </span>
            <p className="max-w-md text-sm leading-relaxed text-stone-500">{t('common.searchPh')}</p>
            <div className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
              {(quick.data?.hits ?? []).map((h) => (
                <button
                  key={h.symbol}
                  onClick={() => selectSymbol(h.symbol)}
                  className="rounded-xl border border-stone-200 bg-white p-3 text-left transition hover:border-amber-700/40"
                >
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span>{h.flag || '🌐'}</span>
                    <span className="truncate">{h.name}</span>
                  </div>
                  <div className="mt-1 truncate font-mono text-[10px] text-stone-400">{h.symbol}</div>
                  {h.price != null && (
                    <div className="mt-1.5 flex items-baseline justify-between gap-1">
                      <span className="text-xs font-bold tabular-nums text-stone-800">
                        {fmtPrice(h.price, h.currency ?? 'USD', lang)}
                      </span>
                      <span className={`text-[10px] tabular-nums ${tone(h.changePercent)}`}>{fmtPct(h.changePercent)}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 加载失败 */}
      {symbol && stock.error && !d && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="flex items-center justify-between p-4 text-sm text-rose-700">
            <span>
              {t('common.error')} ({stock.error})
            </span>
            <button onClick={stock.refresh} className="underline underline-offset-2 hover:text-rose-700">
              {t('common.retry')}
            </button>
          </CardContent>
        </Card>
      )}

      {/* 公司仪表盘 */}
      {symbol && (
        <>
          {!d ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-2xl bg-white" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl bg-white" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* 头部卡片 */}
              <Card className="border-stone-200 bg-gradient-to-r from-[#f1ead9] to-white">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl leading-none">{flag}</span>
                        <h2 className="truncate text-xl font-bold text-stone-900">{nameOf()}</h2>
                        <Badge variant="outline" className="border-stone-300 font-mono text-[11px] text-stone-500">
                          {d.symbol}
                        </Badge>
                        {quote.fullExchangeName && (
                          <span className="text-xs text-stone-500">{quote.fullExchangeName}</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-baseline gap-3">
                        <span className="text-3xl font-extrabold tabular-nums text-stone-900">
                          {fmtPrice(price, currency, lang)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-sm font-semibold tabular-nums ${toneBg(chg)}`}
                        >
                          {chg != null && chg !== 0 && (chg > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />)}
                          {fmtPct(chg)}
                        </span>
                        {d.profile?.sector && (
                          <span className="text-xs text-stone-500">{d.profile.sector}</span>
                        )}
                      </div>
                      {Array.isArray(d.universe?.tags) && d.universe.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {d.universe.tags.slice(0, 6).map((tg) => (
                            <span key={tg} className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 text-xs text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t('common.updatedAt')} {fmtClock(d.asOf, lang)}
                      </span>
                      <button
                        onClick={stock.refresh}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:border-amber-700/40 hover:text-amber-800"
                        aria-label={t('common.refresh')}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${stock.loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* 52 周区间 */}
                  {wkPos != null && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>
                          {t('co.wk52')} · {fmtPrice(low, currency, lang)}
                        </span>
                        <span>{fmtPrice(high, currency, lang)}</span>
                      </div>
                      <div className="relative mt-1.5 h-1.5 rounded-full bg-gradient-to-r from-rose-500/40 via-stone-300 to-emerald-500/40">
                        <span
                          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-stone-700 bg-white shadow"
                          style={{ left: `${wkPos}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 关键指标 */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Stat label={t('co.stat.mcap')} value={fmtBigMoney(quote.marketCap, currency, lang)} />
                <Stat label={t('co.stat.pe')} value={fmtNum(quote.trailingPE, 1)} />
                <Stat label={t('co.stat.fpe')} value={fmtNum(quote.forwardPE, 1)} />
                <Stat label={t('co.stat.pb')} value={fmtNum(quote.priceToBook ?? d.keyStats?.priceToBook, 2)} />
                <Stat label={t('co.stat.div')} value={divPct != null ? fmtPct(divPct) : '—'} />
                <Stat label={t('co.stat.roe')} value={fmtPct(d.financials?.returnOnEquity != null ? d.financials.returnOnEquity * 100 : null, 1)} />
                <Stat label={t('co.stat.gm')} value={fmtPct(d.financials?.grossMargins != null ? d.financials.grossMargins * 100 : null, 1)} />
                <Stat label={t('co.stat.pm')} value={fmtPct(d.financials?.profitMargins != null ? d.financials.profitMargins * 100 : null, 1)} />
                <Stat label={t('co.stat.rev')} value={fmtBigMoney(d.financials?.totalRevenue, finCurrency, lang)} />
                <Stat label={t('co.stat.ni')} value={fmtBigMoney(d.financials?.netIncomeToCommon, finCurrency, lang)} />
                <Stat label={t('co.stat.fcf')} value={fmtBigMoney(d.financials?.freeCashflow, finCurrency, lang)} />
                <Stat
                  label={t('co.stat.de')}
                  value={d.financials?.debtToEquity != null ? `${fmtNum(d.financials.debtToEquity, 0)}%` : '—'}
                />
                <Stat label={t('co.stat.eps')} value={fmtNum(d.keyStats?.trailingEps ?? quote.epsTrailingTwelveMonths, 2)} />
                <Stat label={t('co.stat.beta')} value={fmtNum(d.keyStats?.beta, 2)} />
                <Stat label={t('co.stat.peg')} value={fmtNum(d.keyStats?.pegRatio, 2)} />
              </div>

              {/* 分析师评级 + 目标价 */}
              {(recLabel || trend0) && (
                <Card className="border-stone-200 bg-white">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div>
                      <div className="text-[11px] text-stone-500">{t('co.stat.analysts')}</div>
                      <div className="mt-0.5 text-sm font-bold text-emerald-600">{recLabel ? t(recLabel) : '—'}</div>
                    </div>
                    {trend0 && (
                      <div className="min-w-48 flex-1">
                        <div className="flex h-2.5 overflow-hidden rounded-full bg-stone-100">
                          {(() => {
                            const sb = trend0.strongBuy ?? 0
                            const b = trend0.buy ?? 0
                            const h = trend0.hold ?? 0
                            const s = trend0.sell ?? 0
                            const ss = trend0.strongSell ?? 0
                            const total = sb + b + h + s + ss || 1
                            return (
                              <>
                                <span className="bg-emerald-500" style={{ width: `${((sb + b) / total) * 100}%` }} />
                                <span className="bg-stone-400" style={{ width: `${(h / total) * 100}%` }} />
                                <span className="bg-rose-500" style={{ width: `${((s + ss) / total) * 100}%` }} />
                              </>
                            )
                          })()}
                        </div>
                        <div className="mt-1 flex gap-3 text-[10px] text-stone-500">
                          <span className="text-emerald-600">{(trend0.strongBuy ?? 0) + (trend0.buy ?? 0)} {t('co.rec.b')}</span>
                          <span>{trend0.hold ?? 0} {t('co.rec.h')}</span>
                          <span className="text-rose-600">{(trend0.sell ?? 0) + (trend0.strongSell ?? 0)} {t('co.rec.s')}</span>
                        </div>
                      </div>
                    )}
                    {d.financials?.targetMeanPrice != null && (
                      <div className="text-right">
                        <div className="text-[11px] text-stone-500">{t('co.stat.target')}</div>
                        <div className="mt-0.5 text-sm font-bold tabular-nums text-stone-900">
                          {fmtPrice(d.financials.targetMeanPrice, finCurrency, lang)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* K 线图 */}
              <Card className="border-stone-200 bg-white">
                <CardContent className="p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-stone-800">
                      {d.symbol}
                      <span className="ml-2 text-xs font-normal text-stone-500">{chart.data?.meta?.exchangeName}</span>
                    </h3>
                    <Tabs value={range} onValueChange={(v) => setRange(v as any)}>
                      <TabsList className="h-8 bg-white p-0.5">
                        {RANGES.map((r) => (
                          <TabsTrigger
                            key={r}
                            value={r}
                            className="h-7 rounded-md px-2.5 text-xs text-stone-500 data-[state=active]:bg-stone-100 data-[state=active]:text-amber-800"
                          >
                            {t(`co.r${r.toLowerCase()}` as DictKey)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  {chart.loading && !chart.data ? (
                    <Skeleton className="h-[300px] w-full bg-white" />
                  ) : chart.data && chart.data.points.length > 0 ? (
                    <PriceChart
                      points={chart.data.points}
                      currency={chart.data.meta?.currency ?? currency}
                      lang={lang}
                      intraday={range === '1D'}
                      timeZone={chart.data.meta?.timezone}
                      color={sparkColor(periodChg)}
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-stone-400">{t('common.noData')}</div>
                  )}
                </CardContent>
              </Card>

              {/* 年度财报 */}
              {d.incomeHistory?.length >= 2 && (
                <Card className="border-stone-200 bg-white">
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-bold text-stone-800">{t('co.fin.title')}</h3>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={d.incomeHistory} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <CartesianGrid stroke="#27272a" vertical={false} />
                        <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          width={64}
                          tickFormatter={(v: number) => fmtCompact(v, lang)}
                          tick={{ fill: '#71717a', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#27272a55' }}
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs shadow-xl">
                                <div className="mb-1 font-semibold text-stone-800">{label}</div>
                                {payload.map((p: any) => (
                                  <div key={p.dataKey} className="flex items-center gap-2 text-stone-700">
                                    <span className={`h-2 w-2 rounded-full ${p.dataKey === 'revenue' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {p.dataKey === 'revenue' ? t('co.fin.rev') : t('co.fin.ni')}：{fmtBigMoney(p.value, finCurrency, lang)}
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="revenue" fill="#34d399" radius={[3, 3, 0, 0]} maxBarSize={38} />
                        <Bar dataKey="netIncome" fill="#fbbf24" radius={[3, 3, 0, 0]} maxBarSize={38} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-1.5 flex gap-4 text-[11px] text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {t('co.fin.rev')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        {t('co.fin.ni')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 真实新闻（多源聚合，无限滚动） */}
              <CompanyNews
                symbol={d.symbol}
                name={lang === 'zh-CN' ? d.universe?.nameZh || d.universe?.nameEn || d.symbol : d.universe?.nameEn || d.symbol}
                fallback={(d.news ?? []).map((n, i) => ({
                  id: `fb-${i}`,
                  title: n.title,
                  url: n.link,
                  publisher: n.publisher,
                  source: 'yahoo-fallback',
                  lang: 'en',
                  publishedAt: n.time ?? 0,
                }))}
              />

              {/* AI 三层分析 */}
              <AiReport symbol={d.symbol} />
            </>
          )}
        </>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UNIVERSE, UNIVERSE_BY_SYMBOL, MARKETS, SECTORS, MARKET_CURRENCY } from '@/lib/universe'
import { getQuotes } from '@/lib/quotes'
import { yahooQuoteSummary } from '@/lib/yahoo'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const revalidate = 1800

type Params = { params: Promise<{ symbol: string }> }

function pick(o: any, keys: string[]): any {
  if (!o) return null
  for (const k of keys) {
    const v = o[k]
    if (v && typeof v === 'object' && 'raw' in v) return v.raw
    if (v !== undefined && v !== null && v !== '') return v
  }
  return null
}

function num(v: any): number | null {
  const n = typeof v === 'string' ? Number(v.replace(/[^0-9.\-]/g, '')) : v
  return typeof n === 'number' && isFinite(n) ? n : null
}

function fmtBig(n: number | null, cur: string): string {
  if (n === null) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e12) return `${cur} ${(n / 1e12).toFixed(2)} 万亿`
  if (abs >= 1e8) return `${cur} ${(n / 1e8).toFixed(2)} 亿`
  if (abs >= 1e4) return `${cur} ${(n / 1e4).toFixed(2)} 万`
  return `${cur} ${n.toFixed(2)}`
}

function pct(v: number | null): string {
  if (v === null) return '—'
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`
}

const MARKET_LABEL = Object.fromEntries(MARKETS.map((m) => [m.key, m.label.zh])) as Record<string, string>
const SECTOR_LABEL = Object.fromEntries(SECTORS.map((s) => [s.key, s.label.zh])) as Record<string, string>

function findCompany(raw: string) {
  const s = decodeURIComponent(raw).toUpperCase()
  return UNIVERSE_BY_SYMBOL[s] ?? null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { symbol } = await params
  const u = findCompany(symbol)
  if (!u) return { title: '未找到该公司' }
  const sym = u.s
  const title = `${u.n.zh}（${sym}）股价、财报与 AI 投研分析 · ${MARKET_LABEL[u.mkt] ?? ''}`
  const description = `查看 ${u.n.zh}（${sym}，${u.n.en}）的实时股价、市值、估值指标与财务要点。${SECTOR_LABEL[u.sec] ?? ''}行业、${MARKET_LABEL[u.mkt] ?? ''}市场。${SITE_NAME} 用真实行情与财报数据生成三层 AI 投研分析。`
  const url = `${SITE_URL}/stock/${sym.toLowerCase()}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article' },
  }
}

export default async function StockPage({ params }: Params) {
  const { symbol } = await params
  const u = findCompany(symbol)
  if (!u) notFound()

  const sym = u.s
  const cur = u.cur || MARKET_CURRENCY[u.mkt] || 'USD'

  const [quoteRes, summRes] = await Promise.allSettled([
    getQuotes([sym]),
    yahooQuoteSummary(sym, 'summaryDetail,defaultKeyStatistics,financialData,price,assetProfile'),
  ])

  const q: any = quoteRes.status === 'fulfilled' ? quoteRes.value?.[sym] ?? null : null
  const summ: any =
    summRes.status === 'fulfilled' ? summRes.value?.quoteSummary?.result?.[0] ?? null : null

  const price = num(pick(q, ['regularMarketPrice', 'price', 'last', 'current', 'close']))
  const changePct = num(pick(q, ['regularMarketChangePercent', 'changePercent', 'pct', 'change_pct']))
  const marketCap = num(pick(q, ['marketCap', 'mktCap'])) ?? num(pick(summ?.price, ['marketCap']))
  const pe = num(pick(q, ['trailingPE', 'pe'])) ?? num(pick(summ?.summaryDetail, ['trailingPE']))
  const pb = num(pick(q, ['priceToBook'])) ?? num(pick(summ?.defaultKeyStatistics, ['priceToBook']))
  const hi = num(pick(q, ['fiftyTwoWeekHigh'])) ?? num(pick(summ?.summaryDetail, ['fiftyTwoWeekHigh']))
  const lo = num(pick(q, ['fiftyTwoWeekLow'])) ?? num(pick(summ?.summaryDetail, ['fiftyTwoWeekLow']))
  const divYield = num(pick(q, ['dividendYield'])) ?? num(pick(summ?.summaryDetail, ['dividendYield']))
  const volume = num(pick(q, ['regularMarketVolume', 'volume']))
  const profile: string = pick(summ?.assetProfile, ['longBusinessSummary']) || ''

  const sameMarket = UNIVERSE.filter((x) => x.mkt === u.mkt && x.s !== sym).slice(0, 12)
  const sameSector = UNIVERSE.filter((x) => x.sec === u.sec && x.mkt !== u.mkt).slice(0, 12)

  const metrics: { label: string; value: string }[] = [
    { label: '最新价', value: price !== null ? `${cur} ${price.toFixed(2)}` : '—' },
    { label: '日内涨跌', value: pct(changePct) },
    { label: '市值', value: fmtBig(marketCap, cur) },
    { label: '市盈率 TTM', value: pe !== null ? pe.toFixed(2) : '—' },
    { label: '市净率', value: pb !== null ? pb.toFixed(2) : '—' },
    { label: '52 周最高', value: hi !== null ? `${cur} ${hi.toFixed(2)}` : '—' },
    { label: '52 周最低', value: lo !== null ? `${cur} ${lo.toFixed(2)}` : '—' },
    { label: '股息率', value: divYield !== null ? `${(divYield * (divYield < 1 ? 100 : 1)).toFixed(2)}%` : '—' },
    { label: '成交量', value: volume !== null ? fmtBig(volume, '股') : '—' },
    { label: '上市市场', value: MARKET_LABEL[u.mkt] ?? u.mkt },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    name: u.n.en,
    alternateName: [u.n.zh, u.n.ja].filter(Boolean),
    tickerSymbol: sym,
    url: `${SITE_URL}/stock/${sym.toLowerCase()}`,
    description: profile || `${u.n.zh}（${u.n.en}）是${MARKET_LABEL[u.mkt] ?? ''}市场的${SECTOR_LABEL[u.sec] ?? ''}公司。`,
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 text-stone-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-700">首页</Link>
        <span>/</span>
        <Link href={`/market/${u.mkt.toLowerCase()}`} className="hover:text-amber-700">
          {MARKET_LABEL[u.mkt] ?? u.mkt}
        </Link>
        <span>/</span>
        <span className="text-stone-700">{u.n.zh}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {u.n.zh}（{sym}）股价与投研分析
        </h1>
        <p className="mt-2 text-stone-600">
          {u.n.en} · {MARKET_LABEL[u.mkt] ?? u.mkt}市场 · {SECTOR_LABEL[u.sec] ?? ''}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-medium">关键指标</h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-stone-200 bg-white/70 p-3">
              <dt className="text-xs text-stone-500">{m.label}</dt>
              <dd className="mt-1 text-base font-medium tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-medium">公司概况</h2>
        <p className="leading-7 text-stone-700">
          {u.n.zh}（英文名 {u.n.en}，股票代码 {sym}）在{MARKET_LABEL[u.mkt] ?? ''}市场上市，
          属于{SECTOR_LABEL[u.sec] ?? ''}行业，当前处于{STAGE_TEXT[u.stage]}阶段。
          {u.tags?.length ? `核心标签：${u.tags.join('、')}。` : ''}
        </p>
        {profile ? (
          <p className="mt-3 line-clamp-6 leading-7 text-stone-600">{profile}</p>
        ) : (
          <p className="mt-3 leading-7 text-stone-600">
            该公司的实时行情、估值与财务数据由 Yahoo Finance 与腾讯财经提供，可能存在 15 分钟延迟，以交易所披露为准。
          </p>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-medium">AI 三层投研框架</h2>
        <ol className="space-y-3 leading-7 text-stone-700">
          <li>
            <strong>宏观周期层</strong>：利率、通胀、汇率与流动性如何影响{MARKET_LABEL[u.mkt] ?? ''}市场的估值中枢。
          </li>
          <li>
            <strong>行业格局层</strong>：用 PEST、波特五力与产业链位置判断{SECTOR_LABEL[u.sec] ?? ''}行业的利润分配。
          </li>
          <li>
            <strong>公司质地层</strong>：把 {u.n.zh} 的增速、利润率、ROE 与现金流放进同行业横向对比。
          </li>
        </ol>
        <p className="mt-4 text-sm text-stone-500">
          需要完整报告？<Link href="/" className="text-amber-700 underline">回到终端</Link> 可基于真实财报数据生成三层 AI 分析。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-medium">同市场公司</h2>
        <ul className="flex flex-wrap gap-2">
          {sameMarket.map((x) => (
            <li key={x.s}>
              <Link
                href={`/stock/${x.s.toLowerCase()}`}
                className="inline-block rounded-full border border-stone-300 px-3 py-1 text-sm hover:border-amber-600 hover:text-amber-700"
              >
                {x.n.zh} {x.s}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-medium">{SECTOR_LABEL[u.sec] ?? ''}行业公司</h2>
        <ul className="flex flex-wrap gap-2">
          {sameSector.map((x) => (
            <li key={x.s}>
              <Link
                href={`/stock/${x.s.toLowerCase()}`}
                className="inline-block rounded-full border border-stone-300 px-3 py-1 text-sm hover:border-amber-600 hover:text-amber-700"
              >
                {x.n.zh} {x.s}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

const STAGE_TEXT: Record<string, string> = {
  startup: '初创',
  growth: '成长',
  mature: '成熟',
  turnaround: '转型/衰退',
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UNIVERSE, MARKETS, MARKET_CURRENCY } from '@/lib/universe'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const revalidate = 3600

type Params = { params: Promise<{ key: string }> }

function findMarket(raw: string) {
  const k = decodeURIComponent(raw).toUpperCase()
  return MARKETS.find((m) => m.key === k) ?? null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { key } = await params
  const m = findMarket(key)
  if (!m) return { title: '未找到该市场' }
  const title = `${m.label.zh}股市行情与公司列表 · ${SITE_NAME}`
  const description = `${m.label.zh}市场主要上市公司列表：实时股价、市值与估值指标，覆盖${UNIVERSE.filter((u) => u.mkt === m.key).length} 家公司，支持 AI 投研分析。`
  const url = `${SITE_URL}/market/${m.key.toLowerCase()}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: SITE_NAME } }
}

export default async function MarketPage({ params }: Params) {
  const { key } = await params
  const m = findMarket(key)
  if (!m) notFound()

  const list = UNIVERSE.filter((u) => u.mkt === m.key)
  const cur = MARKET_CURRENCY[m.key]

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 text-stone-800">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-700">首页</Link>
        <span>/</span>
        <span className="text-stone-700">{m.label.zh}</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight">{m.label.zh}股市行情与公司列表</h1>
      <p className="mt-2 text-stone-600">
        共 {list.length} 家公司，计价货币 {cur}。点击查看单家公司的实时行情、估值指标与 AI 投研框架。
      </p>

      <ul className="mt-8 divide-y divide-stone-200">
        {list.map((u) => (
          <li key={u.s} className="py-3">
            <Link href={`/stock/${u.s.toLowerCase()}`} className="flex items-baseline justify-between gap-3 hover:text-amber-700">
              <span className="font-medium">
                {u.n.zh} <span className="text-sm text-stone-500">{u.s}</span>
              </span>
              <span className="text-sm text-stone-500">{u.n.en}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UNIVERSE, SECTORS, MARKETS } from '@/lib/universe'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const revalidate = 3600

type Params = { params: Promise<{ key: string }> }

function findSector(raw: string) {
  const k = decodeURIComponent(raw).toLowerCase()
  return SECTORS.find((s) => s.key === k) ?? null
}

const MK = Object.fromEntries(MARKETS.map((m) => [m.key, m.label.zh])) as Record<string, string>

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { key } = await params
  const s = findSector(key)
  if (!s) return { title: '未找到该行业' }
  const title = `${s.label.zh}行业全球上市公司与行情 · ${SITE_NAME}`
  const description = `${s.label.zh}行业全球上市公司列表：实时股价、市值与估值指标，横跨美国、中国A股、香港、日本、韩国、印度、欧洲七大市场。`
  const url = `${SITE_URL}/sector/${s.key}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: SITE_NAME } }
}

export default async function SectorPage({ params }: Params) {
  const { key } = await params
  const s = findSector(key)
  if (!s) notFound()

  const list = UNIVERSE.filter((u) => u.sec === s.key)

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 text-stone-800">
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-700">首页</Link>
        <span>/</span>
        <span className="text-stone-700">{s.label.zh}</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight">{s.label.zh}行业全球上市公司</h1>
      <p className="mt-2 text-stone-600">共 {list.length} 家公司，按市场归类。点击进入单家公司查看行情与估值。</p>

      <ul className="mt-8 divide-y divide-stone-200">
        {list.map((u) => (
          <li key={u.s} className="py-3">
            <Link href={`/stock/${u.s.toLowerCase()}`} className="flex items-baseline justify-between gap-3 hover:text-amber-700">
              <span className="font-medium">
                {u.n.zh} <span className="text-sm text-stone-500">{u.s}</span>
              </span>
              <span className="text-sm text-stone-500">{MK[u.mkt] ?? u.mkt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

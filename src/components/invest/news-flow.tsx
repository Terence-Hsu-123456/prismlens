'use client'

// 全球财经资讯流：多媒体聚合 + 无限滚动加载（一直往下滑一直有）
// NewsFlow：全局资讯 tab（语言过滤 + 统计）；CompanyNews：个股相关新闻（无限滚动）
import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Loader2, Newspaper, RefreshCw, Rss } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'
import { fmtRelative } from '@/lib/format'
import type { Lang } from '@/lib/i18n'
import type { DictKey } from '@/lib/i18n'

type NewsItem = {
  id: string
  title: string
  url: string
  publisher: string
  source: string
  lang: string
  publishedAt: number
}

type NewsResp = {
  items: NewsItem[]
  total: number
  hasMore: boolean
  publishers: number
  error?: string
}

const PAGE_SIZE = 20

// ---------- 核心列表（无限滚动） ----------
function useNewsFeed(params: { symbol?: string; name?: string; lang?: string }) {
  const { t, lang: uiLang } = useI18n()
  const [items, setItems] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [publishers, setPublishers] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const pageRef = useRef(1)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const symbol = params.symbol
  const name = params.name
  const lang = params.lang
  const key = `${symbol ?? ''}|${lang ?? ''}|${refreshTick}`

  const apply = (j: NewsResp, replace: boolean) => {
    setTotal(j.total ?? 0)
    setPublishers(j.publishers ?? 0)
    setHasMore(!!j.hasMore)
    setItems((prev) => {
      const next = j.items ?? []
      if (replace) return next
      const seen = new Set(prev.map((p) => p.id))
      return [...prev, ...next.filter((n) => !seen.has(n.id))]
    })
  }

  // 初次加载 / key（symbol/lang/刷新）变化重置
  useEffect(() => {
    let alive = true
    pageRef.current = 1
    const sp = new URLSearchParams({ page: '1', pageSize: String(PAGE_SIZE) })
    if (symbol) sp.set('symbol', symbol)
    if (name) sp.set('name', name)
    if (lang && lang !== 'all') sp.set('lang', lang)
    ;(async () => {
      try {
        const res = await fetch(`/api/news?${sp.toString()}`, { cache: 'no-store' })
        const j: NewsResp = await res.json()
        if (!alive) return
        apply(j, true)
      } catch {
        /* keep current state */
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [key])

  // 加载下一页（事件驱动：IO 回调或手动按钮）
  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return
    const page = pageRef.current + 1
    setLoadingMore(true)
    pageRef.current = page
    const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (symbol) sp.set('symbol', symbol)
    if (name) sp.set('name', name)
    if (lang && lang !== 'all') sp.set('lang', lang)
    ;(async () => {
      try {
        const res = await fetch(`/api/news?${sp.toString()}`, { cache: 'no-store' })
        const j: NewsResp = await res.json()
        apply(j, false)
      } catch {
        pageRef.current = page - 1
      } finally {
        setLoadingMore(false)
      }
    })()
  }

  // 通过 ref 让 IO 始终调用最新 loadMore，避免频繁断开/重连 observer
  const loadMoreRef = useRef<() => void>(() => {})
  loadMoreRef.current = loadMore

  // 无限滚动：sentinel 进入视口时加载下一页
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRef.current()
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const refresh = () => setRefreshTick((v) => v + 1)

  return { t, uiLang, items, total, publishers, hasMore, loading, loadingMore, refresh, loadMore, sentinelRef }
}

function NewsRow({ n }: { n: NewsItem }) {
  const { t, lang } = useI18n()
  return (
    <li>
      <a
        href={n.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 transition hover:bg-stone-100"
      >
        <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-stone-400 transition group-hover:text-amber-700" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] leading-snug text-stone-800 group-hover:text-stone-900">{n.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
            <span className="rounded border border-stone-300 bg-stone-100 px-1.5 py-px font-medium text-stone-500">{n.publisher}</span>
            {n.lang !== 'all' && <span className="uppercase text-stone-400">{n.lang}</span>}
            <span>· {n.publishedAt ? fmtRelative(n.publishedAt, lang) : t('common.live')}</span>
          </span>
        </span>
      </a>
    </li>
  )
}

function ListFooter({ loadingMore, hasMore, count, onMore }: { loadingMore: boolean; hasMore: boolean; count: number; onMore: () => void }) {
  const { t } = useI18n()
  if (loadingMore)
    return (
      <div className="flex items-center justify-center gap-2 py-5 text-xs text-stone-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
        {t('news.loadingMore')}
      </div>
    )
  if (hasMore)
    return (
      <div className="flex justify-center py-4">
        <Button variant="outline" size="sm" onClick={onMore} className="gap-1.5 border-stone-300 bg-white text-xs text-stone-700 hover:bg-stone-100">
          <Rss className="h-3.5 w-3.5 text-amber-700" />
          {t('news.loadingMore')}
        </Button>
      </div>
    )
  if (count > 0) return <div className="py-4 text-center text-[11px] text-stone-400">{t('news.noMore')}</div>
  return null
}

// ---------- 全局资讯流（tab 内容） ----------
export function NewsFlow() {
  const { t, items, total, publishers, hasMore, loading, loadingMore, refresh, loadMore, sentinelRef } = useNewsFeed({ lang: 'all' })
  const [filter, setFilter] = useState<'all' | 'zh' | 'en' | 'ja'>('all')

  // 语言过滤在前端做（数据仍全量加载，保证翻页体验）
  const shown = filter === 'all' ? items : items.filter((n) => n.lang === filter)

  const FILTERS: { k: 'all' | 'zh' | 'en' | 'ja'; label: string }[] = [
    { k: 'all', label: t('news.filterAll') },
    { k: 'zh', label: '中文' },
    { k: 'en', label: 'English' },
    { k: 'ja', label: '日本語' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <Newspaper className="h-5 w-5 text-amber-700" />
            {t('news.title')}
          </h2>
          <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-stone-500">{t('news.desc')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-1.5 border-stone-300 bg-white text-xs text-stone-700 hover:bg-stone-100">
          <RefreshCw className={`h-3.5 w-3.5 text-amber-700 ${loading ? 'animate-spin' : ''}`} />
          {t('news.refresh')}
        </Button>
      </div>

      {/* 统计 + 语言过滤 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1 border-amber-700/30 bg-amber-700/10 text-[11px] text-amber-800">
          {t('news.media')} · {publishers}
        </Badge>
        <Badge variant="outline" className="gap-1 border-stone-300 bg-white text-[11px] text-stone-700">
          {t('news.articles')} · {total}
        </Badge>
        <div className="ml-auto flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                filter === f.k
                  ? 'border-amber-700/50 bg-amber-700/10 text-amber-800'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="p-2.5">
          {loading ? (
            <ul className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="px-2.5 py-3">
                  <div className="h-3.5 w-3/4 rounded bg-stone-100" />
                  <div className="mt-2 h-3 w-40 rounded bg-stone-100" />
                </li>
              ))}
            </ul>
          ) : shown.length ? (
            <ul className="space-y-0.5">
              {shown.map((n) => (
                <NewsRow key={n.id} n={n} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-stone-400">
              <Loader2 className="h-5 w-5 animate-spin text-amber-700/70" />
              <span className="text-xs">{t('news.empty')}</span>
            </div>
          )}

          {/* 无限滚动哨兵 */}
          <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
          {!loading && (
            <ListFooter
              loadingMore={loadingMore}
              hasMore={hasMore && filter === 'all'}
              count={shown.length}
              onMore={loadMore}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- 个股相关新闻（公司分析页内嵌，无限滚动） ----------
export function CompanyNews({ symbol, name, fallback }: { symbol: string; name: string; fallback: NewsItem[] }) {
  const { t, items, hasMore, loading, loadingMore, refresh, loadMore, sentinelRef } = useNewsFeed({ symbol, name })
  const list = items.length ? items : fallback

  return (
    <Card className="border-stone-200 bg-white">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <Newspaper className="h-4 w-4 text-amber-700" />
            {t('co.news')}
          </h3>
          <button onClick={refresh} className="flex items-center gap-1 text-[11px] text-stone-500 transition hover:text-amber-800" aria-label={t('news.refresh')}>
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            {t('news.refresh')}
          </button>
        </div>
        {loading && !list.length ? (
          <ul className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="px-2 py-2.5">
                <div className="h-3.5 w-4/5 rounded bg-stone-100" />
                <div className="mt-2 h-3 w-36 rounded bg-stone-100" />
              </li>
            ))}
          </ul>
        ) : list.length ? (
          <ul className="max-h-[28rem] space-y-0.5 overflow-y-auto pretty-scroll pr-1">
            {list.map((n, i) => (
              <NewsRow key={n.id ?? `fb-${i}`} n={n} />
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-xs text-stone-400">{t('news.empty')}</p>
        )}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
        {!loading && list.length > 0 && (
          <ListFooter loadingMore={loadingMore} hasMore={hasMore && items.length > 0} count={items.length} onMore={loadMore} />
        )}
      </CardContent>
    </Card>
  )
}

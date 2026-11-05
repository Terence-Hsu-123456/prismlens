'use client'

import { Clock, MousePointerClick, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Sparkline from './sparkline'
import { useLive } from '@/hooks/use-live'
import { useI18n } from '@/hooks/use-i18n'
import { useAppStore } from '@/lib/store'
import { fmtBigMoney, fmtClock, fmtPct, fmtPrice, type Lang } from '@/lib/format'
import type { DictKey } from '@/lib/i18n'

type IndexItem = {
  symbol: string
  key: string
  group: string
  currency: string
  tz?: string
  price: number | null
  changePercent: number | null
  spark: number[]
}
type PulseItem = { symbol: string; key: string; kind: string; price: number | null; changePercent: number | null }
type MarketsData = { indices: IndexItem[]; pulse: PulseItem[]; asOf: number; ok: boolean; partial: boolean }

const GROUPS: { key: string; titleKey: DictKey }[] = [
  { key: 'americas', titleKey: 'mkt.americas' },
  { key: 'asia', titleKey: 'mkt.asia' },
  { key: 'emea', titleKey: 'mkt.emea' },
]

function ChgChip({ chg, cls }: { chg: number | null; cls: string }) {
  if (chg == null || !isFinite(chg)) return <span className="text-xs text-stone-500">—</span>
  const up = chg > 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon className="h-3 w-3" />
      {fmtPct(chg)}
    </span>
  )
}

export default function MarketsPanel() {
  const { t, tone, toneBg, sparkColor, lang } = useI18n()
  const analyze = useAppStore((s) => s.analyze)
  const { data, error, loading, refresh } = useLive<MarketsData>('/api/markets', 60_000)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">{t('nav.markets')}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
            <MousePointerClick className="h-3.5 w-3.5 text-amber-700" />
            {t('mkt.autoNote')} · {t('mkt.clickHint')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {t('common.updatedAt')} {data ? fmtClock(data.asOf, lang) : '—'}
          </span>
          <button
            onClick={refresh}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:border-amber-700/40 hover:text-amber-800"
            aria-label={t('common.refresh')}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="flex items-center justify-between p-4 text-sm text-rose-700">
            <span>
              {t('common.error')} ({error})
            </span>
            <button onClick={refresh} className="underline underline-offset-2 hover:text-rose-700">
              {t('common.retry')}
            </button>
          </CardContent>
        </Card>
      )}
      {data?.partial && !error && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {t('common.degraded')}
        </p>
      )}

      {/* 宏观脉搏 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(loading && !data ? Array.from({ length: 6 }) : (data?.pulse ?? []).map((p) => p)).map((item, idx) => {
          const p = item as PulseItem | undefined
          return (
            <Card key={p?.symbol ?? idx} className="border-stone-200 bg-white">
              <CardContent className="p-3.5">
                {loading && !data ? (
                  <>
                    <Skeleton className="h-3 w-20 bg-stone-100" />
                    <Skeleton className="mt-2 h-5 w-16 bg-stone-100" />
                  </>
                ) : p ? (
                  <>
                    <div className="truncate text-[11px] text-stone-500">{t(p.key as DictKey)}</div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="truncate text-base font-bold text-stone-900">
                        {p.kind === 'pct' ? (p.price != null ? `${p.price.toFixed(2)}%` : '—') : p.price != null ? fmtPrice(p.price, p.key === 'pulse.dxy' ? 'USD' : p.key === 'pulse.vix' ? 'USD' : 'USD', lang) : '—'}
                      </span>
                    </div>
                    <div className="mt-1">
                      <ChgChip chg={p.changePercent} cls={toneBg(p.changePercent)} />
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 三大区域指数 */}
      {GROUPS.map((g) => {
        const items = (data?.indices ?? []).filter((i) => i.group === g.key)
        if (!items.length && loading) items.push(...(Array.from({ length: 4 }) as any))
        return (
          <section key={g.key}>
            <h3 className="mb-3 text-sm font-semibold text-stone-500">{t(g.titleKey)}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {loading && !data
                ? items.map((_, i) => (
                    <Card key={i} className="border-stone-200 bg-white">
                      <CardContent className="space-y-2 p-4">
                        <Skeleton className="h-3.5 w-24 bg-stone-100" />
                        <Skeleton className="h-6 w-28 bg-stone-100" />
                        <Skeleton className="h-9 w-full bg-stone-100" />
                      </CardContent>
                    </Card>
                  ))
                : items.map((idx) => (
                    <button
                      key={idx.symbol}
                      onClick={() => analyze(idx.symbol)}
                      className="group text-left outline-none"
                      aria-label={`${t(idx.key as DictKey)} ${t('common.analyze')}`}
                    >
                      <Card className="h-full border-stone-200 bg-white transition group-hover:border-amber-700/40 group-hover:bg-white group-focus-visible:ring-2 group-focus-visible:ring-amber-700/40">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-[13px] font-medium text-stone-700">{t(idx.key as DictKey)}</div>
                              <div className="mt-0.5 truncate font-mono text-[10px] text-stone-400">{idx.symbol}</div>
                            </div>
                            <ChgChip chg={idx.changePercent} cls={toneBg(idx.changePercent)} />
                          </div>
                          <div className={`mt-1.5 text-xl font-bold tabular-nums ${tone(idx.changePercent)}`}>
                            {idx.price != null ? fmtBigMoney(idx.price, idx.currency, lang) : '—'}
                          </div>
                          <div className="mt-2">
                            <Sparkline points={idx.spark} color={sparkColor(idx.changePercent)} />
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// 保证 lang 类型被引用（国际化格式化）
export type { Lang }

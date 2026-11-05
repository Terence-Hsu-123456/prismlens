'use client'

// 顶部行情跑马灯：只保留 6 个核心资产（美/中/港三大指数 + 黄金 + 原油），
// 无缝流动 + 悬停暂停 + 60 秒刷新。多复制一行以保证宽屏下无空隙。
import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { useAppStore } from '@/lib/store'
import type { DictKey } from '@/lib/i18n'

type TapeItem = { key: DictKey; symbol: string; price: number | null; pct: number | null }

// 只保留 6 个核心资产，其余全部砍掉
const TAPE_KEYS: DictKey[] = ['idx.gspc', 'idx.ixic', 'idx.sse', 'idx.hsi', 'pulse.gold', 'pulse.oil']

export default function TickerTape() {
  const { t } = useI18n()
  const analyze = useAppStore((s) => s.analyze)
  const [items, setItems] = useState<TapeItem[]>([])
  const [asOf, setAsOf] = useState<number>(0)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/markets', { cache: 'no-store' })
      if (!res.ok) return
      const j = await res.json()
      const all: TapeItem[] = []
      for (const i of j.indices ?? []) {
        all.push({ key: i.key, symbol: i.symbol, price: i.price, pct: i.changePercent })
      }
      for (const p of j.pulse ?? []) {
        all.push({ key: p.key, symbol: p.symbol, price: p.price, pct: p.changePercent })
      }
      const map = TAPE_KEYS.map((k) => all.find((x) => x.key === k)).filter((x): x is TapeItem => !!x)
      if (map.length) {
        setItems(map)
        setAsOf(j.asOf ?? Date.now())
      }
    } catch {
      /* 静默：跑马灯失败不影响主界面 */
    }
  }, [])

  useEffect(() => {
    // 首次加载延后到宏任务，避免 effect 内同步 setState；之后每 60 秒刷新
    const t0 = setTimeout(load, 0)
    const timer = setInterval(load, 60_000)
    return () => {
      clearTimeout(t0)
      clearInterval(timer)
    }
  }, [load])

  // 骨架占位，避免布局跳动
  if (!items.length) {
    return (
      <div className="h-9 overflow-hidden border-b border-stone-200/80 bg-white" aria-hidden="true">
        <div className="flex h-9 items-center gap-8 px-4 opacity-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3.5 w-32 rounded bg-stone-200" />
          ))}
        </div>
      </div>
    )
  }

  const cell = (it: TapeItem, dup: number) => {
    const up = (it.pct ?? 0) > 0.001
    const down = (it.pct ?? 0) < -0.001
    const arrow = up ? '▲' : down ? '▼' : '◆'
    const cls = up ? 'text-emerald-600' : down ? 'text-rose-600' : 'text-stone-400'
    return (
      <button
        key={`${it.symbol}-${dup}`}
        onClick={() => analyze(it.symbol)}
        aria-label={`${t(it.key)} ${it.price ?? ''} ${it.pct ?? ''}%`}
        className="group flex shrink-0 items-center gap-2 px-4 py-1.5 transition hover:bg-amber-700/5"
      >
        <span className="whitespace-nowrap text-[12px] font-bold text-stone-600 group-hover:text-amber-800">{t(it.key)}</span>
        {it.price != null && (
          <span className="whitespace-nowrap text-[12px] font-semibold tabular-nums text-stone-900">
            {it.price >= 1000 ? it.price.toLocaleString('en-US', { maximumFractionDigits: 2 }) : it.price}
          </span>
        )}
        <span className={`flex items-center gap-0.5 whitespace-nowrap text-[12px] font-bold tabular-nums ${cls}`}>
          <span className="text-[9px]">{arrow}</span>
          {it.pct != null ? `${Math.abs(it.pct).toFixed(2)}%` : '—'}
        </span>
        <span className="ml-2 h-3.5 w-px bg-stone-200" aria-hidden="true" />
      </button>
    )
  }

  // 两半各放两遍 6 个资产，保证 50% 位移后仍无缝覆盖宽屏
  return (
    <div
      className="relative h-9 overflow-hidden border-b border-stone-200/80 bg-white"
      role="marquee"
      aria-label="Global market ticker"
      title={asOf ? new Date(asOf).toLocaleString() : undefined}
    >
      {/* 左右渐隐遮罩 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />
      <div className="ticker-track flex h-9 w-max items-center" style={{ ['--ticker-duration' as any]: '40s' }}>
        {items.map((it) => cell(it, 1))}
        {items.map((it) => cell(it, 2))}
        {items.map((it) => cell(it, 3))}
        {items.map((it) => cell(it, 4))}
      </div>
    </div>
  )
}

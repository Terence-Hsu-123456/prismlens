'use client'

import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fmtChartFull, fmtChartTick, fmtCompact, fmtPrice, type Lang } from '@/lib/format'

type P = { t: number; close: number }

export default function PriceChart({
  points,
  currency,
  lang,
  intraday,
  timeZone,
  color,
}: {
  points: P[]
  currency: string
  lang: Lang
  intraday: boolean
  timeZone?: string | null
  color: string
}) {
  const uid = useId().replace(/:/g, '')
  const gradId = `pcGrad-${uid}`
  const data = points.map((p) => ({ t: p.t, close: p.close }))

  const fmtAxis = (v: number) => {
    if (Math.abs(v) >= 10000) return fmtCompact(v, lang)
    return v.toFixed(Math.abs(v) < 1 ? 3 : v < 100 ? 1 : 0)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="t"
          tickFormatter={(t: number) => fmtChartTick(t, lang, intraday, timeZone ?? undefined)}
          minTickGap={52}
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={['auto', 'auto']}
          orientation="right"
          width={68}
          tickFormatter={fmtAxis}
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ stroke: '#52525b', strokeDasharray: '3 3' }}
          content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as P
            return (
              <div className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs shadow-xl">
                <div className="text-stone-500">{fmtChartFull(d.t, lang, intraday, timeZone ?? undefined)}</div>
                <div className="mt-0.5 font-semibold text-stone-900">{fmtPrice(d.close, currency, lang)}</div>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

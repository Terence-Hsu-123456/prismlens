'use client'

// 迷你走势线（纯 SVG，无依赖）
export default function Sparkline({
  points,
  color,
  className = 'h-9 w-full',
}: {
  points: number[]
  color: string
  className?: string
}) {
  if (!points || points.length < 2) {
    return <div className={`${className} rounded bg-white`} />
  }
  const w = 120
  const h = 36
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const step = w / (points.length - 1)
  const coords = points.map((p, i) => {
    const x = (i * step).toFixed(1)
    const y = (h - 3 - ((p - min) / span) * (h - 6)).toFixed(1)
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

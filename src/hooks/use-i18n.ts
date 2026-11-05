'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { translate, type DictKey } from '@/lib/i18n'

// 涨跌颜色规范：中文/日文市场习惯红涨绿跌，英文习惯绿涨红跌
export function useI18n() {
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)

  const t = useCallback((k: DictKey) => translate(lang, k), [lang])
  const redUp = lang !== 'en-US'

  const tone = useCallback(
    (chg: number | null | undefined) => {
      if (chg == null || !isFinite(chg) || chg === 0) return 'text-stone-500'
      const up = chg > 0
      if (redUp) return up ? 'text-rose-600' : 'text-emerald-600'
      return up ? 'text-emerald-600' : 'text-rose-600'
    },
    [redUp]
  )

  const toneBg = useCallback(
    (chg: number | null | undefined) => {
      if (chg == null || !isFinite(chg) || chg === 0)
        return 'bg-stone-100 text-stone-600 border-stone-200'
      const up = chg > 0
      if (redUp) return up ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      return up ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
    },
    [redUp]
  )

  const sparkColor = useCallback(
    (chg: number | null | undefined) => {
      if (chg == null || !isFinite(chg) || chg === 0) return '#a8a29e'
      const up = chg > 0
      if (redUp) return up ? '#e11d48' : '#059669'
      return up ? '#059669' : '#e11d48'
    },
    [redUp]
  )

  return { lang, setLang, t, tone, toneBg, sparkColor, redUp }
}

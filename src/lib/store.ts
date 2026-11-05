import { create } from 'zustand'
import { isLang, type Lang } from './i18n'

export type TabKey = 'markets' | 'company' | 'screener' | 'primary' | 'news' | 'pricing'
export type Plan = 'free' | 'pro'

function lsSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* ignore */
  }
}

function lsGet(k: string): string | null {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}

function deviceId(): string {
  try {
    let d = localStorage.getItem('pl.device')
    if (!d) {
      d = 'dv_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      localStorage.setItem('pl.device', d)
    }
    return d
  } catch {
    return 'dv_anon'
  }
}

type AppState = {
  hydrated: boolean
  tab: TabKey
  lang: Lang
  symbol: string
  plan: Plan
  proExpiresAt: number | null
  subscribeOpen: boolean
  isPro: () => boolean
  openSubscribe: () => void
  closeSubscribe: () => void
  activatePro: (expiresAt: number) => void
  deactivate: () => void
  setTab: (t: TabKey) => void
  setLang: (l: Lang) => void
  setSymbol: (s: string) => void
  analyze: (s: string) => void
  hydrate: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  tab: 'markets',
  lang: 'zh-CN',
  symbol: '',
  plan: 'free',
  proExpiresAt: null,
  subscribeOpen: false,
  isPro: () => {
    const { plan, proExpiresAt } = get()
    return plan === 'pro' && (proExpiresAt == null || proExpiresAt > Date.now())
  },
  openSubscribe: () => set({ subscribeOpen: true }),
  closeSubscribe: () => set({ subscribeOpen: false }),
  activatePro: (expiresAt) => {
    set({ plan: 'pro', proExpiresAt: expiresAt, subscribeOpen: false })
    lsSet('pl.plan', 'pro')
    lsSet('pl.proExp', String(expiresAt))
  },
  deactivate: () => {
    set({ plan: 'free', proExpiresAt: null })
    lsSet('pl.plan', 'free')
    lsSet('pl.proExp', '')
  },
  setTab: (t) => set({ tab: t }),
  setLang: (l) => {
    set({ lang: l })
    lsSet('pl.lang', l)
    try {
      document.documentElement.lang = l
    } catch {
      /* ignore */
    }
  },
  setSymbol: (s) => {
    set({ symbol: s })
    lsSet('pl.symbol', s)
  },
  analyze: (s) => {
    set({ symbol: s, tab: 'company' })
    lsSet('pl.symbol', s)
  },
  hydrate: () => {
    if (get().hydrated) return
    try {
      const l = lsGet('pl.lang')
      const s = lsGet('pl.symbol')
      const lang: Lang = isLang(l) ? l : 'zh-CN'
      const plan = lsGet('pl.plan') === 'pro' ? 'pro' : 'free'
      const expRaw = lsGet('pl.proExp')
      const proExpiresAt = expRaw ? Number(expRaw) || null : null
      // 过期自动降级
      if (plan === 'pro' && proExpiresAt && proExpiresAt < Date.now()) {
        set({ hydrated: true, lang, symbol: s ?? '', plan: 'free', proExpiresAt: null })
        lsSet('pl.plan', 'free')
        lsSet('pl.proExp', '')
      } else {
        set({ hydrated: true, lang, symbol: s ?? '', plan, proExpiresAt })
      }
      document.documentElement.lang = lang
    } catch {
      set({ hydrated: true })
    }
  },
}))

export { deviceId }

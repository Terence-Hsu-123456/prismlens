'use client'

import { useEffect } from 'react'
import { Activity, Building2, Crown, Newspaper, SlidersHorizontal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Header from '@/components/invest/header'
import Footer from '@/components/invest/footer'
import TickerTape from '@/components/invest/ticker-tape'
import MarketsPanel from '@/components/invest/markets-panel'
import CompanyPanel from '@/components/invest/company-panel'
import ScreenerPanel from '@/components/invest/screener-panel'
import { NewsFlow } from '@/components/invest/news-flow'
import PricingPanel from '@/components/invest/pricing-panel'
import SubscribeDialog from '@/components/invest/subscribe-dialog'
import { useAppStore, type TabKey } from '@/lib/store'
import { useI18n } from '@/hooks/use-i18n'
import type { DictKey } from '@/lib/i18n'

export default function Home() {
  const { t } = useI18n()
  const tab = useAppStore((s) => s.tab)
  const setTab = useAppStore((s) => s.setTab)
  const hydrate = useAppStore((s) => s.hydrate)
  const openSubscribe = useAppStore((s) => s.openSubscribe)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'markets', label: t('nav.markets'), icon: <Activity className="h-4 w-4" /> },
    { key: 'company', label: t('nav.company'), icon: <Building2 className="h-4 w-4" /> },
    { key: 'screener', label: t('nav.screener'), icon: <SlidersHorizontal className="h-4 w-4" /> },
    { key: 'news', label: t('nav.news'), icon: <Newspaper className="h-4 w-4" /> },
    { key: 'pricing', label: t('nav.pricing'), icon: <Crown className="h-4 w-4" /> },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f3ea] text-stone-800 selection:bg-amber-700/20">
      <Header />
      <TickerTape />

      <main className="flex-1">
        {/* 首屏：一句话 + 唯一按钮 */}
        <section className="border-b border-stone-200/80 bg-gradient-to-b from-[#f1ead9] to-[#f7f3ea]">
          <div className="mx-auto max-w-3xl px-4 pb-12 pt-10 text-center md:pb-16 md:pt-14">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-stone-900 md:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-stone-600">{t('hero.desc')}</p>

            {/* 全站唯一的主按钮：点击订阅 → 弹出二维码 → 付款解锁 */}
            <div className="mt-7">
              <Button
                onClick={openSubscribe}
                size="lg"
                className="min-h-[52px] rounded-xl bg-amber-700 px-8 text-base font-bold text-amber-50 shadow-md shadow-amber-900/10 transition hover:bg-amber-800"
              >
                <Crown className="h-5 w-5" />
                {t('hero.cta')}
              </Button>
              <button
                onClick={() => setTab('markets')}
                className="mt-3 block w-full text-sm font-medium text-stone-500 underline-offset-4 transition hover:text-amber-800 hover:underline"
              >
                {t('hero.try')}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-stone-500">
              {(['hero.chip1', 'hero.chip2', 'hero.chip3'] as DictKey[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-amber-700/60" aria-hidden="true" />
                  {t(k)}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-16">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-6">
            <TabsList
              aria-label="PrismLens navigation"
              className="no-scrollbar h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-sm"
            >
              {TABS.map((tb) => (
                <TabsTrigger
                  key={tb.key}
                  value={tb.key}
                  className="min-h-[40px] shrink-0 gap-2 rounded-lg px-4 py-2 text-sm text-stone-500 data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
                >
                  {tb.icon}
                  <span className="whitespace-nowrap">{tb.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="markets" className="mt-7 focus-visible:outline-none">
              <MarketsPanel />
            </TabsContent>
            <TabsContent value="company" className="mt-7 focus-visible:outline-none">
              <CompanyPanel />
            </TabsContent>
            <TabsContent value="screener" className="mt-7 focus-visible:outline-none">
              <ScreenerPanel />
            </TabsContent>
            <TabsContent value="news" className="mt-7 focus-visible:outline-none">
              <NewsFlow />
            </TabsContent>
            <TabsContent value="pricing" className="mt-7 focus-visible:outline-none">
              <PricingPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <SubscribeDialog />
    </div>
  )
}

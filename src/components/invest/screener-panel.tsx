'use client'

import { useMemo, useState } from 'react'
import { Loader2, MousePointerClick, RotateCcw, Crown, Sparkles, Wand2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useLive } from '@/hooks/use-live'
import { useI18n } from '@/hooks/use-i18n'
import { useAppStore } from '@/lib/store'
import { fmtBigMoney, fmtNum, fmtPct, fmtPrice, FLAGS } from '@/lib/format'
import { MARKETS, SECTORS, STAGES, type SectorKey, type StageKey } from '@/lib/universe'
import type { DictKey } from '@/lib/i18n'

type ScreenRow = {
  symbol: string
  nameZh: string
  nameEn: string
  nameJa: string
  market: string
  country: string
  sector: string
  stage: string
  tags: string[]
  price: number
  currency: string
  changePercent: number | null
  marketCap: number | null
  pe: number | null
  pb: number | null
  dividendYield: number | null
  roe: number | null
  profitMargin: number | null
  revenueGrowth: number | null
  asOf: number
  degraded: boolean
}
type ScreenerData = { rows: ScreenRow[]; total: number; universeSize: number; asOf: number; degraded: boolean }

const STAGE_CLS: Record<string, string> = {
  startup: 'border-teal-200 bg-teal-50 text-teal-700',
  growth: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  mature: 'border-amber-200 bg-amber-50 text-amber-800',
  turnaround: 'border-rose-200 bg-rose-50 text-rose-700',
}
const STAGE_KEY: Record<string, DictKey> = {
  startup: 'sc.stageStartup',
  growth: 'sc.stageGrowth',
  mature: 'sc.stageMature',
  turnaround: 'sc.stageTurnaround',
}
const SECTOR_KEY: Record<string, DictKey> = {
  tech: 'sec.tech',
  consumer: 'sec.consumer',
  finance: 'sec.finance',
  health: 'sec.health',
  energy: 'sec.energy',
  industrial: 'sec.industrial',
  materials: 'sec.materials',
  utility: 'sec.utility',
  comm: 'sec.comm',
  realestate: 'sec.realestate',
}
const MARKET_KEY: Record<string, DictKey> = {
  US: 'mkey.US',
  CN: 'mkey.CN',
  HK: 'mkey.HK',
  JP: 'mkey.JP',
  KR: 'mkey.KR',
  IN: 'mkey.IN',
  EU: 'mkey.EU',
}

export default function ScreenerPanel() {
  const { t, tone, lang } = useI18n()
  const analyze = useAppStore((s) => s.analyze)
  const openSubscribe = useAppStore((s) => s.openSubscribe)
  const plan = useAppStore((s) => s.plan)
  const proExpiresAt = useAppStore((s) => s.proExpiresAt)
  const isPro = plan === 'pro' && (proExpiresAt == null || proExpiresAt > Date.now())

  const [market, setMarket] = useState('ALL')
  const [sector, setSector] = useState('ALL')
  const [stage, setStage] = useState('ALL')
  const [cap, setCap] = useState('0')
  // 财报指标档位（'ALL' = 不限）
  const [pe, setPe] = useState('ALL')
  const [pb, setPb] = useState('ALL')
  const [roe, setRoe] = useState('ALL')
  const [pm, setPm] = useState('ALL')
  const [rev, setRev] = useState('ALL')
  const [div, setDiv] = useState('ALL')
  const [kw, setKw] = useState('')
  const [sort, setSort] = useState<{ key: 'chg' | 'mcap' | 'pe' | 'pb' | 'roe' | 'div'; dir: 'desc' | 'asc' } | null>(null)

  const [semOpen, setSemOpen] = useState(false)
  const [semQ, setSemQ] = useState('')
  const [semBusy, setSemBusy] = useState(false)
  const [sem, setSem] = useState<{ criteria: any; note: string; relaxed: boolean } | null>(null)
  const [override, setOverride] = useState<ScreenRow[] | null>(null)

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    p.set('market', market)
    p.set('sector', sector)
    p.set('stage', stage)
    p.set('cap', cap)
    if (pe !== 'ALL') p.set('peMax', pe)
    if (pb !== 'ALL') p.set('pbMax', pb)
    if (roe !== 'ALL') p.set('roeMin', roe)
    if (pm !== 'ALL') p.set('pmMin', pm)
    if (rev !== 'ALL') p.set('revMin', rev)
    if (div !== 'ALL') p.set('divMin', div)
    if (kw.trim()) p.set('kw', kw.trim())
    return p.toString()
  }, [market, sector, stage, cap, pe, pb, roe, pm, rev, div, kw])

  const live = useLive<ScreenerData>(`/api/screener?${qs}`, 60_000)

  const rows = useMemo(() => {
    const base = override ?? live.data?.rows ?? []
    if (!sort) return base
    const val = (r: ScreenRow) => {
      switch (sort.key) {
        case 'chg': return r.changePercent ?? -999
        case 'pe': return r.pe && r.pe > 0 ? r.pe : 9999
        case 'pb': return r.pb && r.pb > 0 ? r.pb : 999
        case 'roe': return r.roe ?? -999
        case 'div': return r.dividendYield ?? -1
        default: return r.marketCap ?? 0
      }
    }
    return [...base].sort((a, b) => (sort.dir === 'desc' ? val(b) - val(a) : val(a) - val(b)))
  }, [override, live.data, sort])

  // 财务指标是否仍在后台补齐（存在 roe 缺失的股票时提示）
  const roePending = useMemo(() => {
    const list = override ?? live.data?.rows ?? []
    return list.some((r) => r.roe == null)
  }, [override, live.data])

  const clearManual = () => {
    setOverride(null)
    setSem(null)
  }

  const reset = () => {
    setMarket('ALL')
    setSector('ALL')
    setStage('ALL')
    setCap('0')
    setPe('ALL')
    setPb('ALL')
    setRoe('ALL')
    setPm('ALL')
    setRev('ALL')
    setDiv('ALL')
    setKw('')
    clearManual()
    setSort(null)
  }

  const runSemantic = async () => {
    const q = semQ.trim()
    if (!q) return
    setSemBusy(true)
    try {
      const r = await fetch('/api/screener/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, lang }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error ?? 'failed')
      setSem({ criteria: j.criteria ?? {}, note: j.note ?? '', relaxed: !!j.relaxed })
      setOverride((j.rows ?? []) as ScreenRow[])
      // 同步手动筛选器
      const c = j.criteria ?? {}
      setMarket(c.market ?? 'ALL')
      setSector(Array.isArray(c.sectors) && c.sectors.length === 1 ? c.sectors[0] : 'ALL')
      setStage(c.stage ?? 'ALL')
      const capUsd = typeof c.capMinUSD === 'number' ? c.capMinUSD : 0
      setCap(capUsd >= 1e12 ? '1000000000000' : capUsd >= 5e11 ? '500000000000' : capUsd >= 1e11 ? '100000000000' : capUsd >= 2e10 ? '20000000000' : '0')
      // 数值 → 最近档位（反向映射）
      const peMaxN = typeof c.peMax === 'number' ? c.peMax : null
      setPe(peMaxN == null ? 'ALL' : peMaxN <= 15 ? '15' : peMaxN <= 30 ? '30' : '60')
      const pbMaxN = typeof c.pbMax === 'number' ? c.pbMax : null
      setPb(pbMaxN == null ? 'ALL' : pbMaxN <= 1.5 ? '1.5' : pbMaxN <= 3 ? '3' : '6')
      const roeMinN = typeof c.roeMin === 'number' ? c.roeMin : null
      setRoe(roeMinN == null ? 'ALL' : roeMinN >= 20 ? '20' : roeMinN >= 15 ? '15' : roeMinN >= 10 ? '10' : '0')
      const pmMinN = typeof c.pmMin === 'number' ? c.pmMin : null
      setPm(pmMinN == null ? 'ALL' : pmMinN >= 30 ? '30' : pmMinN >= 15 ? '15' : '5')
      const revMinN = typeof c.revMin === 'number' ? c.revMin : null
      setRev(revMinN == null ? 'ALL' : revMinN >= 20 ? '20' : revMinN >= 10 ? '10' : '0')
      const divMinN = typeof c.divMin === 'number' ? c.divMin : null
      setDiv(divMinN == null ? 'ALL' : divMinN >= 4 ? '4' : divMinN >= 2 ? '2' : divMinN > 0 ? '1' : 'ALL')
      setKw(Array.isArray(c.keywords) && c.keywords.length ? String(c.keywords[0]) : '')
    } catch {
      setSem(null)
      setOverride(null)
    } finally {
      setSemBusy(false)
    }
  }

  const sortBtn = (key: 'chg' | 'mcap' | 'pe' | 'pb' | 'roe' | 'div', label: string) => (
    <button
      onClick={() => setSort((s) => (s && s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }))}
      className={`inline-flex items-center gap-0.5 hover:text-amber-800 ${sort?.key === key ? 'text-amber-800' : ''}`}
    >
      {label}
      {sort?.key === key && <span className="text-[9px]">{sort.dir === 'desc' ? '▼' : '▲'}</span>}
    </button>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">{t('sc.title')}</h2>
          <p className="mt-0.5 text-xs text-stone-500">{t('sc.desc')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSemOpen((v) => !v)}
          className="gap-1.5 border-amber-700/30 bg-amber-700/10 text-xs text-amber-800 hover:bg-amber-700/20"
        >
          <Wand2 className="h-3.5 w-3.5" />
          {t('sc.semantic')}
        </Button>
      </div>

      {/* AI 语义筛股（专业版专享） */}
      {semOpen && (
        <Card className="border-amber-700/25 bg-amber-700/[0.03]">
          <CardContent className="space-y-3 p-4">
            {!isPro ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
                  <Crown className="h-5 w-5 text-amber-700" />
                </span>
                <div>
                  <div className="text-sm font-bold text-stone-900">{t('gate.semTitle')}</div>
                  <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">{t('gate.semDesc')}</p>
                </div>
                <Button
                  onClick={openSubscribe}
                  className="gap-2 bg-amber-500 text-[13px] font-bold text-amber-950 hover:bg-amber-400"
                >
                  <Crown className="h-4 w-4" />
                  {t('gate.unlock')}
                </Button>
              </div>
            ) : (
              <>
            <Textarea
              value={semQ}
              onChange={(e) => setSemQ(e.target.value)}
              placeholder={t('sc.semanticPh')}
              className="min-h-20 border-stone-200 bg-white text-sm focus-visible:ring-amber-700/30"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={runSemantic}
                disabled={semBusy || !semQ.trim()}
                size="sm"
                className="gap-1.5 bg-amber-700 text-amber-50 hover:bg-amber-800"
              >
                {semBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {t('sc.semanticRun')}
              </Button>
              {sem && (
                <Badge variant="outline" className="border-amber-700/40 text-[11px] text-amber-800">
                  {t('sc.parsed')}
                </Badge>
              )}
            </div>
            {sem && (
              <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-3">
                <div className="flex flex-wrap gap-1.5">
                  {sem.criteria?.market && sem.criteria.market !== 'ALL' && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-700">
                      {t(MARKET_KEY[sem.criteria.market] ?? 'common.all')}
                    </span>
                  )}
                  {Array.isArray(sem.criteria?.sectors) &&
                    sem.criteria.sectors.map((s: string) => (
                      <span key={s} className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-700">
                        {t(SECTOR_KEY[s] ?? 'common.all')}
                      </span>
                    ))}
                  {sem.criteria?.stage && sem.criteria.stage !== 'ALL' && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-700">
                      {t(STAGE_KEY[sem.criteria.stage] ?? 'common.all')}
                    </span>
                  )}
                  {typeof sem.criteria?.capMinUSD === 'number' && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-700">
                      ≥ ${fmtNum(sem.criteria.capMinUSD / 1e9, 0)}B
                    </span>
                  )}
                  {typeof sem.criteria?.peMax === 'number' && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-700">PE ≤ {sem.criteria.peMax}</span>
                  )}
                  {typeof sem.criteria?.divMin === 'number' && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-700">
                      {t('co.stat.div')} ≥ {sem.criteria.divMin}%
                    </span>
                  )}
                  {Array.isArray(sem.criteria?.keywords) &&
                    sem.criteria.keywords.map((k: string, i: number) => (
                      <span key={i} className="rounded-md bg-amber-700/10 px-1.5 py-0.5 text-[11px] text-amber-800">
                        {k}
                      </span>
                    ))}
                  {sem.relaxed && (
                    <span className="rounded-md bg-amber-700/10 px-1.5 py-0.5 text-[11px] text-amber-800">±</span>
                  )}
                </div>
                {sem.note && <p className="text-[11px] leading-relaxed text-stone-500">{sem.note}</p>}
                {sem.relaxed && (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
                    {t('sc.relaxed')}
                  </p>
                )}
              </div>
            )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 定量 + 定性条件 */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.market')}</Label>
            <Select value={market} onValueChange={(v) => { setMarket(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('common.all')}</SelectItem>
                {MARKETS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.flag} {t(MARKET_KEY[m.key])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.sector')}</Label>
            <Select value={sector} onValueChange={(v) => { setSector(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('common.all')}</SelectItem>
                {SECTORS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {t(SECTOR_KEY[s.key])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.stage')}</Label>
            <Select value={stage} onValueChange={(v) => { setStage(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('common.all')}</SelectItem>
                {STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {t(STAGE_KEY[s.key])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.cap')}</Label>
            <Select value={cap} onValueChange={(v) => { setCap(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="0">{t('sc.capAny')}</SelectItem>
                <SelectItem value="1000000000000">{t('sc.cap1t')}</SelectItem>
                <SelectItem value="500000000000">{t('sc.cap500b')}</SelectItem>
                <SelectItem value="100000000000">{t('sc.cap100b')}</SelectItem>
                <SelectItem value="20000000000">{t('sc.cap20b')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.peMax')}</Label>
            <Select value={pe} onValueChange={(v) => { setPe(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('sc.peAny')}</SelectItem>
                <SelectItem value="15">{t('sc.pe15')}</SelectItem>
                <SelectItem value="30">{t('sc.pe30')}</SelectItem>
                <SelectItem value="60">{t('sc.pe60')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.pb')}</Label>
            <Select value={pb} onValueChange={(v) => { setPb(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('sc.pbAny')}</SelectItem>
                <SelectItem value="1.5">{t('sc.pb15')}</SelectItem>
                <SelectItem value="3">{t('sc.pb3')}</SelectItem>
                <SelectItem value="6">{t('sc.pb6')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.roe')}</Label>
            <Select value={roe} onValueChange={(v) => { setRoe(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('sc.roeAny')}</SelectItem>
                <SelectItem value="20">{t('sc.roe20')}</SelectItem>
                <SelectItem value="15">{t('sc.roe15')}</SelectItem>
                <SelectItem value="10">{t('sc.roe10')}</SelectItem>
                <SelectItem value="0">{t('sc.roe0')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.pm')}</Label>
            <Select value={pm} onValueChange={(v) => { setPm(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('sc.pmAny')}</SelectItem>
                <SelectItem value="30">{t('sc.pm30')}</SelectItem>
                <SelectItem value="15">{t('sc.pm15')}</SelectItem>
                <SelectItem value="5">{t('sc.pm5')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.rev')}</Label>
            <Select value={rev} onValueChange={(v) => { setRev(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('sc.revAny')}</SelectItem>
                <SelectItem value="20">{t('sc.rev20')}</SelectItem>
                <SelectItem value="10">{t('sc.rev10')}</SelectItem>
                <SelectItem value="0">{t('sc.rev0')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-500">{t('sc.divMin')}</Label>
            <Select value={div} onValueChange={(v) => { setDiv(v); clearManual() }}>
              <SelectTrigger className="h-9 w-full border-stone-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-200 bg-white">
                <SelectItem value="ALL">{t('sc.divAny')}</SelectItem>
                <SelectItem value="4">{t('sc.div4')}</SelectItem>
                <SelectItem value="2">{t('sc.div2')}</SelectItem>
                <SelectItem value="1">{t('sc.div1')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-stone-500">{t('sc.kw')}</Label>
            <Input
              value={kw}
              onChange={(e) => { setKw(e.target.value); clearManual() }}
              placeholder={t('sc.kwPh')}
              className="h-9 border-stone-200 bg-white text-sm"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs text-stone-500 hover:text-stone-800">
              <RotateCcw className="h-3 w-3" />
              {t('sc.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 结果表 */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <span>
              {t('sc.results')}：
              <span className="font-bold text-amber-800">{rows.length}</span>
              <span className="ml-1">{t('sc.count')}</span>
              {override ? <span className="ml-2 text-amber-700/80">AI</span> : ''}
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick className="h-3 w-3" />
              {t('sc.hint')}
            </span>
          </div>
          {roePending && (
            <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
              {t('sc.roePending')}
            </p>
          )}
          {live.loading && !override ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-stone-400">{t('common.noData')}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200 pretty-scroll">
              <Table className="min-w-[880px]">
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="border-stone-200 hover:bg-transparent">
                    <TableHead className="text-stone-500">{t('sc.col.name')}</TableHead>
                    <TableHead className="text-stone-500">{t('sc.col.symbol')}</TableHead>
                    <TableHead className="text-right text-stone-500">{t('sc.col.price')}</TableHead>
                    <TableHead className="text-right text-stone-500">{sortBtn('chg', t('sc.col.chg'))}</TableHead>
                    <TableHead className="text-right text-stone-500">{sortBtn('mcap', t('sc.col.mcap'))}</TableHead>
                    <TableHead className="text-right text-stone-500">{sortBtn('pe', t('sc.col.pe'))}</TableHead>
                    <TableHead className="text-right text-stone-500">{sortBtn('pb', t('sc.col.pb'))}</TableHead>
                    <TableHead className="text-right text-stone-500">{sortBtn('roe', t('sc.col.roe'))}</TableHead>
                    <TableHead className="hidden text-right text-stone-500 md:table-cell">{sortBtn('div', t('sc.col.div'))}</TableHead>
                    <TableHead className="hidden text-stone-500 md:table-cell">{t('sc.col.stage')}</TableHead>
                    <TableHead className="hidden text-stone-500 lg:table-cell">{t('sc.col.sector')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow
                      key={r.symbol}
                      onClick={() => analyze(r.symbol)}
                      className="cursor-pointer border-stone-200 hover:bg-stone-100"
                    >
                      <TableCell className="max-w-44">
                        <div className="flex items-center gap-2">
                          <span>{FLAGS[r.country] ?? FLAGS[r.market] ?? '🌐'}</span>
                          <span className="truncate text-[13px] font-medium text-stone-800">
                            {lang === 'zh-CN' ? r.nameZh : lang === 'ja-JP' ? r.nameJa || r.nameEn : r.nameEn}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-stone-500">{r.symbol}</TableCell>
                      <TableCell className="text-right text-[13px] tabular-nums text-stone-800">
                        {fmtPrice(r.price, r.currency, lang)}
                      </TableCell>
                      <TableCell className={`text-right text-[13px] tabular-nums ${tone(r.changePercent)}`}>
                        {fmtPct(r.changePercent)}
                      </TableCell>
                      <TableCell className="text-right text-[13px] tabular-nums text-stone-700">
                        {fmtBigMoney(r.marketCap, r.currency, lang)}
                      </TableCell>
                      <TableCell className="text-right text-[13px] tabular-nums text-stone-700">
                        {r.pe != null && r.pe > 0 ? r.pe.toFixed(1) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-[13px] tabular-nums text-stone-700">
                        {r.pb != null && r.pb > 0 ? r.pb.toFixed(1) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-[13px] tabular-nums text-stone-700">
                        {r.roe != null ? <span className={r.roe >= 15 ? 'font-semibold text-emerald-700' : ''}>{r.roe.toFixed(1)}%</span> : '—'}
                      </TableCell>
                      <TableCell className="hidden text-right text-[13px] tabular-nums text-stone-700 md:table-cell">
                        {r.dividendYield != null ? fmtPct(r.dividendYield, 1) : '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] ${STAGE_CLS[r.stage] ?? ''}`}>
                          {t(STAGE_KEY[r.stage] ?? 'sc.stageMature')}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-[12px] text-stone-500 lg:table-cell">
                        {t(SECTOR_KEY[r.sector] ?? 'sec.tech')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

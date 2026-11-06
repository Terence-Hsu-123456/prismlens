'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Rocket, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/hooks/use-i18n'
import { useAppStore } from '@/lib/store'
import type { DictKey } from '@/lib/i18n'

type Round = {
  id: string
  company: string
  companyEn: string
  market: string
  sector: string
  stage: string
  roundLabel: string
  date: string
  amountUsd: number | null
  valuationUsd: number | null
  leadInvestors: string
  desc: string
  tags: string[]
  source?: string
  publisher?: string
}
type PmData = {
  rounds: Round[]
  stats: { companies: number; totalAmount: number; medianValuation: number | null; latest: string; aiCount?: number; byStage?: Record<string, number>; byMarket?: Record<string, number> }
}

const STAGE_CLS: Record<string, string> = {
  angel: 'border-teal-300 bg-teal-50 text-teal-800',
  seed: 'border-teal-300 bg-teal-50 text-teal-800',
  a: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  b: 'border-amber-300 bg-amber-50 text-amber-800',
  c: 'border-orange-300 bg-orange-50 text-orange-800',
  d: 'border-orange-400 bg-orange-100 text-orange-900',
  e: 'border-rose-200 bg-rose-50 text-rose-700',
  f: 'border-rose-300 bg-rose-100 text-rose-800',
  pe: 'border-rose-300 bg-rose-50 text-rose-800',
  preipo: 'border-stone-300 bg-stone-100 text-stone-700',
}
const STAGE_KEY: Record<string, DictKey> = {
  angel: 'pm.stageAngel',
  seed: 'pm.stageAngel',
  a: 'pm.stageA',
  b: 'pm.stageB',
  c: 'pm.stageC',
  d: 'pm.stageD',
  e: 'pm.stageE',
  f: 'pm.stageF',
  pe: 'pm.stagePE',
  preipo: 'pm.stagePreIPO',
}
const MK_KEY: Record<string, DictKey> = {
  CN: 'pm.mkCN', US: 'pm.mkUS', EU: 'pm.mkEU', JP: 'pm.mkJP', KR: 'pm.mkKR',
  IN: 'pm.mkIN', SEA: 'pm.mkSEA', LATAM: 'pm.mkLATAM', MEA: 'pm.mkMEA', OTHER: 'pm.mkOther',
}
const MK_ORDER = ['CN', 'US', 'EU', 'JP', 'KR', 'IN', 'SEA', 'LATAM', 'MEA']
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
const STAGE_ORDER = ['angel', 'a', 'b', 'c', 'd', 'e', 'f', 'pe', 'preipo']

function fmtUsd(v: number | null): string {
  if (v == null || !isFinite(v)) return '—'
  const abs = Math.abs(v)
  if (abs >= 1e12) return `$${(v / 1e12).toFixed(abs >= 1e13 ? 0 : 1)}T`
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toFixed(0)}`
}

export default function PrimaryMarketPanel() {
  const { t } = useI18n()
  const analyze = useAppStore((s) => s.analyze)
  const [data, setData] = useState<PmData | null>(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState('ALL')
  const [mk, setMk] = useState('ALL')
  const [sector, setSector] = useState('ALL')

  useEffect(() => {
    let alive = true
    fetch('/api/primary-market', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j: PmData) => {
        if (alive) setData(j)
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const rounds = data?.rounds ?? []
  const stageOpts = useMemo(() => STAGE_ORDER.filter((s) => rounds.some((r) => r.stage === s || (s === 'angel' && r.stage === 'seed'))), [rounds])
  const mkOpts = useMemo(() => MK_ORDER.filter((m) => rounds.some((r) => r.market === m)), [rounds])
  const sectorOpts = useMemo(() => Array.from(new Set(rounds.map((r) => r.sector))), [rounds])
  const aiCount = data?.stats.aiCount ?? 0

  const filtered = useMemo(
    () =>
      rounds.filter(
        (r) =>
          (stage === 'ALL' || r.stage === stage || (stage === 'angel' && r.stage === 'seed')) &&
          (mk === 'ALL' || r.market === mk) &&
          (sector === 'ALL' || r.sector === sector)
      ),
    [rounds, stage, mk, sector]
  )

  const stat = (label: string, value: string) => (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
      <div className="text-[11px] font-medium text-stone-500">{label}</div>
      <div className="mt-1 text-lg font-bold tabular-nums text-stone-900">{value}</div>
    </div>
  )

  const chip = (key: string, active: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      key={key}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active ? 'border-amber-700 bg-amber-700 text-amber-50' : 'border-stone-300 bg-white text-stone-600 hover:border-amber-700/50 hover:text-amber-800'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
          <Rocket className="h-5 w-5 text-amber-700" />
          {t('pm.title')}
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-stone-500">{t('pm.desc')}</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stat(t('pm.companies'), data ? String(data.stats.companies) : '—')}
        {stat(t('pm.totalAmount'), data ? fmtUsd(data.stats.totalAmount) : '—')}
        {stat(t('pm.medianVal'), data ? fmtUsd(data.stats.medianValuation) : '—')}
        {stat(t('pm.recent'), data?.stats.latest ?? '—')}
      </div>
      {aiCount > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          <Sparkles className="mr-1 inline h-3 w-3" />
          {t('pm.aiHint').replace('{n}', String(aiCount))}
        </p>
      )}

      {/* 筛选 */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-medium text-stone-600">{t('pm.stage')}</span>
            {chip('all-stage', stage === 'ALL', () => setStage('ALL'), t('common.all'))}
            {stageOpts.map((s) => chip(s, stage === s, () => setStage(s), t(STAGE_KEY[s] ?? 'pm.stagePE')))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-medium text-stone-600">{t('pm.mk')}</span>
            {chip('all-mk', mk === 'ALL', () => setMk('ALL'), t('common.all'))}
            {mkOpts.map((m) => chip(m, mk === m, () => setMk(m), t(MK_KEY[m] ?? 'pm.mkOther')))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-medium text-stone-600">{t('pm.sector')}</span>
            {chip('all-sector', sector === 'ALL', () => setSector('ALL'), t('common.all'))}
            {sectorOpts.map((s) => chip(s, sector === s, () => setSector(s), t(SECTOR_KEY[s] ?? 'sec.tech')))}
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.loading')}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-stone-400">{t('common.noData')}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200 pretty-scroll">
              <Table className="min-w-[820px]">
                <TableHeader className="bg-white">
                  <TableRow className="border-stone-200 hover:bg-transparent">
                    <TableHead className="text-stone-600">{t('pm.company')}</TableHead>
                    <TableHead className="text-stone-600">{t('pm.round')}</TableHead>
                    <TableHead className="text-right text-stone-600">{t('pm.amount')}</TableHead>
                    <TableHead className="text-right text-stone-600">{t('pm.valuation')}</TableHead>
                    <TableHead className="hidden text-stone-600 md:table-cell">{t('pm.lead')}</TableHead>
                    <TableHead className="text-right text-stone-600">{t('pm.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="border-stone-200 hover:bg-stone-50">
                      <TableCell className="max-w-64">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate text-[13px] font-semibold text-stone-900">{r.company}</span>
                          {r.source === 'ai' && (
                            <span className="shrink-0 rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-800">AI</span>
                          )}
                          <span className="hidden truncate text-[11px] text-stone-400 sm:inline">{r.companyEn}</span>
                        </div>
                        <div className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-stone-500">{r.desc}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${STAGE_CLS[r.stage] ?? ''}`}>
                          {r.roundLabel}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-[13px] font-medium tabular-nums text-stone-800">{fmtUsd(r.amountUsd)}</TableCell>
                      <TableCell className="text-right text-[13px] tabular-nums text-stone-700">{fmtUsd(r.valuationUsd)}</TableCell>
                      <TableCell className="hidden max-w-52 truncate text-[12px] text-stone-600 md:table-cell">{r.leadInvestors || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap text-right text-[12px] tabular-nums text-stone-600">{r.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分析框架 + 数据说明 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-amber-700/25 bg-amber-700/[0.04]">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-amber-900">{t('pm.framework')}</h3>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">{t('pm.frameworkText')}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-stone-900">{t('pm.note')}</h3>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">{t('pm.noteText')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

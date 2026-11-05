'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, CheckCircle2, Crown, Loader2, ShieldAlert, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/hooks/use-i18n'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import type { DictKey } from '@/lib/i18n'

const RATING_CLS: Record<string, string> = {
  strong_buy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  buy: 'bg-teal-50 text-teal-700 border-teal-200',
  hold: 'bg-amber-50 text-amber-800 border-amber-200',
  cautious: 'bg-orange-50 text-orange-700 border-orange-200',
  avoid: 'bg-rose-50 text-rose-700 border-rose-200',
}
const RATING_KEY: Record<string, DictKey> = {
  strong_buy: 'ai.rating.sb',
  buy: 'ai.rating.b',
  hold: 'ai.rating.h',
  cautious: 'ai.rating.c',
  avoid: 'ai.rating.a',
}
const CYCLE_KEY: Record<string, DictKey> = {
  recovery: 'ai.cycle.recovery',
  expansion: 'ai.cycle.expansion',
  slowdown: 'ai.cycle.slowdown',
  recession: 'ai.cycle.recession',
}
const VAL_CLS: Record<string, string> = {
  undervalued: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  fair: 'bg-amber-50 text-amber-800 border-amber-200',
  overvalued: 'bg-rose-50 text-rose-700 border-rose-200',
}
const VAL_KEY: Record<string, DictKey> = {
  undervalued: 'ai.val.undervalued',
  fair: 'ai.val.fair',
  overvalued: 'ai.val.overvalued',
}

function scoreColor(score: number) {
  return score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-rose-500'
}

function ScoreRow({ label, score, reasoning }: { label: string; score: number; reasoning: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-stone-700">{label}</span>
        <span className={`font-bold tabular-nums ${score >= 70 ? 'text-emerald-600' : score >= 45 ? 'text-amber-600' : 'text-rose-600'}`}>
          {score}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{reasoning}</p>
    </div>
  )
}

function ForceRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-stone-500">{label}</span>
      <Progress value={score * 20} className="h-1.5 flex-1 bg-stone-100" />
      <span className="w-4 shrink-0 text-right font-semibold tabular-nums text-stone-700">{score}</span>
    </div>
  )
}

function LayerTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-amber-700">{icon}</span>
      <h4 className="text-sm font-bold text-stone-900">{title}</h4>
    </div>
  )
}

export default function AiReport({ symbol }: { symbol: string }) {
  const { t, lang } = useI18n()
  const { toast } = useToast()
  const plan = useAppStore((s) => s.plan)
  const proExpiresAt = useAppStore((s) => s.proExpiresAt)
  const openSubscribe = useAppStore((s) => s.openSubscribe)
  const isPro = plan === 'pro' && (proExpiresAt == null || proExpiresAt > Date.now())
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [report, setReport] = useState<any>(null)
  const [step, setStep] = useState(0)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // 切换公司时重置
    setState('idle')
    setReport(null)
  }, [symbol])

  useEffect(() => {
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current)
    }
  }, [])

  const run = async (force = false) => {
    // —— 会员门禁：AI 报告为付费功能，无免费额度 ——
    if (!isPro) {
      toast({ title: t('gate.aiTitle'), description: t('gate.aiDesc') })
      openSubscribe()
      return
    }
    setState('loading')
    setStep(0)
    if (stepTimer.current) clearInterval(stepTimer.current)
    stepTimer.current = setInterval(() => setStep((s) => (s + 1) % 4), 2200)
    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, lang, force }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (stepTimer.current) clearInterval(stepTimer.current)
      setReport(json.analysis)
      setState('done')
    } catch {
      if (stepTimer.current) clearInterval(stepTimer.current)
      setState('error')
    }
  }

  const steps = [t('ai.step1'), t('ai.step2'), t('ai.step3'), t('ai.step4')]
  const macro = report?.macro
  const industry = report?.industry
  const company = report?.company
  const decision = report?.decision
  const overall = decision?.overall

  return (
    <Card className="border-amber-700/20 bg-gradient-to-b from-amber-700/[0.04] to-transparent">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-700" />
              <h3 className="text-base font-bold text-stone-900">{t('ai.title')}</h3>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-500">{t('ai.desc')}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Button
              onClick={() => run(state === 'done')}
              disabled={state === 'loading'}
              className="gap-2 bg-amber-700 text-amber-50 shadow-md shadow-amber-900/10 hover:bg-amber-800"
            >
              {state === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('ai.running')}
                </>
              ) : !isPro ? (
                <>
                  <Crown className="h-4 w-4" />
                  {t('gate.unlock')}
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  {state === 'done' ? t('ai.regenerate') : t('ai.generate')}
                </>
              )}
            </Button>
            {!isPro && <span className="max-w-[220px] text-right text-[11px] leading-relaxed text-stone-500">{t('gate.aiDesc')}</span>}
          </div>
        </div>

        {state === 'loading' && (
          <div className="mt-5 space-y-2.5 rounded-xl border border-stone-200 bg-white p-4">
            {steps.map((s, i) => (
              <div key={s} className={`flex items-center gap-2.5 text-sm transition ${i === step ? 'text-amber-800' : i < step ? 'text-stone-400' : 'text-stone-300'}`}>
                {i < step ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : i === step ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-stone-300" />
                )}
                {s}
              </div>
            ))}
          </div>
        )}

        {state === 'error' && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {t('ai.failed')}
          </div>
        )}

        {state === 'done' && report && (
          <div className="mt-5 space-y-4">
            {/* 综合评级横幅 */}
            {overall && (
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={`border px-3 py-1 text-sm font-bold ${RATING_CLS[overall.rating] ?? RATING_CLS.hold}`}>
                    {t(RATING_KEY[overall.rating] ?? 'ai.rating.h')}
                  </Badge>
                  <span className="text-2xl font-extrabold tabular-nums text-stone-900">{overall.score ?? '—'}</span>
                  <span className="text-xs text-stone-500">/ 100</span>
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-stone-500">
                    {t('ai.confidence')}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`h-1.5 w-4 rounded-full ${i <= (overall.confidence ?? 3) ? 'bg-amber-700' : 'bg-stone-200'}`} />
                    ))}
                  </span>
                </div>
                {overall.conclusion && <p className="mt-3 text-sm leading-relaxed text-stone-700">{overall.conclusion}</p>}
                {overall.suggestedAction && (
                  <p className="mt-2 text-xs text-stone-500">
                    <span className="font-semibold text-amber-800">{t('ai.action')}：</span>
                    {overall.suggestedAction}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {/* 宏观层 */}
              {macro && (
                <Card className="border-stone-200 bg-white">
                  <CardContent className="p-4">
                    <LayerTitle icon={<span className="text-xs font-bold">L1</span>} title={t('ai.layer.macro')} />
                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                        {t('ai.cyclePhase')}：{t(CYCLE_KEY[macro.cyclePhase] ?? 'ai.cycle.expansion')}
                      </Badge>
                    </div>
                    {macro.summary && <p className="text-xs leading-relaxed text-stone-600">{macro.summary}</p>}
                    {macro.rates && (
                      <p className="mt-2 text-xs leading-relaxed text-stone-500">
                        <span className="font-semibold text-stone-700">{t('ai.rates')}：</span>
                        {macro.rates}
                      </p>
                    )}
                    {Array.isArray(macro.risks) && macro.risks.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {macro.risks.map((r: string, i: number) => (
                          <span key={i} className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[11px] text-rose-700">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 行业层 */}
              {industry && (
                <Card className="border-stone-200 bg-white">
                  <CardContent className="p-4">
                    <LayerTitle icon={<span className="text-xs font-bold">L2</span>} title={t('ai.layer.industry')} />
                    {industry.pest && (
                      <div className="mb-3 grid gap-1.5 sm:grid-cols-2">
                        {(['political', 'economic', 'social', 'technological'] as const).map((k) =>
                          industry.pest[k] ? (
                            <div key={k} className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700/90">
                                {t(`ai.pest.${k[0]}` as DictKey)}
                              </div>
                              <div className="mt-0.5 text-[11px] leading-relaxed text-stone-600">{industry.pest[k]}</div>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                    {industry.fiveForces && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-stone-500">{t('ai.fiveForces')}</div>
                        <ForceRow label={t('ai.ff.supplier')} score={industry.fiveForces.supplierPower ?? 3} />
                        <ForceRow label={t('ai.ff.buyer')} score={industry.fiveForces.buyerPower ?? 3} />
                        <ForceRow label={t('ai.ff.new')} score={industry.fiveForces.newEntrants ?? 3} />
                        <ForceRow label={t('ai.ff.substitute')} score={industry.fiveForces.substitutes ?? 3} />
                        <ForceRow label={t('ai.ff.rivalry')} score={industry.fiveForces.rivalry ?? 3} />
                      </div>
                    )}
                    {industry.valueChain && (
                      <p className="mt-2.5 text-xs leading-relaxed text-stone-500">
                        <span className="font-semibold text-stone-700">{t('ai.chain')}：</span>
                        {industry.valueChain}
                      </p>
                    )}
                    {industry.competition && (
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                        <span className="font-semibold text-stone-700">{t('ai.competition')}：</span>
                        {industry.competition}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 公司层 */}
              {company && (
                <Card className="border-stone-200 bg-white lg:col-span-2">
                  <CardContent className="p-4">
                    <LayerTitle icon={<span className="text-xs font-bold">L3</span>} title={t('ai.layer.company')} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2.5">
                        {company.financials && (
                          <p className="text-xs leading-relaxed text-stone-600">
                            <span className="font-semibold text-stone-800">{t('ai.financials')}：</span>
                            {company.financials}
                          </p>
                        )}
                        {company.valuation && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`border px-2 py-0.5 text-xs font-semibold ${VAL_CLS[company.valuation.verdict] ?? VAL_CLS.fair}`}>
                              {t('ai.valuation')}：{t(VAL_KEY[company.valuation.verdict] ?? 'ai.val.fair')}
                            </Badge>
                          </div>
                        )}
                        {company.valuation?.reasoning && (
                          <p className="text-xs leading-relaxed text-stone-500">{company.valuation.reasoning}</p>
                        )}
                        {company.growth && (
                          <p className="text-xs leading-relaxed text-stone-500">
                            <span className="font-semibold text-stone-700">{t('ai.growth')}：</span>
                            {company.growth}
                          </p>
                        )}
                        {Array.isArray(company.risks) && company.risks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {company.risks.map((r: string, i: number) => (
                              <span key={i} className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-800">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {company.moat && (
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-700">{t('ai.moat')}</span>
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <span key={i} className={`h-1.5 w-5 rounded-full ${i <= (company.moat.score ?? 3) ? 'bg-amber-700' : 'bg-stone-200'}`} />
                              ))}
                            </span>
                          </div>
                          {Array.isArray(company.moat.sources) && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {company.moat.sources.map((s: string, i: number) => (
                                <span key={i} className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] text-emerald-700">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {company.moat.reasoning && <p className="mt-2 text-xs leading-relaxed text-stone-500">{company.moat.reasoning}</p>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 决策层 */}
              {decision && (
                <Card className="border-stone-200 bg-white lg:col-span-2">
                  <CardContent className="p-4">
                    <LayerTitle icon={<Bot className="h-4 w-4" />} title={t('ai.layer.decision')} />
                    <div className="grid gap-4 md:grid-cols-2">
                      {decision.dow && <ScoreRow label={t('ai.dow')} score={decision.dow.score ?? 50} reasoning={decision.dow.reasoning ?? ''} />}
                      {decision.value && <ScoreRow label={t('ai.value')} score={decision.value.score ?? 50} reasoning={decision.value.reasoning ?? ''} />}
                      {decision.fundamental && (
                        <ScoreRow label={t('ai.fundamental')} score={decision.fundamental.score ?? 50} reasoning={decision.fundamental.reasoning ?? ''} />
                      )}
                      {decision.quant && <ScoreRow label={t('ai.quant')} score={decision.quant.score ?? 50} reasoning={decision.quant.reasoning ?? ''} />}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <p className="flex items-start gap-1.5 rounded-lg border border-stone-200 bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-500">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600/80" />
              {t('ai.disclaimer')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

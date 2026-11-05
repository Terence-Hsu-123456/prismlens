'use client'

import { Check, Crown, BadgeCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { fmtDateTime } from '@/lib/format'

// 全站只有一个方案：¥19/月（年付 ¥190）。不搞三档，没有机构版。
export default function PricingPanel() {
  const { t, lang } = useI18n()
  const { toast } = useToast()
  const openSubscribe = useAppStore((s) => s.openSubscribe)
  const plan = useAppStore((s) => s.plan)
  const proExpiresAt = useAppStore((s) => s.proExpiresAt)
  const isPro = plan === 'pro' && proExpiresAt != null && proExpiresAt > Date.now()

  const onCta = () => {
    if (isPro) {
      toast({ title: t('sub.current'), description: `${t('sub.validUntil')} ${fmtDateTime(proExpiresAt ?? Date.now(), lang)}` })
      return
    }
    openSubscribe()
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-stone-900">{t('pr.title')}</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">{t('pr.desc')}</p>
        {isPro && (
          <Badge className="mt-2 gap-1 border-0 bg-amber-700/10 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-700/30">
            <BadgeCheck className="h-3.5 w-3.5" />
            {t('sub.current')} · {t('sub.validUntil')} {fmtDateTime(proExpiresAt ?? Date.now(), lang)}
          </Badge>
        )}
      </div>

      <Card className="relative overflow-hidden border border-amber-700/30 bg-white shadow-md shadow-amber-900/5">
        <div className="h-1 w-full bg-gradient-to-r from-amber-700/70 via-amber-600/70 to-amber-700/70" aria-hidden="true" />
        <CardContent className="flex flex-col p-6">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-800" />
            <h3 className="text-base font-bold text-stone-900">{t('pr.pro')}</h3>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-stone-900">¥19</span>
            <span className="text-sm font-medium text-stone-500">/ {t('sub.monthly')}</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">{t('pr.yearlyNote')}</p>

          <ul className="mt-5 space-y-2.5">
            {(['pr.proF1', 'pr.proF2', 'pr.proF3', 'pr.proF4'] as const).map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13.5px] text-stone-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                {t(f)}
              </li>
            ))}
          </ul>

          <Button
            onClick={onCta}
            className="mt-6 min-h-[48px] w-full bg-amber-700 text-[15px] font-bold text-amber-50 shadow-md shadow-amber-900/10 hover:bg-amber-800"
          >
            {isPro ? (
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4" />
                {t('sub.current')}
              </span>
            ) : (
              t('pr.cta.pro')
            )}
          </Button>

          <p className="mt-4 border-t border-stone-100 pt-3 text-center text-[11px] leading-relaxed text-stone-400">{t('pr.split')}</p>
        </CardContent>
      </Card>
    </div>
  )
}

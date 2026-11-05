'use client'

import { Crown, Gem, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LANGS } from '@/lib/i18n'
import { useI18n } from '@/hooks/use-i18n'
import { useAppStore } from '@/lib/store'

export default function Header() {
  const { lang, setLang, t } = useI18n()
  const current = LANGS.find((l) => l.code === lang)
  const openSubscribe = useAppStore((s) => s.openSubscribe)
  const plan = useAppStore((s) => s.plan)
  const proExpiresAt = useAppStore((s) => s.proExpiresAt)
  const isPro = plan === 'pro' && proExpiresAt != null && proExpiresAt > Date.now()

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f3ea]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-700/10 ring-1 ring-amber-700/25">
            <Gem className="h-4.5 w-4.5 text-amber-800" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold tracking-wide text-stone-900">{t('brand.name')}</div>
            <div className="hidden truncate text-[11px] text-stone-500 sm:block">{t('brand.sub')}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPro ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-700/25 bg-amber-700/10 px-2.5 py-1 text-[11px] font-medium text-amber-800 sm:inline-flex">
              <Crown className="h-3 w-3" />
              {t('sub.current')}
            </span>
          ) : (
            <Button
              onClick={openSubscribe}
              size="sm"
              className="hidden h-8 gap-1.5 rounded-lg bg-amber-700 px-3 text-xs font-bold text-amber-50 hover:bg-amber-800 sm:inline-flex"
            >
              <Crown className="h-3.5 w-3.5" />
              {t('hero.cta')}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 border-stone-300 bg-white text-xs text-stone-700 hover:bg-stone-100">
                <Globe className="h-3.5 w-3.5 text-amber-800" />
                <span>{current?.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-stone-200 bg-white">
              {LANGS.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`cursor-pointer text-sm ${l.code === lang ? 'text-amber-800' : 'text-stone-600'}`}
                >
                  {l.label}
                  {l.code === lang && <span className="ml-auto text-xs text-amber-700">●</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

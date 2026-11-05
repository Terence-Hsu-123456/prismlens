'use client'

import { useI18n } from '@/hooks/use-i18n'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-[#f2ecdf]">
      <div className="mx-auto max-w-7xl space-y-1.5 px-4 py-6 text-xs leading-relaxed text-stone-500">
        <p>{t('ft.sources')}</p>
        <p className="text-stone-400">{t('ft.disclaimer')}</p>
        <p className="text-stone-400">{t('ft.rights')}</p>
      </div>
    </footer>
  )
}

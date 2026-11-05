import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SITE_URL, SITE_NAME, SITE_DESC, SITE_TAGLINE } from '@/lib/site'
import { MARKETS, SECTORS, UNIVERSE } from '@/lib/universe'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '棱镜投研 PrismLens · 全球真实市场 AI 投研终端',
    template: '%s | 棱镜投研 PrismLens',
  },
  description: SITE_DESC,
  keywords: ['投资分析', '真实行情', 'AI投研', '价值投资', '宏观周期', '波特五力', 'PEST', '量化分析', '筛股', '全球市场', 'AI report', 'stock screener', 'PrismLens', '棱镜投研'],
  authors: [{ name: 'PrismLens' }],
  creator: 'PrismLens',
  publisher: 'PrismLens',
  applicationName: SITE_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: '棱镜投研 PrismLens',
    description: '真实数据 · 多市场 · 多语言的三层 AI 投研终端',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '棱镜投研 PrismLens',
    description: '真实数据 · 多市场 · 多语言的三层 AI 投研终端',
  },
}

export const viewport: Viewport = {
  themeColor: '#f7f3ea',
  width: 'device-width',
  initialScale: 1,
}

// 全站内链目录：为搜索引擎提供稳定的爬取入口（服务端渲染的真实 <a> 链接）
function SiteDirectory() {
  const hot = UNIVERSE.slice(0, 24)
  return (
    <nav aria-label="站点目录" className="border-t border-stone-200 bg-[#f2ede2] px-5 py-10 text-sm text-stone-600">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="mb-2 font-medium text-stone-800">市场行情</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {MARKETS.map((m) => (
              <li key={m.key}>
                <Link href={`/market/${m.key.toLowerCase()}`} className="hover:text-amber-700">
                  {m.label.zh}股市
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-medium text-stone-800">行业</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {SECTORS.map((s) => (
              <li key={s.key}>
                <Link href={`/sector/${s.key}`} className="hover:text-amber-700">
                  {s.label.zh}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-medium text-stone-800">热门公司</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {hot.map((u) => (
              <li key={u.s}>
                <Link href={`/stock/${u.s.toLowerCase()}`} className="hover:text-amber-700">
                  {u.n.zh}（{u.s}）
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="pt-2 text-xs text-stone-500">
          © 2025 {SITE_NAME} · {SITE_TAGLINE} · 所有内容仅供研究学习参考，不构成投资建议。
        </p>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f7f3ea] text-stone-800`}>
        {children}
        <SiteDirectory />
        <Toaster />
      </body>
    </html>
  )
}

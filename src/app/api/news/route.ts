// 全球财经资讯流：分页 + 自动增量聚合（多源 RSS 入库，随时间动态增多）
import { NextRequest, NextResponse } from 'next/server'
import { listNews, ensureGlobalNews, refreshGlobalNews, refreshCompanyNews, type NewsLang } from '@/lib/news'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1)
    const pageSize = Math.min(50, Math.max(5, parseInt(sp.get('pageSize') ?? '20', 10) || 20))
    const langRaw = sp.get('lang') ?? 'all'
    const lang: NewsLang | 'all' = ['zh', 'en', 'ja'].includes(langRaw) ? (langRaw as NewsLang) : 'all'
    const symbol = (sp.get('symbol') ?? '').trim().toUpperCase() || undefined
    const name = (sp.get('name') ?? '').trim()

    if (symbol) {
      // 公司资讯流：库里不足 8 条时确保初始化一次，然后按节流增量刷新
      const cur = await listNews({ page: 1, pageSize: 8, lang: 'all', symbol })
      if (cur.total < 8) await refreshCompanyNews(symbol, name || symbol, true)
      else void refreshCompanyNews(symbol, name || symbol).catch(() => {})
    } else {
      // 全局流：冷启动同步保证首次有数据；之后节流后台刷新
      await ensureGlobalNews()
      void refreshGlobalNews().catch(() => {})
    }

    const data = await listNews({ page, pageSize, lang, symbol })
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'news load failed', items: [], total: 0, hasMore: false, publishers: 0 },
      { status: 200 }
    )
  }
}

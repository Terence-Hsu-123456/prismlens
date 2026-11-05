// Next.js 启动钩子：服务启动即后台同步全市场公司池（DB 为空时全量，否则按 TTL 增量）
export async function register() {
  // Vercel 上数据层是只读 SQLite 快照（每次冷启动都是同一份基线数据），
  // 无法写入也不应触发全市场抓取，直接跳过同步钩子。
  if (process.env.VERCEL) return
  // 仅 Node.js runtime（App Router 服务端）
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { bootstrapScreenSync } = await import('@/lib/screen-sync')
    bootstrapScreenSync()
  }
}

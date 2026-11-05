// A股行业回填：拉新浪行业分类 → 更新 CN bulk 行的 sector/tags/stage
import { db } from '../src/lib/db'
import { sinaIndustryMap, sectorFromSinaIndustry, stageOf, toUsdCap } from '../src/lib/screen-sources'

async function main() {
  const t0 = Date.now()
  const map = await sinaIndustryMap()
  console.log('industry map:', map.size, 'in', Date.now() - t0, 'ms')

  const rows = await db.screenCompany.findMany({ where: { market: 'CN', source: 'bulk' }, select: { symbol: true, pe: true, capUsd: true } })
  const groups = new Map<string, { sector: string | null; symbols: string[] }>()
  let matched = 0
  for (const r of rows) {
    const code = r.symbol.split('.')[0]
    const ind = map.get(code)
    if (!ind) continue
    matched++
    const sector = sectorFromSinaIndustry(ind)
    const g = groups.get(ind) ?? { sector, symbols: [] }
    g.symbols.push(r.symbol)
    groups.set(ind, g)
  }
  console.log('matched:', matched, '/', rows.length, 'industries:', groups.size)

  let updated = 0
  for (const [ind, g] of groups) {
    const tags = JSON.stringify([ind])
    for (let i = 0; i < g.symbols.length; i += 100) {
      const chunk = g.symbols.slice(i, i + 100)
      const ph = chunk.map(() => '?').join(',')
      await db.$queryRawUnsafe(
        `UPDATE "ScreenCompany" SET sector = ?, tags = ?, "updatedAt" = datetime('now') WHERE symbol IN (${ph})`,
        g.sector,
        tags,
        ...chunk
      )
      updated += chunk.length
    }
  }
  console.log('updated rows:', updated, 'in', Date.now() - t0, 'ms')

  // 生命周期重算（行业有了之后用 pe 精化）
  const rows2 = await db.screenCompany.findMany({ where: { market: 'CN', source: 'bulk' }, select: { symbol: true, pe: true, capUsd: true, revenueGrowth: true } })
  for (const r of rows2) {
    const stage = stageOf(r.capUsd, r.revenueGrowth, r.pe)
    await db.$executeRawUnsafe(`UPDATE "ScreenCompany" SET stage = ? WHERE symbol = ?`, stage, r.symbol)
  }
  const withSector = await db.screenCompany.count({ where: { market: 'CN', NOT: { sector: null } } })
  console.log('CN rows with sector now:', withSector)
  process.exit(0)
}
main()

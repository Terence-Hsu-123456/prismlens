import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 数据层定位：SQLite。
 *
 * 数据基线是随仓库提交的 db/custom.db（全市场公司池 / 一级市场融资 / 资讯），
 * 由 next.config 的 outputFileTracingIncludes 打进 Serverless 函数。
 *
 * - Vercel 函数目录只读，而 SQLite 连接需要写 journal / lock，
 *   因此冷启动时先把快照复制到 /tmp（同实例内复用），再从副本连接。
 * - Vercel 上若 DATABASE_URL 仍指向本地 file: 路径（例如历史遗留的 file:/tmp/prismlens.db，
 *   该文件每次冷启动都是空的），一律改用打包快照，避免连到空库。
 * - 指向真实外部库（libsql / postgres 等）的 DATABASE_URL 不受影响。
 */
function resolveDatasourceUrl(): string {
  const fromEnv = process.env.DATABASE_URL ?? ''
  const snapshot = path.join(process.cwd(), 'db', 'custom.db')
  const toFileUrl = (p: string) => 'file:' + p.replace(/\\/g, '/')

  // 外部数据库：原样使用
  if (fromEnv && !fromEnv.startsWith('file:')) return fromEnv

  if (process.env.VERCEL) {
    const tmp = '/tmp/prismlens.db'
    try {
      if (!fs.existsSync(tmp)) {
        const staging = `${tmp}.${process.pid}`
        fs.copyFileSync(snapshot, staging)
        fs.renameSync(staging, tmp) // 原子落地，避免并发冷启动读到半截文件
      }
      return toFileUrl(tmp)
    } catch {
      return toFileUrl(snapshot) // 兜底：只读直连，读接口仍可用
    }
  }

  return fromEnv || toFileUrl(snapshot)
}

const datasourceUrl = resolveDatasourceUrl()
// Prisma 的 engine 仍会读 env，这里同步一份，避免与 datasourceUrl 不一致
process.env.DATABASE_URL = datasourceUrl

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

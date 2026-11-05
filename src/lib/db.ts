import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 数据层定位：SQLite。
 * - 快照文件随仓库提交（db/custom.db），并由 next.config 的 outputFileTracingIncludes
 *   打进 Serverless 函数，作为只读基线数据。
 * - Vercel 函数目录不可写，而 SQLite 连接时需要写 journal / lock，因此冷启动先把它
 *   复制到 /tmp（同实例内复用），再从副本连接。
 * - 显式配置了 DATABASE_URL 时一律以环境变量为准。
 */
if (!process.env.DATABASE_URL) {
  const src = path.join(process.cwd(), 'db', 'custom.db')
  let target = src
  if (process.env.VERCEL) {
    const tmp = '/tmp/prismlens.db'
    try {
      if (!fs.existsSync(tmp)) {
        const staging = `${tmp}.${process.pid}`
        fs.copyFileSync(src, staging)
        fs.renameSync(staging, tmp) // 原子落地，避免并发冷启动读到半截文件
      }
      target = tmp
    } catch {
      target = src // 兜底：只读直连，读接口仍可用
    }
  }
  process.env.DATABASE_URL = 'file:' + target.replace(/\\/g, '/')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
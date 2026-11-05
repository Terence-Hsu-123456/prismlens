// 订阅/订单流程（两步）：
// 1) intent —— 打开支付弹窗时创建 PENDING 订单，返回订单号（付款凭证，留档对账）
// 2) confirm —— 用户扫码付款后点击「我已完成付款」，订单置为 ACTIVE 并返回有效期
// 说明：个人收款码无支付回调，采用付款确认式激活；订单号 + 付款人备注用于人工对账。
// 接入微信支付/支付宝商户接口或 Stripe 后，可将 confirm 步骤替换为支付回调验签。
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// 单一定价：¥19/月，¥190/年
const PRICE: Record<number, number> = { 1: 19, 12: 190 }

function genOrderNo(): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0')
  return `PL${ymd}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    // —— 第一步：创建订单（intent）——
    if (body?.intent) {
      const months = Number(body?.months) === 12 ? 12 : 1
      const channel = body?.channel === 'alipay' ? 'alipay' : 'wechat'
      const deviceId = String(body?.deviceId ?? '').slice(0, 64)
      const amountCNY = PRICE[months]

      const order = await db.subscription.create({
        data: { orderNo: genOrderNo(), plan: 'pro', channel, months, amountCNY, deviceId, status: 'PENDING' },
      })

      return NextResponse.json({
        ok: true,
        intent: true,
        orderNo: order.orderNo,
        amountCNY: order.amountCNY,
        months: order.months,
        channel: order.channel,
      })
    }

    // —— 第二步：确认付款（confirm）——
    if (body?.confirm) {
      const orderNo = String(body?.orderNo ?? '').slice(0, 32)
      const payerNote = String(body?.payerNote ?? '').slice(0, 60)
      const deviceId = String(body?.deviceId ?? '').slice(0, 64)
      if (!orderNo) return NextResponse.json({ error: 'missing orderNo' }, { status: 400 })

      const order = await db.subscription.findUnique({ where: { orderNo } })
      if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 })

      // 幂等：已激活的订单直接返回原有效期
      if (order.status === 'ACTIVE' && order.expiresAt) {
        return NextResponse.json({
          ok: true,
          confirm: true,
          orderNo: order.orderNo,
          amountCNY: order.amountCNY,
          months: order.months,
          channel: order.channel,
          expiresAt: order.expiresAt.getTime(),
        })
      }

      const months = order.months
      const activatedAt = new Date()
      const expiresAt = new Date(Date.now() + months * 30 * 86400_000)
      const updated = await db.subscription.update({
        where: { orderNo },
        data: { status: 'ACTIVE', payerNote, deviceId, activatedAt, expiresAt },
      })

      return NextResponse.json({
        ok: true,
        confirm: true,
        orderNo: updated.orderNo,
        amountCNY: updated.amountCNY,
        months: updated.months,
        channel: updated.channel,
        activatedAt: activatedAt.getTime(),
        expiresAt: updated.expiresAt!.getTime(),
      })
    }

    return NextResponse.json({ error: 'invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'subscribe failed' }, { status: 500 })
  }
}

// 查询订单统计（供内部对账）
export async function GET() {
  try {
    const [count, active, pending] = await Promise.all([
      db.subscription.count(),
      db.subscription.count({ where: { status: 'ACTIVE', expiresAt: { gt: new Date() } } }),
      db.subscription.count({ where: { status: 'PENDING' } }),
    ])
    return NextResponse.json({ count, active, pending })
  } catch {
    return NextResponse.json({ count: 0, active: 0, pending: 0 })
  }
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { BadgeCheck, Check, Copy, Crown, Loader2, PartyPopper, ReceiptText, Smartphone } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/hooks/use-i18n'
import { useToast } from '@/hooks/use-toast'
import { useAppStore, deviceId } from '@/lib/store'
import { fmtDateTime } from '@/lib/format'

type Channel = 'wechat' | 'alipay'
type Months = 1 | 12

// 单一定价：¥19/月 · ¥190/年
const PRICE: Record<Months, number> = { 1: 19, 12: 190 }

export default function SubscribeDialog() {
  const { t, lang } = useI18n()
  const { toast } = useToast()
  const open = useAppStore((s) => s.subscribeOpen)
  const close = useAppStore((s) => s.closeSubscribe)
  const activatePro = useAppStore((s) => s.activatePro)
  const plan = useAppStore((s) => s.plan)
  const proExpiresAt = useAppStore((s) => s.proExpiresAt)

  const [channel, setChannel] = useState<Channel>('wechat')
  const [months, setMonths] = useState<Months>(1)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)
  const [orderNo, setOrderNo] = useState('')
  const [creating, setCreating] = useState(false)
  const lastOrderKey = useRef('')

  const amount = PRICE[months]

  // 打开/切换时长或渠道 → 生成新订单（订单号即付款凭证）
  const createOrder = useCallback(async (m: Months, c: Channel) => {
    setCreating(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: true, months: m, channel: c, deviceId: deviceId() }),
      })
      const j = await res.json()
      if (!res.ok || !j?.ok) throw new Error(j?.error ?? 'failed')
      setOrderNo(j.orderNo)
      lastOrderKey.current = `${m}-${c}`
    } catch {
      setOrderNo('')
    } finally {
      setCreating(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setDone(false)
      setBusy(false)
      setNote('')
      setQrLoaded(false)
      setOrderNo('')
      lastOrderKey.current = ''
      createOrder(months, channel)
    }
  }, [open])

  // 时长/渠道变化且弹窗打开时 → 重新生成订单
  useEffect(() => {
    if (!open) return
    const key = `${months}-${channel}`
    if (key === lastOrderKey.current) return
    setQrLoaded(false)
    createOrder(months, channel)
  }, [open, months, channel, createOrder])

  useEffect(() => setQrLoaded(false), [channel])

  const copyOrderNo = async () => {
    try {
      await navigator.clipboard.writeText(orderNo)
      toast({ title: orderNo })
    } catch {
      /* ignore */
    }
  }

  const pay = async () => {
    if (!orderNo) return
    setBusy(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, orderNo, payerNote: note.trim(), deviceId: deviceId() }),
      })
      const j = await res.json()
      if (!res.ok || !j?.ok) throw new Error(j?.error ?? 'failed')
      activatePro(j.expiresAt)
      setDone(true)
      toast({ title: t('sub.success'), description: `${t('sub.validUntil')} ${fmtDateTime(j.expiresAt, lang)}` })
    } catch {
      toast({ title: t('common.error'), description: t('sub.note'), variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const qrSrc = channel === 'wechat' ? '/pay/wechat.jpg' : '/pay/alipay.jpg'
  const isPro = plan === 'pro' && proExpiresAt != null && proExpiresAt > Date.now()
  const orderTail = orderNo ? orderNo.slice(-4) : '————'

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? close() : null)}>
      <DialogContent
        aria-describedby="sub-dialog-desc"
        className="max-h-[92vh] overflow-y-auto border-stone-200 bg-white p-0 text-stone-800 pretty-scroll sm:max-w-md"
      >
        <div id="sub-dialog-desc" className="sr-only">
          {t('sub.desc')}
        </div>

        {done || isPro ? (
          // —— 成功态：订单回执 ——
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-700/10 ring-1 ring-amber-700/30">
              <PartyPopper className="h-8 w-8 text-amber-700" />
            </span>
            <h3 className="mt-4 flex items-center gap-2 text-lg font-bold text-stone-900">
              {t('sub.success')}
              <BadgeCheck className="h-5 w-5 text-amber-700" />
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              {t('sub.successDesc')}
              <span className="ml-1 font-bold text-amber-800">
                {fmtDateTime(done ? Date.now() + months * 30 * 86400_000 : (proExpiresAt ?? Date.now()), lang)}
              </span>
            </p>

            {/* 订单回执：金额 / 渠道 / 订单号 */}
            <div className="mt-5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                <ReceiptText className="h-3.5 w-3.5" />
                {t('sub.receipt')}
              </div>
              <div className="mt-2 space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">{t('sub.amount')}</span>
                  <span className="font-bold tabular-nums text-stone-900">¥{amount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">{t('sub.channel')}</span>
                  <span className="font-medium text-stone-800">{channel === 'wechat' ? t('sub.wechat') : t('sub.alipay')}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">{t('sub.orderNo')}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[12px] font-semibold text-stone-900">
                    {orderNo || '—'}
                    {orderNo && (
                      <button onClick={copyOrderNo} className="text-stone-400 transition hover:text-amber-800" aria-label="copy">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <ul className="mt-5 w-full space-y-2 text-left">
              {(['pr.proF1', 'pr.proF2', 'pr.proF3', 'pr.proF4'] as const).map((k) => (
                <li key={k} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-[13px] text-stone-700">
                  <Check className="h-4 w-4 shrink-0 text-amber-700" />
                  {t(k)}
                </li>
              ))}
            </ul>
            <Button onClick={close} className="mt-6 w-full bg-amber-700 text-amber-50 hover:bg-amber-800">
              {t('common.live')} ✓
            </Button>
          </div>
        ) : (
          // —— 支付态 ——
          <div className="px-5 pb-5 pt-6 sm:px-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-stone-900">
                <Crown className="h-5 w-5 text-amber-700" />
                {t('sub.title')}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500">{t('sub.desc')}</DialogDescription>
            </DialogHeader>

            {/* 时长选择 */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {([1, 12] as Months[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`relative rounded-xl border p-3 text-left transition ${
                    months === m ? 'border-amber-700/60 bg-amber-700/5' : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="text-[13px] font-semibold text-stone-800">{m === 1 ? t('sub.monthly') : t('sub.yearly')}</div>
                  <div className="mt-0.5 text-lg font-extrabold text-stone-900">
                    ¥{PRICE[m]}
                    <span className="ml-1 text-[11px] font-normal text-stone-400">/ {m === 1 ? t('sub.monthly') : t('sub.yearly')}</span>
                  </div>
                  {m === 12 && (
                    <span className="absolute -top-2 right-2 rounded-full bg-amber-700 px-1.5 py-0.5 text-[10px] font-bold text-amber-50">
                      {t('sub.yearlySave')}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 支付渠道切换 */}
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-stone-500">{t('sub.channel')}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChannel('wechat')}
                  className={`flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border text-[13px] font-semibold transition ${
                    channel === 'wechat'
                      ? 'border-amber-700/60 bg-amber-700/5 text-amber-800'
                      : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  {t('sub.wechat')}
                </button>
                <button
                  onClick={() => setChannel('alipay')}
                  className={`flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border text-[13px] font-semibold transition ${
                    channel === 'alipay'
                      ? 'border-amber-700/60 bg-amber-700/5 text-amber-800'
                      : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  {t('sub.alipay')}
                </button>
              </div>
            </div>

            {/* 订单号（付款凭证） */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-amber-700/40 bg-amber-700/5 px-3.5 py-2.5">
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-stone-500">{t('sub.orderNo')}</div>
                <div className="truncate font-mono text-[13px] font-bold text-stone-900">
                  {creating || !orderNo ? <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" /> : orderNo}
                </div>
              </div>
              {orderNo && (
                <button
                  onClick={copyOrderNo}
                  className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-medium text-stone-600 transition hover:border-amber-700/40 hover:text-amber-800"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {orderTail}
                </button>
              )}
            </div>

            {/* 二维码卡片 */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200">
              <div className="bg-amber-700 px-4 py-2 text-center text-sm font-bold text-amber-50">
                {channel === 'wechat' ? t('sub.wechat') : t('sub.alipay')}
              </div>
              <div className="flex flex-col items-center bg-stone-50 px-4 py-4">
                <div className="text-xs text-stone-500">
                  {t('sub.amount')}：
                  <span className="text-xl font-extrabold tabular-nums text-stone-900">¥{amount}</span>
                </div>
                <div className="relative mt-3 h-56 w-56 overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
                  {!qrLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                    </div>
                  )}
                  <Image
                    src={qrSrc}
                    alt={channel === 'wechat' ? 'WeChat Pay QR' : 'Alipay QR'}
                    fill
                    sizes="224px"
                    className="object-contain"
                    onLoad={() => setQrLoaded(true)}
                    unoptimized
                  />
                </div>
                <div className="mt-3 text-center text-[11px] leading-relaxed text-stone-500">
                  {t('sub.scanTip')}
                  <br />
                  <span className="text-stone-400">{t('sub.orderTip')}</span>
                </div>
              </div>
            </div>

            {/* 付款人备注 */}
            <div className="mt-4">
              <label htmlFor="sub-note" className="text-xs font-medium text-stone-500">
                {t('sub.payerNote')}
              </label>
              <Input
                id="sub-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('sub.payerNotePh')}
                className="mt-1.5 border-stone-200 bg-white text-sm focus-visible:ring-amber-700/30"
              />
            </div>

            {/* 确认按钮 */}
            <Button
              onClick={pay}
              disabled={busy || !orderNo}
              className="mt-4 min-h-[44px] w-full gap-2 bg-amber-700 text-[15px] font-bold text-amber-50 shadow-md shadow-amber-900/10 hover:bg-amber-800"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('sub.submitting')}
                </>
              ) : (
                <>{t('sub.paid')}</>
              )}
            </Button>

            <p className="mt-3 text-[11px] leading-relaxed text-stone-500">{t('sub.note')}</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-stone-400">{t('sub.agree')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

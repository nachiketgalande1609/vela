import 'server-only'
import crypto from 'crypto'
import { env } from '@/lib/env'

export function verifyOrderPayment(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return expected === signature
}

export function verifySubscriptionPayment(
  paymentId: string,
  subscriptionId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${paymentId}|${subscriptionId}`)
    .digest('hex')
  return expected === signature
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  return expected === signature
}

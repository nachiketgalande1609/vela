import { Suspense } from 'react'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { OrderConfirmationContent } from './OrderConfirmationContent'

export const metadata = { title: 'Order Confirmed' }

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <Suspense fallback={null}>
        <OrderConfirmationContent />
      </Suspense>
    </div>
  )
}

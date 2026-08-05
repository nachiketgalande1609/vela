import { PublicNav } from '@/app/components/layout/PublicNav'
import { X, Check } from 'lucide-react'

export const metadata = { title: 'Refund & Cancellation Policy' }

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <main className="w-full mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-xs text-[var(--text-muted)] mb-10">Last updated: August 6, 2026</p>

        {/* Quick reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="rounded-[4px] border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-4">Not eligible for refund</p>
            <ul className="space-y-2.5">
              {[
                'Individual wallpaper purchases (₹99)',
                'Wallpaper packs once purchased',
                'Subscription fees for the current billing period',
                'Purchases where the file has already been downloaded',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[4px] border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">We will help with</p>
            <ul className="space-y-2.5">
              {[
                'Technical issues preventing download',
                'Duplicate charges for the same item',
                'Payment deducted but purchase not credited',
                'Subscription not cancelled after request',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-10 text-sm text-[var(--text-muted)] leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">1. Overview</h2>
            <p>
              Vela sells digital wallpaper files that are immediately accessible upon purchase. Because digital
              goods cannot be &quot;returned&quot; in the traditional sense — once a file is downloaded, it cannot be
              un-downloaded — our policy is that <span className="text-[var(--text)]">all sales are final</span>.
              This is consistent with the Consumer Protection Act, 2019, which permits non-refund policies for
              digital goods that have been delivered or accessed.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">2. Individual Wallpaper Purchases</h2>
            <p>
              Purchases of individual wallpapers (₹99 per wallpaper) are <span className="text-[var(--text)]">
              non-refundable</span>. Once a transaction is completed and the wallpaper is available for download
              in your library, no refund will be issued regardless of whether the file was actually downloaded.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">3. Wallpaper Packs</h2>
            <p>
              Purchases of wallpaper packs are <span className="text-[var(--text)]">non-refundable</span> once
              the transaction is completed and access to the pack is granted in your library.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">4. Subscriptions</h2>
            <p className="mb-3">
              Monthly subscriptions (₹499/month) are billed at the start of each billing cycle.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Subscription fees for the <span className="text-[var(--text)]">current billing period are non-refundable</span>.</li>
              <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period — you retain access until then.</li>
              <li>Wallpapers downloaded before cancellation remain on your device and may continue to be used under the personal use licence.</li>
              <li>Vela does not offer prorated refunds for unused days in a billing cycle.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">5. Exceptions — Technical Issues</h2>
            <p className="mb-3">
              We will review and resolve complaints in the following situations:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>
                <span className="text-[var(--text)]">Duplicate charge</span> — if you were charged more than once for the same wallpaper or subscription due to a technical error, we will refund the duplicate amount.
              </li>
              <li>
                <span className="text-[var(--text)]">Payment deducted but not credited</span> — if your payment was processed but the wallpaper or subscription did not appear in your account, contact us and we will resolve it within 2 business days.
              </li>
              <li>
                <span className="text-[var(--text)]">Persistent download failure</span> — if a purchased wallpaper cannot be downloaded due to a fault on our end, we will fix the issue or issue a refund at our discretion.
              </li>
            </ul>
            <p className="mt-3">
              To raise any of the above, contact us at{' '}
              <span className="text-[var(--accent)]">nachiket4251@gmail.com</span> within{' '}
              <span className="text-[var(--text)]">7 days</span> of the transaction, with your registered email
              address and order details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">6. Cancellation by Vela</h2>
            <p>
              Vela reserves the right to cancel and refund any order at our discretion — for example, if a
              wallpaper is removed from the platform due to copyright concerns. In such cases, you will receive
              a full refund to your original payment method within 5–7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">7. Refund Processing</h2>
            <p>
              Approved refunds are processed via Razorpay and credited back to the original payment method
              (UPI, card, or net banking). Refunds typically reflect within{' '}
              <span className="text-[var(--text)]">5–7 business days</span>, depending on your bank or payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">8. Governing Law</h2>
            <p>
              This policy is governed by the laws of India, including the Consumer Protection Act, 2019 and the
              Information Technology Act, 2000. Disputes shall be subject to the exclusive jurisdiction of
              courts in Maharashtra, India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">9. Contact</h2>
            <p className="mb-3">For refund requests or billing disputes, reach us at:</p>
            <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1">
              <p><span className="text-[var(--text)]">Name:</span> Nachiket Galande</p>
              <p><span className="text-[var(--text)]">Email:</span> <span className="text-[var(--accent)]">nachiket4251@gmail.com</span></p>
              <p><span className="text-[var(--text)]">Response time:</span> Within 2 business days</p>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}

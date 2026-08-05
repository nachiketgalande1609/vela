import { PublicNav } from '@/app/components/layout/PublicNav'
import { Check, X } from 'lucide-react'

export const metadata = { title: 'Licence Agreement' }

export default function LicencePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <main className="w-full mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Licence Agreement
        </h1>
        <p className="text-xs text-[var(--text-muted)] mb-10">Last updated: August 6, 2026</p>

        {/* Quick reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="rounded-[4px] border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">You can</p>
            <ul className="space-y-2.5">
              {[
                'Set as wallpaper on your personal devices',
                'Download for personal offline use',
                'Use on as many of your own devices as you like',
                'Share a link to the Vela listing with others',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[4px] border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-4">You cannot</p>
            <ul className="space-y-2.5">
              {[
                'Resell or redistribute the wallpaper files',
                'Use in commercial projects or products',
                'Upload to other platforms or marketplaces',
                'Claim authorship or ownership of the artwork',
                'Modify and share as your own work',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <X size={14} className="text-red-400 mt-0.5 shrink-0" />
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
              This Licence Agreement (&quot;Licence&quot;) is a legal agreement between you (&quot;Licensee&quot;) and Vela,
              founded by Nachiket Galande (&quot;Licensor&quot;), governing your use of wallpaper files purchased or
              downloaded from <span className="text-[var(--text)]">vela.nachiketgalande.com</span>. By downloading
              or using any wallpaper from Vela, you agree to the terms of this Licence.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">2. Ownership</h2>
            <p>
              All wallpapers available on Vela are the exclusive intellectual property of Vela or its respective
              content creators. Purchase of a wallpaper constitutes the purchase of a limited licence to use the
              file — it does not transfer ownership, copyright, or any other intellectual property rights to
              the Licensee. The wallpapers are protected under the Indian Copyright Act, 1957.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">3. Personal Use Licence</h2>
            <p className="mb-3">
              Upon completing a purchase or downloading a free wallpaper, you are granted a{' '}
              <span className="text-[var(--text)]">limited, non-exclusive, non-transferable, revocable personal
              use licence</span>. This licence permits you to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Download and store the wallpaper on your personal devices.</li>
              <li>Set the wallpaper as the background on any of your personal devices (phone, tablet, computer).</li>
              <li>Retain downloaded files for personal, non-commercial enjoyment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">4. Restrictions</h2>
            <p className="mb-3">The Licensee expressly may not:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>
                <span className="text-[var(--text)]">Redistribute</span> — share, upload, post, or otherwise
                distribute wallpaper files to any third party, platform, or file-sharing service.
              </li>
              <li>
                <span className="text-[var(--text)]">Resell</span> — sell, sublicense, or commercially exploit
                the wallpapers in any form, including as part of a product, app, or service.
              </li>
              <li>
                <span className="text-[var(--text)]">Commercial use</span> — use the wallpapers in advertisements,
                marketing materials, merchandise, NFTs, or any other commercial context.
              </li>
              <li>
                <span className="text-[var(--text)]">Derivative works</span> — modify, alter, or create derivative
                works from the wallpapers and distribute or sell them.
              </li>
              <li>
                <span className="text-[var(--text)]">Misrepresentation</span> — claim authorship, ownership, or
                creative credit for any wallpaper obtained from Vela.
              </li>
              <li>
                <span className="text-[var(--text)]">Account sharing</span> — allow other individuals to download
                wallpapers through your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">5. Subscription Licence</h2>
            <p>
              Subscribers (₹499/month) receive the same personal use licence for all wallpapers on the platform
              for the duration of their active subscription. Upon cancellation or expiry of the subscription,
              the right to download new wallpapers ceases. Wallpapers already downloaded prior to cancellation
              may continue to be used on personal devices under the personal use licence.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">6. Free Wallpapers</h2>
            <p>
              Wallpapers made available for free download on Vela are subject to the same personal use licence
              and restrictions as purchased wallpapers. &quot;Free&quot; refers to the absence of a monetary charge only —
              it does not grant additional rights over paid wallpapers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">7. Termination</h2>
            <p>
              This Licence is effective until terminated. It will terminate automatically, without notice, if
              you breach any of its terms. Upon termination, you must cease all use of the wallpapers and
              delete all copies in your possession. Vela reserves the right to suspend or terminate your
              account and pursue legal remedies for any breach of this Licence.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">8. Enforcement</h2>
            <p>
              Unauthorised use, reproduction, or distribution of Vela wallpapers constitutes copyright
              infringement under the Indian Copyright Act, 1957, and may result in civil and/or criminal
              liability. Vela reserves the right to pursue all available legal remedies against infringers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">9. Governing Law</h2>
            <p>
              This Licence shall be governed by the laws of India. Any disputes shall be subject to the
              exclusive jurisdiction of the courts of Maharashtra, India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">10. Contact</h2>
            <p>
              For licensing enquiries, commercial use requests, or to report infringement, contact us at{' '}
              <span className="text-[var(--accent)]">nachiket4251@gmail.com</span> or visit our{' '}
              <a href="/contact" className="text-[var(--accent)] hover:underline">Contact page</a>.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}

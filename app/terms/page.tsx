import { PublicNav } from '@/app/components/layout/PublicNav'

export const metadata = { title: 'Terms of Service' }

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <main className="w-full mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Terms of Service
        </h1>
        <p className="text-xs text-[var(--text-muted)] mb-10">Last updated: August 6, 2026</p>

        <div className="space-y-10 text-sm text-[var(--text-muted)] leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">1. Acceptance of Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Vela website at{' '}
              <span className="text-[var(--text)]">vela.nachiketgalande.com</span> (the &quot;Service&quot;), operated by
              Vela, founded by Nachiket Galande (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using the Service,
              creating an account, or making a purchase, you agree to be bound by these Terms. If you do not agree,
              do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use this Service and make purchases. By using the Service, you
              represent and warrant that you meet this requirement and have the legal capacity to enter into a binding
              agreement under Indian law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">3. Accounts</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate and complete information when registering.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
              <li>You may not share your account or allow others to access purchased content through your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">4. Purchases and Payments</h2>
            <p className="mb-3">
              All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.
              Payments are processed securely by Razorpay. By completing a purchase, you authorise the charge to your
              selected payment method.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><span className="text-[var(--text)]">Individual wallpapers</span> — ₹99 per wallpaper, one-time purchase granting a personal use licence.</li>
              <li><span className="text-[var(--text)]">Monthly subscription</span> — ₹499 per month, granting unlimited downloads of all wallpapers on the platform for the duration of the active subscription period.</li>
              <li>Subscription access ceases at the end of the billing period if not renewed. Previously downloaded files remain on your device but you lose the right to download new ones.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">5. Refund Policy</h2>
            <p>
              All sales of digital wallpapers are <span className="text-[var(--text)]">final and non-refundable</span>.
              Because wallpapers are digital goods that are immediately accessible upon purchase, we do not offer
              refunds, exchanges, or cancellations once a transaction is completed. This is consistent with the
              Consumer Protection Act, 2019, which permits non-refund policies for digital goods that have been
              accessed or downloaded.
            </p>
            <p className="mt-3">
              If you experience a technical issue preventing access to a purchased wallpaper, please contact us at{' '}
              <span className="text-[var(--accent)]">nachiket4251@gmail.com</span> and we will resolve it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">6. Licence Grant</h2>
            <p className="mb-3">
              Upon completing a purchase, Vela grants you a limited, non-exclusive, non-transferable, revocable
              licence to use the purchased wallpaper(s) solely for <span className="text-[var(--text)]">personal,
              non-commercial use</span>, including setting the wallpaper on your personal devices.
            </p>
            <p className="mb-2 text-[var(--text)]">You may NOT:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Resell, redistribute, sublicense, or share the wallpaper files with others.</li>
              <li>Use the wallpapers for any commercial purpose, including in products, marketing materials, or merchandise.</li>
              <li>Upload the wallpapers to any other platform, marketplace, or file-sharing service.</li>
              <li>Claim ownership or authorship of the wallpapers.</li>
              <li>Modify and redistribute the wallpapers as your own work.</li>
            </ul>
            <p className="mt-3">
              Vela retains all intellectual property rights in the wallpapers. Purchase grants a licence to use, not
              ownership of the underlying artwork or copyright.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">7. Intellectual Property</h2>
            <p>
              All content on the Service — including wallpaper images, website design, logos, and text — is the
              property of Vela or its content creators and is protected under Indian copyright law (Copyright Act, 1957)
              and applicable international treaties. Unauthorised reproduction or distribution is prohibited and may
              result in legal action.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">8. Prohibited Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure.</li>
              <li>Scrape, crawl, or systematically download wallpapers without purchase.</li>
              <li>Circumvent any digital rights management or access controls on the Service.</li>
              <li>Use automated tools, bots, or scripts to interact with the Service.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either
              express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of
              viruses or other harmful components. We make no warranty regarding the quality, accuracy, or suitability
              of any wallpaper for a particular device or purpose.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Vela and Nachiket Galande shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising out of your use of or
              inability to use the Service. Our total liability for any claim arising under these Terms shall not
              exceed the amount you paid to us in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">11. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes
              arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of
              the courts located in <span className="text-[var(--text)]">Maharashtra, India</span>. Before initiating
              legal proceedings, you agree to first attempt to resolve the dispute by contacting us at{' '}
              <span className="text-[var(--accent)]">nachiket4251@gmail.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will indicate the date of the latest
              revision at the top of this page. Your continued use of the Service after changes are posted
              constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">13. Contact</h2>
            <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1">
              <p><span className="text-[var(--text)]">Name:</span> Nachiket Galande</p>
              <p><span className="text-[var(--text)]">Company:</span> Vela</p>
              <p><span className="text-[var(--text)]">Email:</span> <span className="text-[var(--accent)]">nachiket4251@gmail.com</span></p>
              <p><span className="text-[var(--text)]">Jurisdiction:</span> Maharashtra, India</p>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}

import { PublicNav } from '@/app/components/layout/PublicNav'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <main className="w-full mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--text-muted)] mb-10">Last updated: August 6, 2026</p>

        <div className="space-y-10 text-sm text-[var(--text-muted)] leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">1. Introduction</h2>
            <p>
              Vela (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), founded by Nachiket Galande, operates the website{' '}
              <span className="text-[var(--text)]">vela.nachiketgalande.com</span> (the &quot;Service&quot;). This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
              and make purchases. Please read this policy carefully. If you disagree with its terms, please discontinue
              use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><span className="text-[var(--text)]">Account information</span> — your name and email address when you register.</li>
              <li><span className="text-[var(--text)]">Payment information</span> — payment transactions are processed by Razorpay. We do not store your card details or UPI credentials. Razorpay may collect and retain payment data under their own privacy policy.</li>
              <li><span className="text-[var(--text)]">Purchase history</span> — records of wallpapers and subscriptions you have purchased.</li>
              <li><span className="text-[var(--text)]">Usage data</span> — pages visited, search queries on the site, and general interaction data collected through server logs.</li>
              <li><span className="text-[var(--text)]">Cookies and session tokens</span> — we use HTTP-only cookies to maintain your login session. No third-party advertising cookies are used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>To create and manage your account.</li>
              <li>To process payments and fulfil your purchases.</li>
              <li>To provide access to purchased wallpapers and manage your subscription.</li>
              <li>To send transactional emails (purchase confirmations, password resets). We do not send marketing emails without your consent.</li>
              <li>To improve the Service, fix bugs, and understand how the platform is used.</li>
              <li>To comply with applicable Indian laws including the Digital Personal Data Protection Act, 2023 (DPDP Act).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">4. Legal Basis for Processing (DPDP Act 2023)</h2>
            <p>
              Under India&apos;s Digital Personal Data Protection Act, 2023, we process your personal data on the basis of your
              consent (provided when you create an account) and as necessary to perform the contract of sale when you make
              a purchase. You may withdraw consent at any time by deleting your account; however, this will not affect
              the lawfulness of processing prior to withdrawal.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">5. Sharing of Information</h2>
            <p className="mb-3">We do not sell or rent your personal data. We may share information with:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><span className="text-[var(--text)]">Razorpay</span> — our payment processor, to complete transactions.</li>
              <li><span className="text-[var(--text)]">Amazon Web Services (AWS S3)</span> — our cloud storage provider, which hosts wallpaper files.</li>
              <li><span className="text-[var(--text)]">Law enforcement or regulatory authorities</span> — where required by applicable Indian law or a valid court order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Purchase records are retained for a
              minimum of 5 years as required by Indian tax and accounting laws. You may request deletion of your account
              and personal data by contacting us at the email below; purchase records required for legal compliance will
              be retained separately.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">7. Data Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption, HTTP-only authentication
              cookies, and access-controlled cloud storage. However, no method of transmission over the internet is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">8. Your Rights</h2>
            <p className="mb-3">Under applicable Indian law, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete personal data.</li>
              <li>Request deletion of your personal data (subject to legal retention obligations).</li>
              <li>Withdraw consent for data processing.</li>
              <li>Raise a grievance with us or with the Data Protection Board of India.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <span className="text-[var(--accent)]">nachiket4251@gmail.com</span>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">9. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed to individuals under 18 years of age. We do not knowingly collect personal
              data from minors. If we become aware that a minor has provided us with personal data, we will delete
              it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by updating
              the &quot;Last updated&quot; date at the top of this page. Continued use of the Service after any changes
              constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--text)] mb-3">11. Grievance Officer</h2>
            <p>
              In accordance with the Information Technology Act, 2000 and rules made thereunder, and the Consumer
              Protection (E-Commerce) Rules, 2020, the name and contact details of the Grievance Officer are:
            </p>
            <div className="mt-3 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1">
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

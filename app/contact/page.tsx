import { PublicNav } from '@/app/components/layout/PublicNav'
import { Mail, MapPin } from 'lucide-react'

export const metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <main className="w-full mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
          Contact Us
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">
          Have a question, an issue with a purchase, or just want to say hi? We&apos;d love to hear from you.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <Mail className="h-4 w-4 text-[var(--accent)] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Email</p>
              <a href="mailto:nachiket4251@gmail.com" className="text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                nachiket4251@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <MapPin className="h-4 w-4 text-[var(--accent)] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Location</p>
              <p className="text-sm text-[var(--text)]">Maharashtra, India</p>
            </div>
          </div>
        </div>

        <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--text)] mb-5">Send a Message</h2>
          <form action={`mailto:nachiket4251@gmail.com`} method="get" className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Your Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Nachiket Galande"
                className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-[var(--accent)]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Your Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-[var(--accent)]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Subject</label>
              <input
                type="text"
                name="subject"
                required
                placeholder="Purchase issue, general question…"
                className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-[var(--accent)]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Message</label>
              <textarea
                name="body"
                required
                rows={5}
                placeholder="Describe your issue or question…"
                className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 outline-none focus:border-[var(--accent)]/50 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="cursor-pointer w-full rounded-[4px] bg-[var(--accent)] py-2.5 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

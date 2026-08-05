import type { Metadata } from 'next'
import { Playfair_Display, Inter, Geist_Mono } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { ToastProvider } from '@/app/components/providers/ToastProvider'
import { CsrfProvider } from '@/app/components/providers/CsrfProvider'
import { NavigationLoadingProvider } from '@/app/components/providers/NavigationLoadingProvider'
import { ImageProtection } from '@/app/components/ImageProtection'
import { siteConfig } from '@/config/site'
import { Footer } from '@/app/components/layout/Footer'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'Vela — Premium Mobile Wallpapers', template: `%s | Vela` },
  description: 'Discover and download premium mobile wallpapers. Buy individual wallpapers for ₹99 or subscribe for unlimited downloads at ₹499/month.',
  keywords: ['mobile wallpapers', 'premium wallpapers', 'phone wallpapers', 'buy wallpapers india', 'HD wallpapers', 'aesthetic wallpapers', 'dark wallpapers', 'abstract wallpapers'],
  authors: [{ name: 'Nachiket Galande' }],
  creator: 'Nachiket Galande',
  metadataBase: new URL('https://vela.nachiketgalande.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://vela.nachiketgalande.com',
    siteName: 'Vela',
    title: 'Vela — Premium Mobile Wallpapers',
    description: 'Discover and download premium mobile wallpapers. Buy individual wallpapers for ₹99 or subscribe for unlimited downloads at ₹499/month.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vela — Premium Mobile Wallpapers',
    description: 'Discover and download premium mobile wallpapers. Buy individual wallpapers for ₹99 or subscribe for unlimited downloads at ₹499/month.',
    creator: '@nachiketgalande',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: 'pG6T5gNt-xUMx-a3ExepBXctnHk5gUuS5y8Nj4_Ln8E',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7168263119398383" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)] pb-12">
        <CsrfProvider>
          <Suspense>
            <NavigationLoadingProvider>
              <ImageProtection />
              {children}
              <Footer />
              <ToastProvider />
            </NavigationLoadingProvider>
          </Suspense>
        </CsrfProvider>
      </body>
    </html>
  )
}

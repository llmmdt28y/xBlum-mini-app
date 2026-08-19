import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'xBlum - AI Assistant',
  description: 'Your intelligent AI companion on Telegram',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)'  },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/*
        {/* Adsgram SDK — carga después del hydration, no bloquea */}
        <Script
          src="https://sad.adsgram.ai/js/sad.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${dmSans.variable} font-sans antialiased bg-[#0a0a0a]`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

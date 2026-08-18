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
          CRÍTICO: El script de Telegram DEBE cargarse antes de cualquier
          código de React. Sin esto, window.Telegram.WebApp no existe
          y initData queda vacío → 401 en el servidor.
          strategy="beforeInteractive" garantiza que carga antes del hydration.
        */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Script
          id="tg-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function syncViewport() {
                  if (window.Telegram && window.Telegram.WebApp) {
                    var tg = window.Telegram.WebApp;
                    if (tg.viewportHeight) {
                      document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px', 'important');
                    }
                    if (tg.viewportStableHeight) {
                      document.documentElement.style.setProperty('--tg-viewport-stable-height', tg.viewportStableHeight + 'px', 'important');
                    }
                  }
                }

                function initTg() {
                  if (window.Telegram && window.Telegram.WebApp) {
                    var tg = window.Telegram.WebApp;
                    tg.ready();
                    tg.expand();
                    syncViewport();

                    tg.onEvent('viewportChanged', function(isStateChanged) {
                      syncViewport();
                      if (isStateChanged) tg.expand();
                    });

                    try {
                      var platform = (tg.platform || '').toLowerCase();
                      var isWeb = platform === 'web' || platform === 'weba' || platform === 'webk';
                      if (!isWeb && typeof tg.requestFullscreen === 'function') {
                        tg.requestFullscreen();
                      }
                    } catch(e) {}
                  }
                }

                initTg();
                document.addEventListener('DOMContentLoaded', initTg);
                window.addEventListener('load', initTg);
              })();
            `
          }}
        />
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

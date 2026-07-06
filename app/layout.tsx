import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: 'Simple Budget',
  description: 'A simple, private, mobile-first daily budgeting app.',
  generator: 'https://tomja.au',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#3d9a6e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${nunito.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

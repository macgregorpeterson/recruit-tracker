import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RecruitTracker - Banking Recruiting CRM',
  description: 'Your complete banking recruiting command center. Coverage book, pipeline, calendar, notes, interview prep, and analytics all in one place.',
  keywords: ['recruiting', 'investment banking', 'CRM', 'job search', 'interviews'],
  authors: [{ name: 'RecruitTracker' }],
  openGraph: {
    title: 'RecruitTracker - Banking Recruiting CRM',
    description: 'Your complete banking recruiting command center',
    type: 'website',
  },
  manifest: '/manifest.json',
  themeColor: '#1e293b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RecruitTracker',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

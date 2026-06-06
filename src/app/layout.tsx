import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'MindTrack — Mental Wellness for Students',
  description: 'Track your mood, identify stress triggers, and receive personalized wellness support during exam preparation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased font-[var(--font-geist)]">{children}</body>
    </html>
  )
}

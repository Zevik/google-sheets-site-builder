import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Google Sheets Site Builder',
  description: 'בניית אתרים מקצועיים באמצעות Google Sheets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
} 
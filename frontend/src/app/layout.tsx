import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GOGO - Next-Gen Sports Betting',
  description: 'Leverage fan tokens to boost odds and turn losses into value',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-chiliz-dark">
          {children}
        </div>
      </body>
    </html>
  )
}
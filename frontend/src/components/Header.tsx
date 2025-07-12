'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-chiliz-gray border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-chiliz-red">
            GOGO
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition">
              Matches
            </Link>
            <Link href="/portfolio" className="text-gray-300 hover:text-white transition">
              Portfolio
            </Link>
            <Link href="/freebets" className="text-gray-300 hover:text-white transition">
              FreeBets
            </Link>
            <Link href="/staking" className="text-gray-300 hover:text-white transition">
              Staking
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Powered by <span className="text-chiliz-red font-semibold">Chiliz</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
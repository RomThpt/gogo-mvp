'use client'

import { useState, useEffect } from 'react'
import MatchCard from '@/components/MatchCard'
import Header from '@/components/Header'
import WalletConnect from '@/components/WalletConnect'

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  homeTeamLogo: string
  awayTeamLogo: string
  startTime: string
  status: string
  homeOdds: number
  drawOdds: number
  awayOdds: number
  fanTokens: {
    home: string
    away: string
  }
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/matches')
      const data = await response.json()
      setMatches(data)
    } catch (error) {
      console.error('Error fetching matches:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-chiliz-red to-red-400 bg-clip-text text-transparent">
              GOGO
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Next-Gen Sports Betting • Fan Token Powered • Loss Recovery
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="text-lg font-semibold mb-2">Boosted Odds</h3>
              <p className="text-gray-400">Up to +3.8% with fan tokens</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="text-lg font-semibold mb-2">Loss Recovery</h3>
              <p className="text-gray-400">20% recoverable after 14 days</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="text-lg font-semibold mb-2">Free Bets</h3>
              <p className="text-gray-400">30% of losses as freebets</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnect 
            isConnected={isConnected}
            userAddress={userAddress}
            onConnect={setIsConnected}
            onAddressChange={setUserAddress}
          />
        </div>

        {/* Matches Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Live Matches</h2>
          
          {matches.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">⚽</div>
              <p className="text-gray-400">Loading matches...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isConnected={isConnected}
                  userAddress={userAddress}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-chiliz-red">$2.4M</div>
            <div className="text-gray-400">Total Staked</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-400">$480K</div>
            <div className="text-gray-400">Recovered</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-400">15,234</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-400">3.8%</div>
            <div className="text-gray-400">Avg Boost</div>
          </div>
        </div>
      </main>
    </div>
  )
}
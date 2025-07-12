'use client'

import { useState } from 'react'
import BettingModal from './BettingModal'

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

interface MatchCardProps {
  match: Match
  isConnected: boolean
  userAddress: string
}

export default function MatchCard({ match, isConnected, userAddress }: MatchCardProps) {
  const [showBettingModal, setShowBettingModal] = useState(false)
  const [selectedPrediction, setSelectedPrediction] = useState<'home' | 'draw' | 'away' | null>(null)

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
  }

  const handleBetClick = (prediction: 'home' | 'draw' | 'away') => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    setSelectedPrediction(prediction)
    setShowBettingModal(true)
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">
            {formatTime(match.startTime)}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            match.status === 'live' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            {match.status.toUpperCase()}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">{match.homeTeam.slice(0, 2)}</span>
            </div>
            <div>
              <div className="font-semibold">{match.homeTeam}</div>
              <div className="text-sm text-chiliz-red">{match.fanTokens.home}</div>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-gray-400">VS</div>
          
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-semibold text-right">{match.awayTeam}</div>
              <div className="text-sm text-blue-400 text-right">{match.fanTokens.away}</div>
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">{match.awayTeam.slice(0, 2)}</span>
            </div>
          </div>
        </div>

        {/* Betting Options */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => handleBetClick('home')}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition group"
          >
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">{match.homeTeam}</div>
              <div className="text-lg font-bold group-hover:text-chiliz-red transition">
                {match.homeOdds.toFixed(2)}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleBetClick('draw')}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition group"
          >
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Draw</div>
              <div className="text-lg font-bold group-hover:text-chiliz-red transition">
                {match.drawOdds.toFixed(2)}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleBetClick('away')}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition group"
          >
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">{match.awayTeam}</div>
              <div className="text-lg font-bold group-hover:text-chiliz-red transition">
                {match.awayOdds.toFixed(2)}
              </div>
            </div>
          </button>
        </div>

        {/* Fan Token Boost Info */}
        <div className="mt-4 p-3 bg-chiliz-red/10 border border-chiliz-red/20 rounded-lg">
          <div className="text-sm text-chiliz-red font-semibold mb-1">
            🚀 Fan Token Boost Available
          </div>
          <div className="text-xs text-gray-400">
            Use {match.fanTokens.home} or {match.fanTokens.away} for +3.8% odds boost
          </div>
        </div>
      </div>

      {showBettingModal && selectedPrediction && (
        <BettingModal
          match={match}
          prediction={selectedPrediction}
          userAddress={userAddress}
          onClose={() => {
            setShowBettingModal(false)
            setSelectedPrediction(null)
          }}
        />
      )}
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'

interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  fanTokens: {
    home: string
    away: string
  }
}

interface BettingModalProps {
  match: Match
  prediction: 'home' | 'draw' | 'away'
  userAddress: string
  onClose: () => void
}

interface OddsCalculation {
  baseOdds: number
  boostedOdds: number
  boost: number
  fanToken: string | null
}

export default function BettingModal({ match, prediction, userAddress, onClose }: BettingModalProps) {
  const [amount, setAmount] = useState('')
  const [selectedFanToken, setSelectedFanToken] = useState('')
  const [oddsData, setOddsData] = useState<OddsCalculation | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)

  useEffect(() => {
    calculateOdds()
  }, [selectedFanToken])

  const calculateOdds = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/calculate-odds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          prediction,
          fanToken: selectedFanToken || null
        })
      })
      const data = await response.json()
      setOddsData(data)
    } catch (error) {
      console.error('Error calculating odds:', error)
    }
  }

  const placeBet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsPlacing(true)
    try {
      const response = await fetch('http://localhost:3001/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          matchId: match.id,
          prediction,
          amount: parseFloat(amount),
          fanToken: selectedFanToken || null
        })
      })

      if (response.ok) {
        alert('Bet placed successfully!')
        onClose()
      } else {
        alert('Failed to place bet')
      }
    } catch (error) {
      console.error('Error placing bet:', error)
      alert('Error placing bet')
    }
    setIsPlacing(false)
  }

  const getPredictionName = () => {
    switch(prediction) {
      case 'home': return match.homeTeam
      case 'draw': return 'Draw'
      case 'away': return match.awayTeam
      default: return ''
    }
  }

  const getAvailableFanTokens = () => {
    const tokens = []
    if (prediction === 'home') tokens.push(match.fanTokens.home)
    if (prediction === 'away') tokens.push(match.fanTokens.away)
    return tokens
  }

  const potentialPayout = amount && oddsData ? 
    (parseFloat(amount) * oddsData.boostedOdds).toFixed(2) : '0.00'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-chiliz-gray rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Place Bet</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Bet Details */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="text-lg font-semibold">{match.homeTeam} vs {match.awayTeam}</div>
            <div className="text-chiliz-red font-bold text-xl">
              Betting on: {getPredictionName()}
            </div>
          </div>

          {/* Current Odds */}
          {oddsData && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span>Base Odds:</span>
                <span className="font-bold">{oddsData.baseOdds.toFixed(2)}</span>
              </div>
              {oddsData.boost > 0 && (
                <>
                  <div className="flex justify-between items-center text-chiliz-red">
                    <span>Fan Token Boost:</span>
                    <span className="font-bold">+{oddsData.boost}%</span>
                  </div>
                  <div className="border-t border-gray-600 mt-2 pt-2"></div>
                </>
              )}
              <div className="flex justify-between items-center text-green-400 font-bold">
                <span>Final Odds:</span>
                <span>{oddsData.boostedOdds.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Fan Token Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Fan Token Boost (Optional)
          </label>
          <select 
            value={selectedFanToken}
            onChange={(e) => setSelectedFanToken(e.target.value)}
            className="input-field w-full"
          >
            <option value="">No fan token</option>
            {getAvailableFanTokens().map(token => (
              <option key={token} value={token}>
                {token} (+3.8% boost)
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Bet Amount (CHZ)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="input-field w-full"
            min="0"
            step="0.01"
          />
        </div>

        {/* Potential Payout */}
        <div className="bg-chiliz-red/10 border border-chiliz-red/20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Potential Payout:</span>
            <span className="text-2xl font-bold text-green-400">
              {potentialPayout} CHZ
            </span>
          </div>
          {amount && (
            <div className="text-sm text-gray-400 mt-1">
              Potential Profit: {(parseFloat(potentialPayout) - parseFloat(amount || '0')).toFixed(2)} CHZ
            </div>
          )}
        </div>

        {/* Loss Recovery Info */}
        <div className="bg-blue-900/20 border border-blue-400/20 rounded-lg p-3 mb-6">
          <div className="text-sm text-blue-400 font-semibold mb-1">
            💡 GOGO Loss Protection
          </div>
          <div className="text-xs text-gray-400">
            If you lose: 20% recoverable after 14 days + 30% as freebets
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button 
            onClick={placeBet}
            disabled={isPlacing || !amount}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isPlacing ? 'Placing...' : 'Place Bet'}
          </button>
        </div>
      </div>
    </div>
  )
}
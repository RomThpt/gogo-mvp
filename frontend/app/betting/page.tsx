"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Trophy, Clock, Zap, Coins, CheckCircle, XCircle, AlertCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { PSG_TOKEN_ADDRESS, BARCA_TOKEN_ADDRESS } from "@/lib/contracts"

export default function BettingPage() {
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [betAmount, setBetAmount] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [betCurrency, setBetCurrency] = useState("") // Will be set when match is selected
  const [toast, setToast] = useState(null)
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  
  const { 
    isConnected, 
    account, 
    balance, 
    chainId, 
    connectWallet, 
    switchToLocalhost, 
    placeBet: placeBetContract,
    getUserBets,
    getUserFreebets 
  } = useWeb3()

  // Toast functions
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Show connection status
  useEffect(() => {
    if (isConnected && account) {
      showToast("success", `Connected to ${account.slice(0, 6)}...${account.slice(-4)}`)
    }
  }, [isConnected, account])

  // Check if on correct network
  useEffect(() => {
    if (isConnected && chainId && chainId !== 31337) {
      showToast("warning", "Please switch to Localhost Hardhat network for betting")
    }
  }, [isConnected, chainId])

  // Set default currency when match is selected
  useEffect(() => {
    if (selectedMatch && !betCurrency) {
      setBetCurrency("CHZ")
    }
  }, [selectedMatch])

  // Helper function to get current odds based on currency and team selection
  const getCurrentOdds = () => {
    if (!selectedMatch || !selectedTeam) return 0
    
    const isHome = selectedTeam === "home"
    const isUsingTeamToken = betCurrency === (isHome ? selectedMatch.homeFanToken : selectedMatch.awayFanToken)
    
    if (isUsingTeamToken) {
      return isHome ? selectedMatch.homeBoostedOdds : selectedMatch.awayBoostedOdds
    } else {
      return isHome ? selectedMatch.homeOdds : selectedMatch.awayOdds
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.message.includes('MetaMask is not installed')) {
        showToast("warning", "MetaMask is not installed. Please install MetaMask to connect your wallet.")
      } else {
        showToast("error", "Failed to connect wallet. Please try again.")
      }
    }
  }

  const matches = [
    {
      id: 1,
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      homeOdds: 2.1,
      awayOdds: 1.8,
      homeBoostedOdds: 2.4, // Boosted odds when betting with team token
      awayBoostedOdds: 2.0,
      time: "15:00",
      date: "Today",
      homeFanToken: "BAR",
      awayFanToken: "REA",
      chzEquivalent: "50 CHZ = 1 BAR",
      homeLogo: "/images/barcelona-logo.svg",
      awayLogo: "/images/real-madrid-logo.svg",
    },
    {
      id: 2,
      homeTeam: "PSG",
      awayTeam: "Manchester City",
      homeOdds: 1.9,
      awayOdds: 2.2,
      homeBoostedOdds: 2.1,
      awayBoostedOdds: 2.5,
      time: "20:45",
      date: "Today",
      homeFanToken: "PSG",
      awayFanToken: "MAN",
      chzEquivalent: "45 CHZ = 1 PSG",
      homeLogo: "/images/psg-logo.svg",
      awayLogo: "/images/manchester-city-logo.svg",
    },
    {
      id: 3,
      homeTeam: "Juventus",
      awayTeam: "AC Milan",
      homeOdds: 2.5,
      awayOdds: 1.6,
      homeBoostedOdds: 2.8,
      awayBoostedOdds: 1.8,
      time: "18:30",
      date: "Tomorrow",
      homeFanToken: "JUV",
      awayFanToken: "ACM",
      chzEquivalent: "55 CHZ = 1 JUV",
      homeLogo: "/images/juventus-logo.svg",
      awayLogo: "/images/ac-milan-logo.svg",
    },
  ]

  const placeBet = async () => {
    if (!isConnected) {
      showToast("warning", "Please connect your wallet first")
      return
    }

    if (chainId !== 31337) {
      showToast("warning", "Please switch to Localhost Hardhat network")
      try {
        await switchToLocalhost()
        return
      } catch (error) {
        showToast("error", "Failed to switch network")
        return
      }
    }

    if (!selectedMatch || !selectedTeam || !betAmount) {
      showToast("warning", "Please fill all fields")
      return
    }

    const betAmountNum = parseFloat(betAmount)
    if (betAmountNum <= 0) {
      showToast("warning", "Bet amount must be greater than 0")
      return
    }

    const balanceNum = parseFloat(balance)
    if (betAmountNum > balanceNum) {
      showToast("warning", "Insufficient balance")
      return
    }

    setIsPlacingBet(true)

    try {
      showToast("warning", "Please confirm the transaction in MetaMask...")

      const isFanToken = betCurrency !== "CHZ"
      let tokenAddress = undefined
      
      if (isFanToken) {
        if (betCurrency === "PSG") {
          tokenAddress = PSG_TOKEN_ADDRESS
        } else if (betCurrency === "BAR") {
          tokenAddress = BARCA_TOKEN_ADDRESS
        }
      }
      
      const betData = {
        amount: betAmount,
        isFanToken,
        teamSelection: selectedTeam as 'home' | 'away',
        currency: betCurrency,
        tokenAddress,
      }

      const tx = await placeBetContract(betData)
      
      showToast("warning", `Transaction submitted! Hash: ${tx.hash.slice(0, 10)}...`)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      
      if (receipt.status === 1) {
        showToast("success", 
          `Bet placed successfully! ${betAmount} ${betCurrency} on ${selectedTeam === "home" ? selectedMatch.homeTeam : selectedMatch.awayTeam}`
        )
        
        // Reset form
        setBetAmount("")
        setSelectedTeam("")
        setSelectedMatch(null)
        setBetCurrency("")
      } else {
        showToast("error", "Transaction failed")
      }
    } catch (error: any) {
      console.error("Error placing bet:", error)
      
      if (error.code === 4001) {
        showToast("warning", "Transaction cancelled by user")
      } else if (error.message?.includes("insufficient funds")) {
        showToast("error", "Insufficient funds for transaction")
      } else if (error.message?.includes("user rejected")) {
        showToast("warning", "Transaction rejected by user")
      } else {
        showToast("error", `Failed to place bet: ${error.message || "Unknown error"}`)
      }
    } finally {
      setIsPlacingBet(false)
    }
  }

  return (
    <div className="min-h-screen text-black relative overflow-hidden" style={{
      background: `
        radial-gradient(circle 400px at 20% 20%, rgba(250, 1, 77, 1) 0%, transparent 50%),
        radial-gradient(circle 300px at 80% 30%, rgba(250, 1, 77, 0.9) 0%, transparent 50%),
        radial-gradient(circle 500px at 40% 70%, rgba(250, 1, 77, 0.95) 0%, transparent 50%),
        radial-gradient(circle 350px at 85% 80%, rgba(250, 1, 77, 0.8) 0%, transparent 50%),
        radial-gradient(circle 250px at 10% 60%, rgba(250, 1, 77, 0.7) 0%, transparent 50%),
        radial-gradient(circle 200px at 60% 40%, rgba(220, 0, 60, 0.9) 0%, transparent 50%),
        linear-gradient(135deg, #D1003D 0%, #FA014D 20%, #FF1A75 40%, #FF4D94 60%, #FF80B3 80%, #FFB3D1 100%)
      `
    }}>
      {/* Vagues animées */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg viewBox="0 0 1200 800" className="w-full h-full">
            <path 
              d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z" 
              fill="rgba(250, 1, 77, 0.3)"
              className="animate-pulse"
            />
            <path 
              d="M0,500 Q400,400 800,500 T1200,500 L1200,800 L0,800 Z" 
              fill="rgba(255, 26, 117, 0.2)"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>
      </div>
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className="fixed top-4 left-1/2 z-50 min-w-80"
        >
          <div className={`flex items-center p-4 rounded-lg backdrop-blur-sm border-l-4 shadow-lg ${
            toast.type === "success" 
              ? "bg-green-500/90 border-green-400 text-white" 
              : toast.type === "error" 
              ? "bg-red-500/90 border-red-400 text-white"
              : "bg-orange-500/90 border-orange-400 text-white"
          }`} style={{
            backgroundColor: toast.type === "success" ? 'rgba(34, 197, 94, 0.9)' : 
                            toast.type === "error" ? 'rgba(239, 68, 68, 0.9)' : 
                            'rgba(250, 1, 77, 0.9)'
          }}>
            <div className="mr-3">
              {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
              {toast.type === "error" && <XCircle className="w-5 h-5" />}
              {toast.type === "warning" && <AlertCircle className="w-5 h-5" />}
            </div>
            <p className="font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
      <div className="container mx-auto px-4 py-8 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-start mb-4 relative z-20">
            <Link href="/" className="inline-flex items-center hover:opacity-80 text-white cursor-pointer z-30 relative">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>

            {/* Logo centré */}
            <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
              <img src="/LOGO.svg" alt="GOGO Logo" className="w-32 h-12" />
            </div>

            {/* Profile Button */}
            {isConnected && (
              <Link href="/profile">
                <div className="relative">
                  <div className="absolute inset-0 transform skew-x-2 rounded-lg" style={{ backgroundColor: '#FA014D' }}></div>
                  <Button 
                    variant="outline" 
                    className="relative bg-white/20 border-white/30 text-white hover:opacity-90 backdrop-blur-sm transition-all duration-300"
                    style={{ borderColor: '#FA014D' }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </Link>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Place Your Bet
          </h1>
          <p className="text-xl text-white">Choose your match, team, and currency</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Matches List */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold mb-6 text-white">Available Matches</h2>
            <div className="space-y-6">
              {matches.map((match) => (
                <motion.div key={match.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div
                    className={`relative cursor-pointer transition-all duration-300 ${
                      selectedMatch?.id === match.id ? "transform scale-105" : ""
                    }`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm transform skew-y-1 rounded-lg"></div>
                    <div className="absolute inset-0 bg-gray-50/70 border border-gray-200/80 transform -skew-y-1 rounded-lg"></div>

                    <div className="relative p-6 border-l-4 border-red-500">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2 bg-white/40 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4" style={{ color: '#FA014D' }} />
                          <span className="text-sm text-black/80 font-mono">
                            {match.date} • {match.time}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <div className="px-3 py-1 rounded-full" style={{ backgroundColor: '#FA014D' }}>
                            <span className="text-sm font-bold text-white">{match.homeFanToken}</span>
                          </div>
                          <div className="px-3 py-1 rounded-full" style={{ backgroundColor: '#FA014D' }}>
                            <span className="text-sm font-bold text-white">{match.awayFanToken}</span>
                          </div>
                          <div className="bg-white/40 px-3 py-1 rounded-full" style={{ border: '1px solid #FA014D' }}>
                            <span className="text-sm font-bold" style={{ color: '#FA014D' }}>CHZ</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-center relative">
                          <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-full flex items-center justify-center overflow-hidden">
                            {match.homeLogo ? (
                              <img 
                                src={match.homeLogo} 
                                alt={match.homeTeam}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <span 
                              className="text-sm font-bold text-black"
                              style={{ display: match.homeLogo ? 'none' : 'block' }}
                            >
                              {match.homeTeam.slice(0, 3).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-bold text-lg mb-1 text-black">{match.homeTeam}</p>
                          <div className="bg-white/50 px-3 py-2 rounded-lg relative" style={{ border: '1px solid #FA014D' }}>
                            {/* Boosted odds notification */}
                            <div className="absolute -top-2 -left-2 z-10">
                              <div className="px-2 py-1 text-xs font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20" style={{ backgroundColor: 'rgba(250, 1, 77, 0.4)' }}>
                                {match.homeBoostedOdds}
                              </div>
                            </div>
                            <p className="text-2xl font-black" style={{ color: '#FA014D' }}>{match.homeOdds}</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center transform rotate-45">
                            <Trophy className="w-6 h-6 text-black transform -rotate-45" />
                          </div>
                          <p className="text-xs text-black/60 mt-2 font-mono">VS</p>
                        </div>

                        <div className="text-center relative">
                          <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-full flex items-center justify-center overflow-hidden">
                            {match.awayLogo ? (
                              <img 
                                src={match.awayLogo} 
                                alt={match.awayTeam}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <span 
                              className="text-sm font-bold text-black"
                              style={{ display: match.awayLogo ? 'none' : 'block' }}
                            >
                              {match.awayTeam.slice(0, 3).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-bold text-lg mb-1 text-black">{match.awayTeam}</p>
                          <div className="bg-white/50 px-3 py-2 rounded-lg relative" style={{ border: '1px solid #FA014D' }}>
                            {/* Boosted odds notification */}
                            <div className="absolute -top-2 -left-2 z-10">
                              <div className="px-2 py-1 text-xs font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20" style={{ backgroundColor: 'rgba(250, 1, 77, 0.4)' }}>
                                {match.awayBoostedOdds}
                              </div>
                            </div>
                            <p className="text-2xl font-black" style={{ color: '#FA014D' }}>{match.awayOdds}</p>
                          </div>
                        </div>
                      </div>

                      {/* Exchange rate */}
                      <div className="mt-4 text-center">
                        <p className="text-xs text-black/60 font-mono">{match.chzEquivalent}</p>
                      </div>

                      {selectedMatch?.id === match.id && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-pink-500"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Betting Form */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div className="sticky top-24">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm transform skew-x-12 rounded-lg"></div>
                <div className="relative bg-gray-50/70 p-6 border-2 border-gray-200/80">
                  <h2 className="text-2xl font-bold" style={{ color: '#FA014D' }}>Place Your Bet</h2>
                </div>
              </div>

              {selectedMatch ? (
                <div className="space-y-6">
                  {/* Match sélectionné */}
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-lg blur opacity-50" style={{ backgroundColor: 'rgba(250, 1, 77, 0.3)' }}></div>
                    <div className="relative bg-gray-100/80 backdrop-blur-sm p-4 rounded-lg border" style={{ borderColor: 'rgba(250, 1, 77, 0.5)' }}>
                      <p className="text-sm mb-2 font-mono font-bold" style={{ color: '#FA014D' }}>SELECTED MATCH</p>
                      <p className="font-bold text-lg text-black">
                        {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                      </p>
                    </div>
                  </div>

                  {/* Choix de la devise */}
                  <div>
                    <label className="block text-sm font-bold mb-4 text-black uppercase tracking-wider">
                      Bet Currency
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        className={`relative p-4 border-2 transition-all duration-300 rounded-lg ${
                          betCurrency === "CHZ"
                            ? "transform scale-105"
                            : "border-white/40 bg-white/20"
                        }`}
                        style={{
                          borderColor: betCurrency === "CHZ" ? '#FA014D' : undefined,
                          backgroundColor: betCurrency === "CHZ" ? 'rgba(250, 1, 77, 0.2)' : undefined
                        }}
                        onClick={() => setBetCurrency("CHZ")}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Coins className="w-6 h-6 text-white" />
                          <span className="font-bold text-white">CHZ</span>
                        </div>
                        <p className="text-xs text-black/60 mt-1">Ethereum</p>
                      </button>

                      <button
                        className={`relative p-4 border-2 transition-all duration-300 rounded-lg ${
                          betCurrency === selectedMatch.homeFanToken
                            ? "transform scale-105"
                            : "border-white/40 bg-white/20"
                        }`}
                        style={{
                          borderColor: betCurrency === selectedMatch.homeFanToken ? '#FA014D' : undefined,
                          backgroundColor: betCurrency === selectedMatch.homeFanToken ? 'rgba(250, 1, 77, 0.2)' : undefined
                        }}
                        onClick={() => setBetCurrency(selectedMatch.homeFanToken)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Trophy className="w-6 h-6 text-white" />
                          <span className="font-bold text-white">{selectedMatch.homeFanToken}</span>
                        </div>
                        <p className="text-xs text-black/60 mt-1">{selectedMatch.homeTeam} Token</p>
                        {betCurrency === selectedMatch.homeFanToken && selectedTeam === "home" && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            BOOSTED!
                          </div>
                        )}
                      </button>

                      <button
                        className={`relative p-4 border-2 transition-all duration-300 rounded-lg ${
                          betCurrency === selectedMatch.awayFanToken
                            ? "transform scale-105"
                            : "border-white/40 bg-white/20"
                        }`}
                        style={{
                          borderColor: betCurrency === selectedMatch.awayFanToken ? '#FA014D' : undefined,
                          backgroundColor: betCurrency === selectedMatch.awayFanToken ? 'rgba(250, 1, 77, 0.2)' : undefined
                        }}
                        onClick={() => setBetCurrency(selectedMatch.awayFanToken)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Trophy className="w-6 h-6 text-white" />
                          <span className="font-bold text-white">{selectedMatch.awayFanToken}</span>
                        </div>
                        <p className="text-xs text-black/60 mt-1">{selectedMatch.awayTeam} Token</p>
                        {betCurrency === selectedMatch.awayFanToken && selectedTeam === "away" && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            BOOSTED!
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sélection d'équipe */}
                  <div className="mt-6">
                    <label className="block text-sm font-bold mb-4 text-black uppercase tracking-wider">
                      Choose Team
                    </label>
                    <div className="grid grid-cols-2 gap-4 relative mt-4">
                      <div className="relative">
                        {/* Boosted odds notification - positioned outside button */}
                        {betCurrency === selectedMatch.homeFanToken && (
                          <div className="absolute -top-3 left-4 z-30">
                            <div className="px-2 py-1 text-xs font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20" style={{ backgroundColor: 'rgba(250, 1, 77, 0.6)' }}>
                              BOOSTED!
                            </div>
                          </div>
                        )}
                        
                        <button
                          className={`relative p-4 border-2 transition-all duration-300 w-full ${
                            selectedTeam === "home"
                              ? "transform scale-105 bg-white/30"
                              : "border-white/40 bg-white/20"
                          }`}
                          onClick={() => setSelectedTeam("home")}
                          style={{ 
                            clipPath: "polygon(0 0, 90% 0, 100% 100%, 10% 100%)",
                            borderColor: selectedTeam === "home" ? '#FA014D' : undefined,
                            backgroundColor: selectedTeam === "home" ? 'rgba(250, 1, 77, 0.2)' : undefined
                          }}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-2 bg-white rounded-full flex items-center justify-center overflow-hidden">
                              {selectedMatch.homeLogo ? (
                                <img 
                                  src={selectedMatch.homeLogo} 
                                  alt={selectedMatch.homeTeam}
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <span 
                                className="text-xs font-bold text-black"
                                style={{ display: selectedMatch.homeLogo ? 'none' : 'block' }}
                              >
                                {selectedMatch.homeTeam.slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                            <p className="font-bold text-sm mb-1 text-black">{selectedMatch.homeTeam}</p>
                            <p className="text-xl font-black" style={{ color: '#FA014D' }}>
                              {betCurrency === selectedMatch.homeFanToken ? selectedMatch.homeBoostedOdds : selectedMatch.homeOdds}
                            </p>
                          </div>
                        </button>
                      </div>

                      <div className="relative">
                        {/* Boosted odds notification - positioned outside button */}
                        {betCurrency === selectedMatch.awayFanToken && (
                          <div className="absolute -top-3 left-4 z-30">
                            <div className="px-2 py-1 text-xs font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20" style={{ backgroundColor: 'rgba(250, 1, 77, 0.6)' }}>
                              BOOSTED!
                            </div>
                          </div>
                        )}
                        
                        <button
                          className={`relative p-4 border-2 transition-all duration-300 w-full ${
                            selectedTeam === "away"
                              ? "transform scale-105 bg-white/30"
                              : "border-white/40 bg-white/20"
                          }`}
                          onClick={() => setSelectedTeam("away")}
                          style={{ 
                            clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)",
                            borderColor: selectedTeam === "away" ? '#FA014D' : undefined,
                            backgroundColor: selectedTeam === "away" ? 'rgba(250, 1, 77, 0.2)' : undefined
                          }}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-2 bg-white rounded-full flex items-center justify-center overflow-hidden">
                              {selectedMatch.awayLogo ? (
                                <img 
                                  src={selectedMatch.awayLogo} 
                                  alt={selectedMatch.awayTeam}
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <span 
                                className="text-xs font-bold text-black"
                                style={{ display: selectedMatch.awayLogo ? 'none' : 'block' }}
                              >
                                {selectedMatch.awayTeam.slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                            <p className="font-bold text-sm mb-1 text-black">{selectedMatch.awayTeam}</p>
                            <p className="text-xl font-black" style={{ color: '#FA014D' }}>
                              {betCurrency === selectedMatch.awayFanToken ? selectedMatch.awayBoostedOdds : selectedMatch.awayOdds}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Montant du pari */}
                  <div>
                    <label className="block text-sm font-bold mb-3 text-white uppercase tracking-wider">
                      Bet Amount ({betCurrency})
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder={`Enter amount in ${betCurrency}`}
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="bg-white/90 backdrop-blur-sm border-2 h-14 text-lg text-black placeholder:text-black/60 font-mono rounded-lg"
                        style={{ 
                          borderColor: '#FA014D'
                        }}
                      />
                    </div>
                    {betCurrency && (
                      <p className="text-xs text-white/80 mt-2 font-mono">
                        1 {betCurrency} = 50 CHZ (example rate)
                      </p>
                    )}
                  </div>

                  {/* Résumé du pari */}
                  {betAmount && selectedTeam && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                      <div className="absolute inset-0 bg-white/20 transform -skew-y-1"></div>
                      <div className="relative bg-white/30 backdrop-blur-sm p-4 border-l-4" style={{ borderLeftColor: '#FA014D' }}>
                        <div className="space-y-3">
                          {/* Boosted odds indicator */}
                          {((selectedTeam === "home" && betCurrency === selectedMatch.homeFanToken) || 
                            (selectedTeam === "away" && betCurrency === selectedMatch.awayFanToken)) && (
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-center font-bold text-sm">
                              🚀 BOOSTED ODDS ACTIVE! Higher payout with team token!
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <span className="text-black/80 font-mono text-sm">POTENTIAL WIN:</span>
                            <div className="text-right">
                              <span className="font-black text-xl" style={{ color: '#FA014D' }}>
                                {(
                                  Number.parseFloat(betAmount) * getCurrentOdds()
                                ).toFixed(2)}{" "}
                                {betCurrency}
                              </span>
                              <p className="text-xs text-black/60">
                                @ {getCurrentOdds()} odds
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-black/80 font-mono text-sm">IF LOST (AUTO-STAKED):</span>
                            <span className="font-black" style={{ color: '#FA014D' }}>
                              {betCurrency === "CHZ"
                                ? betAmount
                                : (Number.parseFloat(betAmount || "0") * 50).toFixed(2)}{" "}
                              CHZ
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Bouton de confirmation */}
                  <div className="relative">
                    <div className="absolute inset-0 transform skew-x-2 rounded-lg" style={{ backgroundColor: '#FA014D' }}></div>
                    <Button
                      onClick={isConnected ? placeBet : handleConnectWallet}
                      className="relative w-full text-white hover:opacity-90 h-14 text-lg font-bold border-2 transition-all duration-300 shadow-lg"
                      style={{ 
                        backgroundColor: '#FA014D',
                        borderColor: '#FA014D'
                      }}
                      disabled={isConnected && (!betAmount || !selectedTeam || isPlacingBet)}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {isPlacingBet 
                        ? "PLACING BET..." 
                        : isConnected 
                        ? "CONFIRM BET WITH METAMASK" 
                        : "CONNECT WALLET"
                      }
                    </Button>
                  </div>

                  {/* Network and Balance Info */}
                  {isConnected && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/20 backdrop-blur-sm p-4 rounded-lg border border-white/30">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-black/80">Wallet:</span>
                          <span className="font-mono text-black">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/80">Balance:</span>
                          <span className="font-mono text-black">{parseFloat(balance).toFixed(4)} CHZ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/80">Network:</span>
                          <span className={`font-mono ${chainId === 31337 ? 'text-green-600' : 'text-red-600'}`}>
                            {chainId === 31337 ? 'Localhost Hardhat ✓' : `Chain ${chainId} ✗`}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center transform rotate-12 mb-6">
                    <Trophy className="w-12 h-12 text-black transform -rotate-12" />
                  </div>
                  <p className="text-black/60 font-mono">SELECT A MATCH TO PLACE YOUR BET</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

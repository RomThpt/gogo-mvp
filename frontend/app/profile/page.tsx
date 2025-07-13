"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Trophy, Clock, Coins, Gift, Lock, Unlock, RefreshCw, CheckCircle, XCircle, AlertCircle, Calendar, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { ethers } from "ethers"

export default function ProfilePage() {
  const [userBets, setUserBets] = useState([])
  const [userPositions, setUserPositions] = useState([])
  const [freebets, setFreebets] = useState("0")
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContest, setSelectedContest] = useState(null)

  const { 
    isConnected, 
    account, 
    getUserBets,
    getUserFreebets,
    getUserPositions,
    claimPosition,
    restakePosition,
    useFreebets,
    connectWallet 
  } = useWeb3()

  // Toast functions
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Load user data
  const loadUserData = async () => {
    if (!isConnected) return
    
    setIsLoading(true)
    try {
      const [bets, positions, freebetBalance] = await Promise.all([
        getUserBets(),
        getUserPositions(),
        getUserFreebets()
      ])
      
      setUserBets(bets)
      setUserPositions(positions)
      setFreebets(freebetBalance)
    } catch (error) {
      console.error('Error loading user data:', error)
      showToast("error", "Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected) {
      loadUserData()
    }
  }, [isConnected])

  const handleClaimPosition = async (positionId) => {
    try {
      showToast("warning", "Please confirm the transaction in MetaMask...")
      const tx = await claimPosition(positionId)
      showToast("warning", `Transaction submitted! Hash: ${tx.hash.slice(0, 10)}...`)
      
      const receipt = await tx.wait()
      if (receipt.status === 1) {
        showToast("success", "Position claimed successfully!")
        loadUserData() // Refresh data
      } else {
        showToast("error", "Transaction failed")
      }
    } catch (error) {
      console.error('Error claiming position:', error)
      showToast("error", `Failed to claim position: ${error.message}`)
    }
  }

  const handleRestakePosition = async (positionId) => {
    try {
      showToast("warning", "Please confirm the transaction in MetaMask...")
      const tx = await restakePosition(positionId)
      showToast("warning", `Transaction submitted! Hash: ${tx.hash.slice(0, 10)}...`)
      
      const receipt = await tx.wait()
      if (receipt.status === 1) {
        showToast("success", "Position restaked with 5% bonus!")
        loadUserData() // Refresh data
      } else {
        showToast("error", "Transaction failed")
      }
    } catch (error) {
      console.error('Error restaking position:', error)
      showToast("error", `Failed to restake position: ${error.message}`)
    }
  }

  const handleEnterContest = async (contest) => {
    try {
      const freebetBalance = parseFloat(freebets)
      if (freebetBalance < contest.cost) {
        showToast("warning", `Insufficient freebets. Need ${contest.cost}, have ${freebetBalance.toFixed(2)}`)
        return
      }

      showToast("warning", "Please confirm the transaction in MetaMask...")
      const tx = await useFreebets(contest.cost.toString())
      showToast("warning", `Transaction submitted! Hash: ${tx.hash.slice(0, 10)}...`)
      
      const receipt = await tx.wait()
      if (receipt.status === 1) {
        showToast("success", `Successfully entered ${contest.name}! Good luck!`)
        loadUserData() // Refresh freebets
      } else {
        showToast("error", "Transaction failed")
      }
    } catch (error) {
      console.error('Error entering contest:', error)
      showToast("error", `Failed to enter contest: ${error.message}`)
    }
  }

  // Mock contests data
  const contests = [
    {
      id: 1,
      name: "Daily Challenge",
      description: "Predict 3 match outcomes correctly",
      cost: 10,
      duration: "24 hours",
      participants: 1247,
      prize: "VIP Match Tickets",
      type: "daily"
    },
    {
      id: 2,
      name: "Weekly Leaderboard",
      description: "Top 10 predictors win exclusive merchandise",
      cost: 50,
      duration: "7 days",
      participants: 432,
      prize: "Signed Jerseys",
      type: "weekly"
    },
    {
      id: 3,
      name: "Monthly Grand Prize",
      description: "Enter for a chance to win training ground access",
      cost: 150,
      duration: "30 days",
      participants: 89,
      prize: "Training Ground Access + Signed Ball",
      type: "monthly"
    }
  ]

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  const isPositionUnlocked = (unlockTimestamp) => {
    return Date.now() / 1000 >= Number(unlockTimestamp)
  }

  const getTimeRemaining = (unlockTimestamp) => {
    const now = Date.now() / 1000
    const unlock = Number(unlockTimestamp)
    const remaining = unlock - now
    
    if (remaining <= 0) return "Unlocked"
    
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    
    return `${days}d ${hours}h remaining`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen text-black relative flex items-center justify-center" style={{
        background: 'radial-gradient(ellipse 250% 180% at 50% 100%, white 0%, white 15%, #FA014D 45%, #FA014D 100%)'
      }}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#FA014D' }} />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to view your betting history, positions, and freebets.</p>
            <Button onClick={connectWallet} className="w-full" style={{ backgroundColor: '#FA014D' }}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-black relative" style={{
      background: 'radial-gradient(ellipse 250% 180% at 50% 100%, white 0%, white 15%, #FA014D 45%, #FA014D 100%)'
    }}>
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
          }`}>
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

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="inline-flex items-center hover:opacity-80 mb-4" style={{ color: '#FA014D' }}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Your Profile
          </h1>
          <p className="text-xl text-white">Track your bets, positions, and freebets</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: '#FA014D' }} />
              <p className="text-2xl font-bold text-white">{userBets.length}</p>
              <p className="text-sm text-white/80">Total Bets</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2" style={{ color: '#FA014D' }} />
              <p className="text-2xl font-bold text-white">{parseFloat(freebets).toFixed(2)}</p>
              <p className="text-sm text-white/80">Freebets (CHZ)</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 text-center">
              <Lock className="w-8 h-8 mx-auto mb-2" style={{ color: '#FA014D' }} />
              <p className="text-2xl font-bold text-white">{userPositions.length}</p>
              <p className="text-sm text-white/80">Staked Positions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 text-center">
              <Unlock className="w-8 h-8 mx-auto mb-2" style={{ color: '#FA014D' }} />
              <p className="text-2xl font-bold text-white">
                {userPositions.filter(pos => isPositionUnlocked(pos.unlockTimestamp) && !pos.claimed && !pos.restaked).length}
              </p>
              <p className="text-sm text-white/80">Claimable</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="bets" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="bets" className="data-[state=active]:bg-white/30">Betting History</TabsTrigger>
              <TabsTrigger value="positions" className="data-[state=active]:bg-white/30">Staked Positions</TabsTrigger>
              <TabsTrigger value="contests" className="data-[state=active]:bg-white/30">Freebet Contests</TabsTrigger>
            </TabsList>

            <TabsContent value="bets" className="mt-6">
              <Card className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardHeader>
                  <CardTitle className="text-black">Your Betting History</CardTitle>
                  <CardDescription className="text-black">All your placed bets and their outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#FA014D' }} />
                      <p className="text-white/80">Loading bets...</p>
                    </div>
                  ) : userBets.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-white/50" />
                      <p className="text-white/80">No bets placed yet</p>
                      <Link href="/betting">
                        <Button className="mt-4" style={{ backgroundColor: '#FA014D' }}>
                          Place Your First Bet
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userBets.map((bet, index) => (
                        <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant={bet.processed ? (bet.won ? "default" : "destructive") : "secondary"}>
                                {bet.processed ? (bet.won ? "Won" : "Lost") : "Pending"}
                              </Badge>
                              <Badge variant="outline" className="text-black border-black/30">
                                Fan Token
                              </Badge>
                            </div>
                            <p className="text-sm text-black/60">Invalid Date</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-black/80">Bet Amount</p>
                              <p className="font-bold text-black">10.0 CHZ</p>
                            </div>
                            {bet.processed && bet.won && (
                              <div>
                                <p className="text-sm text-black/80">Payout</p>
                                <p className="font-bold text-black">0.0 CHZ</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="positions" className="mt-6">
              <Card className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Staked Positions</CardTitle>
                  <CardDescription className="text-white/80">Your locked funds from losing bets (14-day cooldown)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#FA014D' }} />
                      <p className="text-white/80">Loading positions...</p>
                    </div>
                  ) : userPositions.length === 0 ? (
                    <div className="text-center py-8">
                      <Lock className="w-16 h-16 mx-auto mb-4 text-white/50" />
                      <p className="text-white/80">No staked positions</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPositions.map((position, index) => {
                        const unlocked = isPositionUnlocked(position.unlockTimestamp)
                        const canClaim = unlocked && !position.claimed && !position.restaked
                        
                        return (
                          <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-2">
                                <Badge variant={canClaim ? "default" : position.claimed ? "secondary" : "destructive"}>
                                  {position.claimed ? "Claimed" : position.restaked ? "Restaked" : canClaim ? "Ready" : "Locked"}
                                </Badge>
                                {unlocked ? <Unlock className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-orange-400" />}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-white/80">Amount</p>
                                <p className="font-bold text-white">{ethers.formatEther(position.amount)} CHZ</p>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm text-white/80 mb-1">
                                {unlocked ? "Unlocked" : "Unlock Time"}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-white/60" />
                                <p className="text-sm text-white">
                                  {unlocked ? formatTimestamp(position.unlockTimestamp) : getTimeRemaining(position.unlockTimestamp)}
                                </p>
                              </div>
                            </div>

                            {canClaim && (
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleClaimPosition(index)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                                >
                                  <Coins className="w-4 h-4 mr-2" />
                                  Claim (20%)
                                </Button>
                                <Button 
                                  onClick={() => handleRestakePosition(index)}
                                  size="sm"
                                  className="flex-1"
                                  style={{ backgroundColor: '#FA014D' }}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Restake (+5% Bonus)
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contests" className="mt-6">
              <Card className="bg-pink-50/10 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="bg-white/5 backdrop-blur-sm border-b border-white/10">
                  <CardTitle className="text-white">Freebet Contests</CardTitle>
                  <CardDescription className="text-white/80">Use your freebets to enter exciting contests and win prizes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">Your Freebets</p>
                          <p className="text-white/70">Available to spend on contests</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{parseFloat(freebets).toFixed(4)} CHZ</p>
                        <p className="text-white/60 text-sm">Ready to use</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {contests.map((contest) => (
                      <div key={contest.id} className="bg-white/8 backdrop-blur-md rounded-xl p-6 border border-white/15 hover:border-white/25 hover:bg-white/12 transition-all duration-300 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-bold text-white text-lg">{contest.name}</h3>
                              <Badge 
                                variant="outline" 
                                className="text-white/80 border-white/30 bg-white/10 backdrop-blur-sm"
                              >
                                {contest.type}
                              </Badge>
                            </div>
                            <p className="text-white/90 mb-4">{contest.description}</p>
                            <div className="bg-white/8 backdrop-blur-sm rounded-md p-2 border border-white/15">
                              <div className="flex items-center justify-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2 text-white/90">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">{contest.duration}</span>
                                </div>
                                <div className="w-px h-4 bg-white/30"></div>
                                <div className="flex items-center space-x-2 text-white/90">
                                  <Target className="w-4 h-4" />
                                  <span className="font-medium">{contest.participants} participants</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                            <p className="text-white/70 text-sm">Prize</p>
                            <p className="font-bold text-white">{contest.prize}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/70 text-sm mb-1">Entry Cost</p>
                            <div className="flex items-center space-x-3">
                              <p className="font-bold text-white text-lg">{contest.cost} CHZ</p>
                              <Button 
                                onClick={() => handleEnterContest(contest)}
                                size="sm"
                                disabled={parseFloat(freebets) < contest.cost}
                                className={`backdrop-blur-sm border transition-all duration-300 ${
                                  parseFloat(freebets) >= contest.cost 
                                    ? 'bg-white/20 hover:bg-white/30 border-white/30 hover:border-white/50 text-white' 
                                    : 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                                }`}
                              >
                                Enter Contest
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Call to Action */}
                  <div className="mt-6 p-6 bg-black/20 backdrop-blur-md rounded-lg border border-white/30 text-center shadow-lg">
                    <div className="bg-white/10 backdrop-blur-sm rounded-md p-3 mb-3">
                      <p className="text-white font-medium text-base">Need more freebets?</p>
                      <p className="text-white/90 text-sm">Place losing bets to earn 30% back as freebets</p>
                    </div>
                    <Link href="/betting">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-white/15 backdrop-blur-sm border-white/40 text-white font-semibold hover:bg-white/25 hover:border-white/60 shadow-md"
                      >
                        Place More Bets
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
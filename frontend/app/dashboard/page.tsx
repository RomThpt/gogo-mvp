"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Coins, Gift, TrendingUp, Timer, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("bets")

  const activeBets = [
    {
      id: 1,
      match: "Barcelona vs Real Madrid",
      team: "Barcelona",
      amount: 50,
      odds: 2.1,
      status: "pending",
      time: "2h 30m left",
    },
    {
      id: 2,
      match: "PSG vs Manchester City",
      team: "PSG",
      amount: 25,
      odds: 1.9,
      status: "live",
      time: "Live now",
    },
  ]

  const resolvedBets = [
    {
      id: 3,
      match: "Juventus vs AC Milan",
      team: "Juventus",
      amount: 30,
      odds: 2.5,
      status: "won",
      payout: 75,
      date: "Yesterday",
    },
    {
      id: 4,
      match: "Chelsea vs Arsenal",
      team: "Chelsea",
      amount: 40,
      odds: 1.8,
      status: "lost",
      staked: 40,
      date: "2 days ago",
    },
  ]

  const stakingData = {
    totalStaked: 120,
    claimable: 8.5,
    cooldownEnd: "5d 12h 30m",
  }

  const nftFreebets = [
    {
      id: 1,
      name: "Golden Ticket",
      value: 10,
      sponsor: "Barcelona FC",
      rarity: "Rare",
    },
    {
      id: 2,
      name: "Diamond Bet",
      value: 25,
      sponsor: "PSG",
      rarity: "Epic",
    },
  ]

  return (
    <div className="min-h-screen text-black relative" style={{
      background: 'radial-gradient(ellipse 250% 180% at 50% 100%, white 0%, white 15%, #FA014D 45%, #FA014D 100%)'
    }}>
      <div className="container mx-auto px-4 py-8 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <Link href="/" className="inline-flex items-center hover:opacity-80" style={{ color: '#FA014D' }}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>

            {/* Profile Button */}
            <Link href="/profile">
              <Button 
                variant="outline" 
                className="bg-white/80 border-gray-300 text-black hover:bg-white"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-black">
            My Dashboard
          </h1>
          <p className="text-xl text-black/70">Track your bets and rewards</p>
        </motion.div>

        {/* Stats Overview avec design géométrique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Staked */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-pink-600/30 transform rotate-1"></div>
            <div className="relative bg-black/60 p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-mono uppercase tracking-wider">Total Staked CHZ</p>
                  <p className="text-3xl font-black text-white">{stakingData.totalStaked}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 transform rotate-45 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white transform -rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {/* Claimable Rewards */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 to-emerald-600/30 transform -rotate-1"></div>
            <div className="relative bg-black/60 p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-mono uppercase tracking-wider">Claimable Rewards</p>
                  <p className="text-3xl font-black text-green-300">{stakingData.claimable}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 transform rotate-45 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white transform -rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {/* Cooldown */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 to-red-600/30 transform rotate-1"></div>
            <div className="relative bg-black/60 p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-mono uppercase tracking-wider">Cooldown Ends</p>
                  <p className="text-lg font-black text-orange-300">{stakingData.cooldownEnd}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 transform rotate-45 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white transform -rotate-45" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs avec design custom */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Custom Tab List */}
            <div className="flex space-x-2 mb-8">
              {[
                { value: "bets", label: "MY BETS" },
                { value: "staking", label: "STAKING" },
                { value: "nfts", label: "FREEBETS NFTs" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`relative px-6 py-3 font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.value ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                  style={{
                    clipPath: activeTab === tab.value ? "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" : "none",
                  }}
                >
                  {activeTab === tab.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 -z-10"></div>
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            <TabsContent value="bets" className="mt-8">
              <div className="space-y-8">
                {/* Active Bets */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">Active Bets</h3>
                  <div className="space-y-4">
                    {activeBets.map((bet) => (
                      <motion.div key={bet.id} whileHover={{ scale: 1.02 }} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 transform skew-y-1"></div>
                        <div className="relative bg-black/60 p-6 border-l-4 border-red-500">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-lg">{bet.match}</h4>
                              <p className="text-red-400 font-mono">BETTING ON: {bet.team}</p>
                            </div>
                            <div
                              className={`px-4 py-2 font-bold text-sm transform rotate-1 ${
                                bet.status === "live" ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
                              }`}
                              style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
                            >
                              {bet.status === "live" ? "LIVE" : "PENDING"}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 font-mono uppercase">Amount</p>
                              <p className="font-bold text-lg">{bet.amount} tokens</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-mono uppercase">Odds</p>
                              <p className="font-bold text-lg">{bet.odds}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-mono uppercase">Time</p>
                              <p className="font-bold text-lg">{bet.time}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent Results */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">Recent Results</h3>
                  <div className="space-y-4">
                    {resolvedBets.map((bet) => (
                      <motion.div key={bet.id} whileHover={{ scale: 1.02 }} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-800/20 transform -skew-y-1"></div>
                        <div className="relative bg-black/60 p-6 border-l-4 border-gray-500">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-lg">{bet.match}</h4>
                              <p className="text-gray-400 font-mono">BET ON: {bet.team}</p>
                            </div>
                            <div
                              className={`px-4 py-2 font-bold text-sm transform -rotate-1 ${
                                bet.status === "won" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                              }`}
                              style={{ clipPath: "polygon(0% 0, 90% 0, 100% 100%, 10% 100%)" }}
                            >
                              {bet.status.toUpperCase()}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 font-mono uppercase">Amount</p>
                              <p className="font-bold text-lg">{bet.amount} tokens</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-mono uppercase">
                                {bet.status === "won" ? "Payout" : "Auto-Staked"}
                              </p>
                              <p
                                className={`font-bold text-lg ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}
                              >
                                {bet.status === "won" ? `${bet.payout} tokens` : `${bet.staked} CHZ`}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-mono uppercase">Date</p>
                              <p className="font-bold text-lg">{bet.date}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staking" className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-pink-600/20 transform rotate-1"></div>
                <div className="relative bg-black/60 p-8 border-2 border-red-500/50">
                  <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">CHZ Staking Overview</h3>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-gray-700">
                      <span className="text-gray-300 font-mono uppercase">Total Staked</span>
                      <span className="text-2xl font-black text-red-400">{stakingData.totalStaked} CHZ</span>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-700">
                      <span className="text-gray-300 font-mono uppercase">Claimable Rewards</span>
                      <span className="text-2xl font-black text-green-400">{stakingData.claimable} CHZ</span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 font-mono uppercase">Cooldown Progress</span>
                        <span className="text-sm text-gray-400 font-mono">{stakingData.cooldownEnd} remaining</span>
                      </div>
                      <div className="relative h-4 bg-gray-800 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 transform origin-left"
                          style={{ width: "65%", clipPath: "polygon(0 0, 95% 0, 100% 100%, 5% 100%)" }}
                        ></div>
                      </div>
                    </div>

                    <div className="relative mt-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transform skew-x-2"></div>
                      <Button className="relative w-full bg-black/80 text-white hover:bg-black/60 h-14 text-lg font-bold border-2 border-green-500/50">
                        CLAIM REWARDS
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nfts" className="mt-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wider">Freebet NFTs Collection</h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nftFreebets.map((nft) => (
                    <motion.div key={nft.id} whileHover={{ scale: 1.05, rotateY: 5 }} className="relative">
                      {/* NFT Card avec design hexagonal */}
                      <div
                        className="relative bg-black/80 border-2 border-red-500/50 overflow-hidden"
                        style={{
                          clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                        }}
                      >
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 to-pink-900/50"></div>

                        <div className="relative p-6">
                          {/* NFT Icon */}
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 transform rotate-45 flex items-center justify-center">
                            <Gift className="w-10 h-10 text-white transform -rotate-45" />
                          </div>

                          <div className="space-y-3 text-center">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-lg">{nft.name}</h4>
                              <span
                                className={`px-2 py-1 text-xs font-bold transform rotate-12 ${
                                  nft.rarity === "Epic" ? "bg-red-500 text-white" : "bg-pink-500 text-white"
                                }`}
                              >
                                {nft.rarity}
                              </span>
                            </div>

                            <p className="text-gray-400 text-sm font-mono">SPONSORED BY {nft.sponsor}</p>

                            <div className="flex justify-between items-center pt-4">
                              <span className="text-2xl font-black text-red-400">{nft.value} tokens</span>
                              <Button
                                size="sm"
                                className="bg-white text-black hover:bg-gray-100 font-bold transform -skew-x-12"
                              >
                                USE FREEBET
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface WalletConnectProps {
  isConnected: boolean
  userAddress: string
  onConnect: (connected: boolean) => void
  onAddressChange: (address: string) => void
}

export default function WalletConnect({ 
  isConnected, 
  userAddress, 
  onConnect, 
  onAddressChange 
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        })
        
        if (accounts.length > 0) {
          onAddressChange(accounts[0])
          onConnect(true)
        }
      } else {
        // Mock connection for demo
        const mockAddress = '0x1234...5678'
        onAddressChange(mockAddress)
        onConnect(true)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
    setIsConnecting(false)
  }

  const disconnectWallet = () => {
    onConnect(false)
    onAddressChange('')
  }

  if (isConnected) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="font-semibold">Wallet Connected</span>
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold">2,456 CHZ</div>
              <div className="text-gray-400 text-sm">$489.20</div>
            </div>
            <button 
              onClick={disconnectWallet}
              className="btn-secondary text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-chiliz-red">150 PSG</div>
            <div className="text-gray-400 text-xs">Fan Token</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">89 BAR</div>
            <div className="text-gray-400 text-xs">Fan Token</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">$45.20</div>
            <div className="text-gray-400 text-xs">Recoverable</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">12.5</div>
            <div className="text-gray-400 text-xs">FreeBets</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card text-center">
      <div className="mb-4">
        <div className="text-4xl mb-2">🔗</div>
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">
          Connect your Chiliz wallet to start betting with fan tokens
        </p>
      </div>
      
      <button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn-primary"
      >
        {isConnecting ? 'Connecting...' : 'Connect Chiliz Wallet'}
      </button>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wallet, CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [chainId, setChainId] = useState("")

  // Vérifier si MetaMask est installé
  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  // Vérifier la connexion au chargement
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (!isMetaMaskInstalled()) return

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)

        // Récupérer le chainId
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(chainId)
      }
    } catch (error) {
      console.error("Error checking connection:", error)
    }
  }

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      // Demander la connexion
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)

        // Récupérer le chainId
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(chainId)

        // Optionnel: Demander de changer vers Chiliz Chain
        // const chilizChainId = "0x15b38" // 88888 en hexadécimal pour Chiliz Chain
        // if (chainId !== chilizChainId) {
        //   await switchToChilizChain()
        // }
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      if (error.code === 4001) {
        setError("Connection rejected by user")
      } else {
        setError("Failed to connect wallet")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToChilizChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x15b38" }], // Chiliz Chain ID
      })
    } catch (switchError: any) {
      // Si la chaîne n'est pas ajoutée, l'ajouter
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x15b38",
                chainName: "Chiliz Chain",
                nativeCurrency: {
                  name: "CHZ",
                  symbol: "CHZ",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.ankr.com/chiliz"],
                blockExplorerUrls: ["https://scan.chiliz.com/"],
              },
            ],
          })
        } catch (addError) {
          console.error("Failed to add Chiliz Chain:", addError)
        }
      }
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
    setChainId("")
    setError("")
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (chainId: string) => {
    switch (chainId) {
      case "0x1":
        return "Ethereum"
      case "0x15b38":
        return "Chiliz Chain"
      case "0x89":
        return "Polygon"
      default:
        return "Unknown"
    }
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-4 bg-red-500/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-red-500/30"
      >
        <AlertCircle className="w-6 h-6 text-red-400" />
        <div className="flex-1">
          <p className="text-sm text-red-400 font-semibold">Connection Error</p>
          <p className="text-xs text-red-300">{error}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setError("")} className="text-red-400 hover:text-red-300 p-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    )
  }

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30"
      >
        <CheckCircle className="w-6 h-6 text-green-400" />
        <div>
          <p className="text-sm text-white font-semibold">Wallet Connected</p>
          <p className="text-xs text-white/80">
            {formatAddress(walletAddress)} • {getChainName(chainId)}
          </p>
        </div>
        <div className="flex space-x-2">
          {chainId !== "0x15b38" && (
            <div className="relative">
              <div className="absolute inset-0 transform skew-x-2 rounded-lg" style={{ backgroundColor: '#FA014D' }}></div>
              <Button
                variant="outline"
                size="sm"
                onClick={switchToChilizChain}
                className="relative border-white/50 text-white hover:opacity-90 rounded-xl bg-transparent text-xs transition-all duration-300"
                style={{ borderColor: '#FA014D' }}
              >
                Switch to Chiliz
              </Button>
            </div>
          )}
          <div className="relative">
            <div className="absolute inset-0 transform skew-x-2 rounded-lg" style={{ backgroundColor: '#FA014D' }}></div>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="relative border-white/50 text-white hover:opacity-90 rounded-xl bg-transparent transition-all duration-300"
              style={{ borderColor: '#FA014D' }}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <div className="relative">
        <div className="absolute inset-0 transform skew-x-2 rounded-lg" style={{ backgroundColor: '#FA014D' }}></div>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="relative bg-white/20 hover:opacity-90 text-white font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg backdrop-blur-sm border border-white/30 disabled:opacity-50 transition-all duration-300"
          style={{ borderColor: '#FA014D' }}
        >
          {isConnecting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-6 h-6 mr-3"
            >
              <AlertCircle className="w-6 h-6" />
            </motion.div>
          ) : (
            <Wallet className="w-6 h-6 mr-3" />
          )}
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>
      </div>
    </motion.div>
  )
}

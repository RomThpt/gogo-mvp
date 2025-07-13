import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { CHILIZ_TESTNET_CONFIG, getContract, getPSGTokenContract, getBarcaTokenContract, PSG_TOKEN_ADDRESS, BARCA_TOKEN_ADDRESS } from '@/lib/contracts'

declare global {
  interface Window {
    ethereum?: any
  }
}

export interface Web3State {
  isConnected: boolean
  account: string | null
  balance: string
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
}

export interface BetData {
  amount: string
  isFanToken: boolean
  teamSelection: 'home' | 'away'
  currency: string
  tokenAddress?: string
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    account: null,
    balance: '0',
    chainId: null,
    provider: null,
    signer: null,
  })

  const updateState = useCallback(async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork()
      const accounts = await provider.listAccounts()
      const signer = await provider.getSigner()
      
      if (accounts.length > 0) {
        const balance = await provider.getBalance(accounts[0])
        setState({
          isConnected: true,
          account: accounts[0].address,
          balance: ethers.formatEther(balance),
          chainId: Number(network.chainId),
          provider,
          signer,
        })
      }
    } catch (error) {
      console.error('Error updating Web3 state:', error)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      await updateState(provider)

      // Check if we're on the correct network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== CHILIZ_TESTNET_CONFIG.chainId) {
        await switchToChilizTestnet()
      }

      return true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }, [updateState])



  const switchToChilizTestnet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHILIZ_TESTNET_CONFIG.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CHILIZ_TESTNET_CONFIG.chainId.toString(16)}`,
                chainName: CHILIZ_TESTNET_CONFIG.name,
                nativeCurrency: CHILIZ_TESTNET_CONFIG.nativeCurrency,
                rpcUrls: CHILIZ_TESTNET_CONFIG.rpcUrls,
                blockExplorerUrls: CHILIZ_TESTNET_CONFIG.blockExplorerUrls,
              },
            ],
          })
        } catch (addError) {
          throw new Error('Failed to add Chiliz Testnet to MetaMask')
        }
      } else {
        throw new Error('Failed to switch to Chiliz Testnet')
      }
    }
  }, [])

  const placeBet = useCallback(async (betData: BetData) => {
    if (!state.signer || !state.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const contract = getContract(state.signer)
      const amountInWei = ethers.parseEther(betData.amount)
      
      if (betData.isFanToken && betData.tokenAddress) {
        // For fan token bets, approve the contract to spend tokens
        const tokenContract = new ethers.Contract(betData.tokenAddress, [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function balanceOf(address account) external view returns (uint256)'
        ], state.signer)
        
        // Check balance first
        const balance = await tokenContract.balanceOf(state.account)
        if (balance < amountInWei) {
          throw new Error(`Insufficient ${betData.currency} balance`)
        }
        
        // Approve contract to spend tokens
        const approveTx = await tokenContract.approve(contract.target, amountInWei)
        await approveTx.wait()
        
        // Place bet with fan tokens
        const tx = await contract['placeBet(address,uint256,bool,address)'](
          state.account,
          amountInWei,
          betData.isFanToken,
          betData.tokenAddress
        )
        
        return {
          hash: tx.hash,
          wait: () => tx.wait(),
        }
      } else {
        // CHZ bet
        const tx = await contract['placeBet(address,uint256,bool)'](
          state.account,
          amountInWei,
          betData.isFanToken,
          { value: amountInWei }
        )

        return {
          hash: tx.hash,
          wait: () => tx.wait(),
        }
      }
    } catch (error) {
      console.error('Error placing bet:', error)
      throw error
    }
  }, [state.signer, state.account])

  const getUserBets = useCallback(async () => {
    if (!state.account) {
      return []
    }

    try {
      const contract = getContract(state.provider || undefined)
      const bets = await contract.getUserBets(state.account)
      return bets
    } catch (error) {
      console.error('Error fetching user bets:', error)
      return []
    }
  }, [state.account, state.provider])

  const getUserFreebets = useCallback(async () => {
    if (!state.account) {
      return '0'
    }

    try {
      const contract = getContract(state.provider || undefined)
      const freebets = await contract.getUserFreebets(state.account)
      return ethers.formatEther(freebets)
    } catch (error) {
      console.error('Error fetching user freebets:', error)
      return '0'
    }
  }, [state.account, state.provider])

  const getUserPositions = useCallback(async () => {
    if (!state.account) {
      return []
    }

    try {
      const contract = getContract(state.provider || undefined)
      const positions = await contract.getUserPositions(state.account)
      return positions
    } catch (error) {
      console.error('Error fetching user positions:', error)
      return []
    }
  }, [state.account, state.provider])

  const claimPosition = useCallback(async (positionId: number) => {
    if (!state.signer) {
      throw new Error('Wallet not connected')
    }

    try {
      const contract = getContract(state.signer)
      const tx = await contract.claimUserShare(positionId)
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      }
    } catch (error) {
      console.error('Error claiming position:', error)
      throw error
    }
  }, [state.signer])

  const restakePosition = useCallback(async (positionId: number) => {
    if (!state.signer) {
      throw new Error('Wallet not connected')
    }

    try {
      const contract = getContract(state.signer)
      const tx = await contract.restakePosition(positionId)
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      }
    } catch (error) {
      console.error('Error restaking position:', error)
      throw error
    }
  }, [state.signer])

  const useFreebets = useCallback(async (amount: string) => {
    if (!state.signer || !state.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const contract = getContract(state.signer)
      const amountInWei = ethers.parseEther(amount)
      const tx = await contract.useFreebets(state.account, amountInWei)
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      }
    } catch (error) {
      console.error('Error using freebets:', error)
      throw error
    }
  }, [state.signer, state.account])

  const getTokenBalance = useCallback(async (tokenAddress: string) => {
    if (!state.account) {
      return '0'
    }

    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function balanceOf(address account) external view returns (uint256)',
        'function decimals() external view returns (uint8)'
      ], state.provider || new ethers.JsonRpcProvider(CHILIZ_TESTNET_CONFIG.rpcUrls[0]))
      
      const balance = await tokenContract.balanceOf(state.account)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Error fetching token balance:', error)
      return '0'
    }
  }, [state.account, state.provider])

  const buyTokens = useCallback(async (tokenAddress: string, ethAmount: string) => {
    if (!state.signer) {
      throw new Error('Wallet not connected')
    }

    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function buyTokens() external payable'
      ], state.signer)
      
      const tx = await tokenContract.buyTokens({
        value: ethers.parseEther(ethAmount)
      })

      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      }
    } catch (error) {
      console.error('Error buying tokens:', error)
      throw error
    }
  }, [state.signer])

  const sellTokens = useCallback(async (tokenAddress: string, tokenAmount: string) => {
    if (!state.signer) {
      throw new Error('Wallet not connected')
    }

    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function sellTokens(uint256 tokenAmount) external'
      ], state.signer)
      
      const tx = await tokenContract.sellTokens(ethers.parseEther(tokenAmount))

      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      }
    } catch (error) {
      console.error('Error selling tokens:', error)
      throw error
    }
  }, [state.signer])

  // Initialize connection if already connected
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          await updateState(provider)
        }
      }
    }
    init()
  }, [updateState])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setState({
            isConnected: false,
            account: null,
            balance: '0',
            chainId: null,
            provider: null,
            signer: null,
          })
        } else {
          const provider = new ethers.BrowserProvider(window.ethereum)
          updateState(provider)
        }
      }

      const handleChainChanged = (chainId: string) => {
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [updateState])

  return {
    ...state,
    connectWallet,
    switchToChilizTestnet,
    placeBet,
    getUserBets,
    getUserFreebets,
    getUserPositions,
    claimPosition,
    restakePosition,
    useFreebets,
    getTokenBalance,
    buyTokens,
    sellTokens,
  }
}
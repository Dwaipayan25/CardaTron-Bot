import React, { useState, useEffect } from 'react'
import { 
  useAccount, 
  useBalance, 
  useChainId, 
  useSwitchChain, 
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useConnect
} from 'wagmi'
import { parseUnits, formatUnits, isAddress } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { NETWORKS, ERC20_ABI, ESCROW_FACTORY_ABI, RESOLVER_ADDRESS } from '@/config/contracts'
import { useTronLink } from '@/hooks/useTronLink'
import { convertAddressForNetwork, isValidTronAddress, isValidEthAddress } from '@/utils/addressConversion'
import { 
  ArrowRightLeft, 
  Wallet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Zap,
  Settings,
  Clock,
  DollarSign,
  ChevronDown
} from 'lucide-react'

type NetworkKey = 'sepolia' | 'tron'

const NETWORK_LOGOS = {
  sepolia: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22%2325292E%22%20fill-rule%3D%22evenodd%22%20d%3D%22M14%2028a14%2014%200%201%200%200-28%2014%2014%200%200%200%200%2028Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23a)%22%20fill-opacity%3D%22.3%22%20fill-rule%3D%22evenodd%22%20d%3D%22M14%2028a14%2014%200%201%200%200-28%2014%2014%200%200%200%200%2028Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23b)%22%20d%3D%22M8.19%2014.77%2014%2018.21l5.8-3.44-5.8%208.19-5.81-8.19Z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m14%2016.93-5.81-3.44L14%204.34l5.81%209.15L14%2016.93Z%22%2F%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%220%22%20x2%3D%2214%22%20y1%3D%220%22%20y2%3D%2228%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22b%22%20x1%3D%2214%22%20x2%3D%2214%22%20y1%3D%2214.77%22%20y2%3D%2222.96%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff%22%20stop-opacity%3D%22.9%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E%0A",
  // Commented out unused networks
  // celo: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22none%22%3E%3Ccircle%20cx%3D%2214%22%20cy%3D%2214%22%20r%3D%2214%22%20fill%3D%22%23FCFF52%22%2F%3E%3Cpath%20d%3D%22M21%207H7v14h14v-4.887h-2.325a5.126%205.126%200%200%201-4.664%203.023c-2.844%200-5.147-2.325-5.147-5.147-.003-2.822%202.303-5.125%205.147-5.125%202.102%200%203.904%201.28%204.704%203.104H21V7Z%22%20fill%3D%22%23000%22%2F%3E%3C%2Fsvg%3E",
  // monad: "https://img.notionusercontent.com/s3/prod-files-secure%2F8b536fe4-3bbf-45fc-b661-190b80c94bea%2F23726c6b-16c2-430e-92d7-c144a7a6719b%2FMonad_Logo_-_Default_-_Logo_Mark.svg/size/?exp=1754236333&sig=PrJz3P774ATUTnQ2P9zIIytQ5txVKJL7xjFN8WqGidY&id=16863675-94f2-80f6-9f47-f3ec0de0ddcf&table=block",
  // etherlink: "https://ethglobal.b-cdn.net/organizations/ky7kr/square-logo/default.png",
  tron: "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png"
}

interface SwapData {
  fromNetwork: NetworkKey
  toNetwork: NetworkKey
  amount: string
  destinationAddress: string
}

interface TransactionState {
  hash?: `0x${string}`
  isLoading: boolean
  isSuccess: boolean
  error?: string
}

interface BridgeState {
  isLoading: boolean
  isSuccess: boolean
  error?: string
  showOverlay: boolean
}

export function ModernBridge() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: writeContractData, isPending: isWritePending, error: writeError } = useWriteContract()
  const { connect, connectors } = useConnect()
  
  // TronLink integration
  const { 
    isConnected: isTronConnected, 
    account: tronAccount, 
    balance: tronBalance, 
    connect: connectTron, 
    disconnect: disconnectTron,
    sendUSDC: sendTronUSDC,
    error: tronError,
    isLoading: tronLoading,
    isTronLinkAvailable
  } = useTronLink()

  // State Management
  const [swapData, setSwapData] = useState<SwapData>({
    fromNetwork: 'sepolia',
    toNetwork: 'tron',
    amount: '',
    destinationAddress: ''
  })
  
  const [txState, setTxState] = useState<TransactionState>({
    isLoading: false,
    isSuccess: false
  })
  
  const [bridgeState, setBridgeState] = useState<BridgeState>({
    isLoading: false,
    isSuccess: false,
    showOverlay: false
  })

  // Get token balances for all networks
  const { data: sepoliaBalance, refetch: refetchSepoliaBalance } = useBalance({
    address,
    token: NETWORKS.sepolia.usdc as `0x${string}`,
    chainId: NETWORKS.sepolia.chainId,
  })

  const { data: sepoliaNative } = useBalance({
    address,
    chainId: NETWORKS.sepolia.chainId,
  })

  // Get allowances
  const { data: sepoliaAllowance, refetch: refetchSepoliaAllowance } = useReadContract({
    address: NETWORKS.sepolia.usdc as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, NETWORKS.sepolia.resolver as `0x${string}`] : undefined,
    chainId: NETWORKS.sepolia.chainId,
  })

  // Transaction receipt tracking
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txState.hash,
  })

  useEffect(() => {
    if (isTxSuccess) {
      setTxState(prev => ({ ...prev, isSuccess: true, isLoading: false }))
      // Refresh balances and allowances
      refetchSepoliaBalance()
      refetchSepoliaAllowance()
    }
  }, [isTxSuccess, refetchSepoliaBalance, refetchSepoliaAllowance])

  // Handle writeContract data (transaction hash)
  useEffect(() => {
    if (writeContractData) {
      setTxState(prev => ({ 
        ...prev, 
        hash: writeContractData,
        isLoading: true,
        isSuccess: false 
      }))
    }
  }, [writeContractData])

  // Handle writeContract errors
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError)
      setTxState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isSuccess: false, 
        error: writeError.message || 'Transaction failed' 
      }))
    }
  }, [writeError])

  const getCurrentNetwork = (): NetworkKey | null => {
    const network = Object.entries(NETWORKS).find(([_, config]) => config.chainId === chainId)
    return network ? network[0] as NetworkKey : null
  }

  const currentNetwork = getCurrentNetwork()
  const isNetworkSupported = currentNetwork !== null

  const getBalance = (network: NetworkKey) => {
    switch (network) {
      case 'sepolia': return sepoliaBalance
      case 'tron': 
        if (!tronBalance) {
          return { value: BigInt(0), formatted: '0', decimals: 6, symbol: 'USDC' }
        }
        
        // Use the same logic as the minting script for consistent balance calculation
        console.log(`🔍 ModernBridge - Tron Balance Calculation:`);
        console.log(`  Raw tokenBalance from hook: ${tronBalance.tokenBalance}`);
        
        // Convert the already-formatted balance to BigInt for compatibility with wagmi format
        // tronBalance.tokenBalance is already properly calculated in the hook using the minting script logic
        const balanceInWei = BigInt(Math.floor(tronBalance.tokenBalance * 1e6));
        const formattedBalance = tronBalance.tokenBalance.toFixed(4);
        
        console.log(`  Converted to BigInt (wei-like): ${balanceInWei}`);
        console.log(`  Formatted for display: ${formattedBalance}`);
        
        return {
          value: balanceInWei,
          formatted: formattedBalance,
          decimals: 6,
          symbol: 'USDC'
        }
      default: return null
    }
  }

  const getNativeBalance = (network: NetworkKey) => {
    switch (network) {
      case 'sepolia': return sepoliaNative
      case 'tron': 
        if (!tronBalance) {
          return { value: BigInt(0), formatted: '0', decimals: 6, symbol: 'TRX' }
        }
        
        // Use consistent logic for TRX balance calculation
        console.log(`🔍 ModernBridge - Tron TRX Balance Calculation:`);
        console.log(`  Raw TRX balance from hook: ${tronBalance.balance}`);
        
        // TRX has 6 decimals, convert to BigInt (Sun units)
        const trxBalanceInSun = BigInt(Math.floor(tronBalance.balance * 1e6));
        const formattedTrxBalance = tronBalance.balance.toFixed(4);
        
        console.log(`  Converted to BigInt (Sun units): ${trxBalanceInSun}`);
        console.log(`  Formatted for display: ${formattedTrxBalance}`);
        
        return {
          value: trxBalanceInSun,
          formatted: formattedTrxBalance,
          decimals: 6,
          symbol: 'TRX'
        }
      default: return null
    }
  }

  const getAllowance = (network: NetworkKey) => {
    switch (network) {
      case 'sepolia': return sepoliaAllowance
      case 'tron': return BigInt(0) // Placeholder for Tron - no approval needed for direct transfers
      default: return null
    }
  }

  const formatBalance = (balance: any) => {
    if (!balance) {
      console.log(`🔍 formatBalance - No balance provided, returning '0.00'`);
      return '0.00'
    }
    
    console.log(`🔍 formatBalance - Input:`, {
      value: balance.value?.toString(),
      decimals: balance.decimals,
      symbol: balance.symbol,
      formatted: balance.formatted
    });
    
    const result = parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4);
    console.log(`🔍 formatBalance - Result: ${result}`);
    
    return result;
  }

  const needsApproval = () => {
    // Tron doesn't use approval mechanism - skip approval for Tron source
    if (swapData.fromNetwork === 'tron') return false
    
    // For EVM chains, check approval
    if (!swapData.amount || !address) return false
    const allowance = getAllowance(swapData.fromNetwork)
    const amountWei = parseUnits(swapData.amount, 6)
    return !allowance || (allowance as bigint) < amountWei
  }

  const isValidAmount = () => {
    if (!swapData.amount || parseFloat(swapData.amount) <= 0) return false
    const balance = getBalance(swapData.fromNetwork)
    if (!balance) return false
    const amountWei = parseUnits(swapData.amount, 6)
    return balance.value >= amountWei
  }

  const isValidDestination = () => {
    // If bridging TO Tron, destination address is required and must be Tron format
    if (swapData.toNetwork === 'tron') {
      if (!swapData.destinationAddress) return false
      return isValidTronAddress(swapData.destinationAddress)
    }
    
    // If bridging FROM Tron, destination address is required and must be EVM format
    if (swapData.fromNetwork === 'tron') {
      if (!swapData.destinationAddress) return false
      return isAddress(swapData.destinationAddress) || isValidEthAddress(swapData.destinationAddress)
    }
    
    // For other networks, address is optional
    if (!swapData.destinationAddress) return true
    return isAddress(swapData.destinationAddress) || isValidEthAddress(swapData.destinationAddress)
  }

  const handleSwapNetworks = () => {
    setSwapData(prev => ({
      ...prev,
      fromNetwork: prev.toNetwork,
      toNetwork: prev.fromNetwork,
    }))
  }

  const handleMaxAmount = () => {
    const balance = getBalance(swapData.fromNetwork)
    if (balance) {
      const formatted = formatUnits(balance.value, balance.decimals)
      setSwapData(prev => ({ ...prev, amount: formatted }))
    }
  }

  const handleApprove = async () => {
    if (!address || !isNetworkSupported) return

    // Switch to source network if needed
    const sourceChainId = NETWORKS[swapData.fromNetwork].chainId
    if (chainId !== sourceChainId) {
      await switchChain({ chainId: sourceChainId })
      return
    }

    // Clear any previous error
    setTxState({ isLoading: false, isSuccess: false, error: undefined })
    
    writeContract({
      address: NETWORKS[swapData.fromNetwork].usdc as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [
        NETWORKS[swapData.fromNetwork].resolver as `0x${string}`,
        parseUnits(swapData.amount, 6)
      ],
    })
  }

  const handleBridge = async () => {
    try {
      // Set bridge loading state and show overlay
      setBridgeState({ 
        isLoading: true, 
        isSuccess: false, 
        error: undefined, 
        showOverlay: true 
      })

      // Determine which wallet to use based on source network
      let userAddress: string
      let destinationAddress: string

      if (swapData.fromNetwork === 'tron') {
        // Source is Tron - use TronLink
        if (!isTronConnected || !tronAccount) {
          throw new Error('Please connect TronLink wallet first')
        }
        userAddress = tronAccount.address.base58
        
        // Convert destination address if needed
        if (swapData.destinationAddress) {
          if (swapData.toNetwork === 'tron') {
            destinationAddress = swapData.destinationAddress
          } else {
            // Converting from Tron to EVM - convert address if needed
            const convertResult = convertAddressForNetwork(swapData.destinationAddress, 'evm')
            if (!convertResult.isValid) {
              throw new Error(`Invalid destination address: ${convertResult.error}`)
            }
            destinationAddress = convertResult.address!
          }
        } else {
          // Use user address as destination
          if (swapData.toNetwork === 'tron') {
            destinationAddress = userAddress
          } else {
            // Need EVM address for destination
            if (!address) {
              throw new Error('Please connect MetaMask wallet for EVM destination')
            }
            destinationAddress = address
          }
        }
      } else {
        // Source is EVM - use MetaMask
        if (!isConnected || !address) {
          throw new Error('Please connect MetaMask wallet first')
        }
        
        // Switch to source network if needed
        const sourceChainId = NETWORKS[swapData.fromNetwork].chainId
        if (chainId !== sourceChainId) {
          await switchChain({ chainId: sourceChainId })
          return
        }
        
        userAddress = address
        
        // Convert destination address if needed
        if (swapData.destinationAddress) {
          if (swapData.toNetwork === 'tron') {
            // Converting from EVM to Tron - convert address if needed
            const convertResult = convertAddressForNetwork(swapData.destinationAddress, 'tron')
            if (!convertResult.isValid) {
              throw new Error(`Invalid destination address: ${convertResult.error}`)
            }
            destinationAddress = convertResult.address!
          } else {
            destinationAddress = swapData.destinationAddress
          }
        } else {
          // Use user address as destination
          if (swapData.toNetwork === 'tron') {
            // Need Tron address for destination
            if (!isTronConnected || !tronAccount) {
              throw new Error('Please connect TronLink wallet for Tron destination')
            }
            destinationAddress = tronAccount.address.base58
          } else {
            destinationAddress = userAddress
          }
        }
      }

      console.log('Creating cross-chain intent:', {
        fromNetwork: swapData.fromNetwork,
        toNetwork: swapData.toNetwork,
        amount: swapData.amount,
        userAddress,
        destinationAddress
      })
      
      // Call resolver API
      const response = await fetch('http://localhost:3001/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromNetwork: swapData.fromNetwork,
          toNetwork: swapData.toNetwork,
          fromToken: 'USDC',
          toToken: 'USDC',
          amount: swapData.amount,
          userAddress,
          destinationAddress
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Bridge successful:', result)
        setBridgeState({ 
          isLoading: false,
          isSuccess: true,
          error: undefined,
          showOverlay: true
        })
      } else {
        console.error('❌ Bridge failed:', result)
        setBridgeState({ 
          isLoading: false,
          isSuccess: false,
          error: `Bridge error: ${result.error}`,
          showOverlay: true
        })
      }
      
    } catch (error: unknown) {
      console.error('Bridge error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bridge failed'
      setBridgeState({ 
        isLoading: false, 
        isSuccess: false, 
        error: errorMessage,
        showOverlay: true
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const callResolverAPI = async (intentData: any) => {
    try {
      console.log('🔄 Calling resolver API with intent:', intentData)
      
      const response = await fetch('http://localhost:3001/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromNetwork: intentData.fromNetwork,
          toNetwork: intentData.toNetwork,
          fromToken: 'USDC',
          toToken: 'USDC',
          amount: intentData.amount,
          userAddress: intentData.userAddress,
          destinationAddress: intentData.destinationAddress
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Resolver API call successful:', result)
        setTxState(prev => ({ 
          ...prev, 
          isSuccess: true, 
          hash: result.orderHash,
          error: undefined 
        }))
      } else {
        console.error('❌ Resolver API call failed:', result)
        setTxState(prev => ({ 
          ...prev, 
          error: `Resolver error: ${result.error}` 
        }))
      }
    } catch (error: unknown) {
      console.error('❌ Failed to call resolver API:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTxState(prev => ({ 
        ...prev, 
        error: `Failed to notify resolver: ${errorMessage}` 
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold text-sm">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Swap</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white text-sm">
              <span>Orders</span>
            </button>
          </div>
        </div>

        {/* Wallet Connection Cards */}
        <div className="space-y-4 mb-6">
          {/* Ethereum Wallet */}
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div>
                  <div className="text-white font-medium">Ethereum Wallet</div>
                  <div className="text-gray-400 text-sm font-mono">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {address && (
                  <button
                    onClick={() => copyToClipboard(address)}
                    className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm hover:bg-slate-600"
                  >
                    Copy
                  </button>
                )}
                <button className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm hover:bg-slate-600">
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>

          {/* Tron Wallet */}
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isTronConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <div>
                  <div className="text-white font-medium">Tron Wallet</div>
                  <div className="text-gray-400 text-sm font-mono">
                    {tronAccount ? `${tronAccount.address.base58.slice(0, 6)}...${tronAccount.address.base58.slice(-4)}` : 'Not connected'}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {tronAccount && (
                  <button
                    onClick={() => copyToClipboard(tronAccount.address.base58)}
                    className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm hover:bg-slate-600"
                  >
                    Copy
                  </button>
                )}
                <button 
                  onClick={isTronConnected ? disconnectTron : connectTron}
                  disabled={tronLoading}
                  className="px-3 py-1 bg-slate-700 text-gray-300 rounded-lg text-sm hover:bg-slate-600"
                >
                  {tronLoading ? 'Connecting...' : (isTronConnected ? 'Disconnect' : 'Connect')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Interface */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          {/* From Section */}
          <div className="mb-4">
            <div className="text-gray-400 text-sm mb-3">You pay ({swapData.fromNetwork === 'sepolia' ? 'EVM' : 'TRON'})</div>
            <div className="bg-slate-900 bg-opacity-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">USDC</div>
                    <div className="text-gray-400 text-sm">
                      on {swapData.fromNetwork === 'sepolia' ? 'Ethereum' : 'Tron'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <input
                    type="number"
                    placeholder="0"
                    value={swapData.amount}
                    onChange={(e) => setSwapData(prev => ({ ...prev, amount: e.target.value }))}
                    className="bg-transparent text-white text-2xl font-semibold text-right outline-none w-32"
                  />
                  <div className="text-gray-400 text-sm">
                    ~${swapData.amount ? (parseFloat(swapData.amount) * 1).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={handleSwapNetworks}
              className="bg-slate-700 hover:bg-slate-600 rounded-full p-3 transition-colors"
            >
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* To Section */}
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-3">You receive ({swapData.toNetwork === 'sepolia' ? 'EVM' : 'TRON'})</div>
            <div className="bg-slate-900 bg-opacity-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">USDC</div>
                    <div className="text-gray-400 text-sm">
                      on {swapData.toNetwork === 'sepolia' ? 'Ethereum' : 'Tron'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-2xl font-semibold">
                    {swapData.amount ? (parseFloat(swapData.amount) * 0.999).toFixed(4) : '0'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    ~${swapData.amount ? (parseFloat(swapData.amount) * 0.999).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Display */}
          <div className="text-center text-gray-400 text-sm mb-6">
            1 USDC = {(1 * 0.999).toFixed(3)} USDC • Fee: 0.1%
          </div>

          {/* Destination Address Input */}
          {(swapData.toNetwork === 'tron' || swapData.fromNetwork === 'tron') && (
            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-3">
                Destination Address (Required) - {swapData.toNetwork === 'tron' ? 'Tron' : 'Sepolia'} Address
              </div>
              <input
                type="text"
                placeholder={
                  swapData.toNetwork === 'tron' 
                    ? "Enter Tron address (T...)" 
                    : "Enter Sepolia address (0x...)"
                }
                value={swapData.destinationAddress}
                onChange={(e) => setSwapData(prev => ({ ...prev, destinationAddress: e.target.value }))}
                className={`w-full bg-slate-900 bg-opacity-50 border rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-blue-500 ${
                  swapData.destinationAddress && !isValidDestination() 
                    ? 'border-red-500' 
                    : 'border-slate-600'
                }`}
              />
              {swapData.destinationAddress && !isValidDestination() && (
                <div className="text-red-400 text-sm mt-2">
                  Invalid {swapData.toNetwork === 'tron' ? 'Tron' : 'Ethereum'} address format
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-3">
            {!isConnected || (swapData.fromNetwork === 'tron' && !isTronConnected) || (swapData.toNetwork === 'tron' && !isTronConnected) ? (
              <button
                onClick={() => {
                  if (swapData.fromNetwork === 'tron' || swapData.toNetwork === 'tron') {
                    connectTron()
                  } else {
                    // Connect Ethereum wallet
                    const injectedConnector = connectors.find(c => c.id === 'injected' || c.id === 'metaMask')
                    if (injectedConnector) {
                      connect({ connector: injectedConnector })
                    }
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-colors"
              >
                Connect {(swapData.fromNetwork === 'tron' && !isTronConnected) || (swapData.toNetwork === 'tron' && !isTronConnected) ? 'Tron' : 'Ethereum'} Wallet
              </button>
            ) : needsApproval() ? (
              <button
                onClick={handleApprove}
                disabled={!isValidAmount() || !isValidDestination() || isWritePending || isTxPending}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-colors"
              >
                {isWritePending ? 'Confirming...' : isTxPending ? 'Approving...' : `Approve ${swapData.amount || '0'} USDC`}
              </button>
            ) : (
              <button
                onClick={handleBridge}
                disabled={!isValidAmount() || !isValidDestination() || isWritePending || isTxPending || bridgeState.isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-colors"
              >
                {bridgeState.isLoading ? 'Processing...' : `Swap ${swapData.amount || '0'} USDC`}
              </button>
            )}
          </div>

          {/* Error Messages */}
          {txState.error && (
            <div className="mt-4 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-xl text-red-300 text-sm">
              {txState.error}
            </div>
          )}

          {tronError && (
            <div className="mt-4 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-xl text-red-300 text-sm">
              TronLink Error: {tronError}
            </div>
          )}

          {/* Success Message */}
          {txState.isSuccess && !bridgeState.showOverlay && (
            <div className="mt-4 p-4 bg-green-900 bg-opacity-50 border border-green-600 rounded-xl text-green-300 text-sm">
              ✅ Approval successful! You can now swap your tokens.
            </div>
          )}
        </div>
      </div>

      {/* Bridge Overlay Popup */}
      {bridgeState.showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center relative border border-slate-600">
            {/* Close button */}
            <button
              onClick={() => {
                setBridgeState({ isLoading: false, isSuccess: false, showOverlay: false, error: undefined })
                setSwapData(prev => ({ ...prev, amount: '', destinationAddress: '' }))
                setTxState({ isLoading: false, isSuccess: false })
                window.location.reload()
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>

            {bridgeState.isLoading && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-white">Processing Swap</h3>
                <p className="text-gray-300">Your tokens are being transferred cross-chain...</p>
              </div>
            )}

            {bridgeState.isSuccess && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-green-400">Swap Successful!</h3>
                <p className="text-gray-300">Your tokens have been successfully transferred to {NETWORKS[swapData.toNetwork].name}</p>
                <p className="text-sm text-gray-400">You should see the tokens in your destination wallet within a few minutes.</p>
              </div>
            )}

            {bridgeState.error && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-red-400">Swap Failed</h3>
                <p className="text-gray-300">{bridgeState.error}</p>
                <p className="text-sm text-gray-400">Please try again or contact support if the issue persists.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
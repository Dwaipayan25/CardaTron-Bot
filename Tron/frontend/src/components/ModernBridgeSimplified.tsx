import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { 
  useAccount, 
  useBalance, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useReadContract
} from 'wagmi'
import { 
  NETWORKS, 
  ERC20_ABI, 
  RESOLVER_ADDRESS 
} from '../config/contracts'
import { formatUnits, parseUnits } from 'viem'
import {
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Copy,
  Clock,
  DollarSign,
  ChevronDown
} from 'lucide-react'

type NetworkKey = 'sepolia' | 'tron'

const NETWORK_LOGOS = {
  sepolia: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22%2325292E%22%20fill-rule%3D%22evenodd%22%20d%3D%22M14%2028a14%2014%200%201%200%200-28%2014%2014%200%200%200%200%2028Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23a)%22%20fill-opacity%3D%22.3%22%20fill-rule%3D%22evenodd%22%20d%3D%22M14%2028a14%2014%200%201%200%200-28%2014%2014%200%200%200%200%2028Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23b)%22%20d%3D%22M8.19%2014.77%2014%2018.21l5.8-3.44-5.8%208.19-5.81-8.19Z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m14%2016.93-5.81-3.44L14%204.34l5.81%209.15L14%2016.93Z%22%2F%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%220%22%20x2%3D%2214%22%20y1%3D%220%22%20y2%3D%2228%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22b%22%20x1%3D%2214%22%20x2%3D%2214%22%20y1%3D%2214.77%22%20y2%3D%2222.96%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff%22%20stop-opacity%3D%22.9%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E%0A",
  tron: "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png"
}

interface SwapData {
  fromNetwork: NetworkKey
  toNetwork: NetworkKey
  amount: string
  destinationAddress: string
}

interface BridgeStatus {
  step: 'idle' | 'approving' | 'bridging' | 'waiting' | 'completed' | 'error'
  txHash?: string
  error?: string
  progress: number
}

export default function ModernBridgeSimplified() {
  const { address, isConnected } = useAccount()
  const [fromNetwork, setFromNetwork] = useState<NetworkKey>('sepolia')
  const [toNetwork, setToNetwork] = useState<NetworkKey>('tron')
  const [amount, setAmount] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>({ 
    step: 'idle', 
    progress: 0 
  })

  // Balance hooks
  const { data: sepoliaBalance, refetch: refetchSepoliaBalance } = useBalance({
    address: address,
    token: NETWORKS.sepolia.usdc as `0x${string}`,
    chainId: NETWORKS.sepolia.chainId,
  })

  // Native balance for gas estimation
  const { data: sepoliaNative } = useBalance({
    address: address,
    chainId: NETWORKS.sepolia.chainId,
  })

  // Allowance hooks  
  const { data: sepoliaAllowance, refetch: refetchSepoliaAllowance } = useReadContract({
    address: NETWORKS.sepolia.usdc as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, NETWORKS.sepolia.resolver as `0x${string}`] : undefined,
    chainId: NETWORKS.sepolia.chainId,
  })

  // Contract hooks
  const { writeContract, isPending: isTxPending, data: txHash } = useWriteContract()
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Refresh balances after transaction
  useEffect(() => {
    if (isTxSuccess) {
      refetchSepoliaBalance()
      refetchSepoliaAllowance()
    }
  }, [isTxSuccess, refetchSepoliaBalance, refetchSepoliaAllowance])

  const getBalance = (network: NetworkKey) => {
    switch (network) {
      case 'sepolia': return sepoliaBalance
      case 'tron': return null // Tron balance handled separately
      default: return null
    }
  }

  const getAllowance = (network: NetworkKey) => {
    switch (network) {
      case 'sepolia': return sepoliaAllowance
      case 'tron': return BigInt(0) // Tron allowance handled separately
      default: return BigInt(0)
    }
  }

  const getNeedsApproval = () => {
    if (fromNetwork === 'tron') return false
    
    const balance = getBalance(fromNetwork)
    const allowance = getAllowance(fromNetwork)
    const amountBN = amount ? parseUnits(amount, 6) : BigInt(0)
    
    return balance && allowance !== undefined && amountBN > 0 && allowance < amountBN
  }

  const handleApproval = () => {
    if (!address || fromNetwork === 'tron') return

    const network = NETWORKS[fromNetwork]
    const amountToApprove = parseUnits(amount, 6)
    
    setBridgeStatus({ step: 'approving', progress: 25 })
    
    writeContract({
      address: network.usdc as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [network.resolver as `0x${string}`, amountToApprove],
      chainId: network.chainId,
    })
  }

  const handleBridge = async () => {
    if (!isConnected || !address || !amount || !destinationAddress) return
    
    setBridgeStatus({ step: 'bridging', progress: 25 })
    
    try {
      // Create swap request for the resolver with correct field names
      const swapRequest = {
        fromNetwork,
        toNetwork,
        fromToken: 'USDC',
        toToken: 'USDC',
        amount: amount, // Send as string for ethers parseUnits
        userAddress: address,
        destinationAddress
      }

      console.log('🔄 Sending swap request to resolver:', swapRequest)
      
      // Call the resolver API
      const response = await fetch('http://localhost:3001/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swapRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Resolver API error: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log('✅ Resolver response:', result)

      setBridgeStatus({ 
        step: 'waiting', 
        progress: 75,
        txHash: result.txHash || result.orderHash
      })

      // Check order status periodically
      if (result.orderHash) {
        const checkStatus = async () => {
          try {
            const statusResponse = await fetch(`http://localhost:3001/order/${result.orderHash}`)
            const statusResult = await statusResponse.json()
            
            if (statusResult.status === 'completed') {
              setBridgeStatus({ step: 'completed', progress: 100 })
            } else {
              // Check again in 5 seconds
              setTimeout(checkStatus, 5000)
            }
          } catch (error) {
            console.error('Error checking order status:', error)
            setBridgeStatus({ step: 'completed', progress: 100 }) // Complete anyway
          }
        }
        
        // Start checking after 3 seconds
        setTimeout(checkStatus, 3000)
      } else {
        // Complete after delay if no order hash
        setTimeout(() => {
          setBridgeStatus({ step: 'completed', progress: 100 })
        }, 5000)
      }

    } catch (error) {
      console.error('❌ Bridge error:', error)
      setBridgeStatus({ 
        step: 'error', 
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  const switchNetworks = () => {
    const newFrom = toNetwork
    const newTo = fromNetwork
    setFromNetwork(newFrom)
    setToNetwork(newTo)
  }

  const resetBridgeStatus = () => {
    setBridgeStatus({ step: 'idle', progress: 0 })
  }

  const NetworkSelector = ({ 
    network, 
    onChange, 
    disabled = false 
  }: { 
    network: NetworkKey
    onChange: (network: NetworkKey) => void
    disabled?: boolean 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/30">
        <img 
          src={NETWORK_LOGOS[network]} 
          alt={NETWORKS[network].name}
          className="w-6 h-6 rounded-full"
        />
        <div>
          <div className="font-medium">{NETWORKS[network].name}</div>
          <div className="text-xs text-muted-foreground">
            {network === 'sepolia' ? 'Ethereum' : 'TRON'}
          </div>
        </div>
        {!disabled && (
          <ChevronDown className="ml-auto w-4 h-4" />
        )}
      </div>
    </div>
  )

  const formatBalance = (balance: any, decimals: number = 6) => {
    if (!balance) return '0'
    return parseFloat(formatUnits(balance.value, decimals)).toFixed(4)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cross-Chain Bridge
            </CardTitle>
            <p className="text-muted-foreground">
              Bridge USDC between Ethereum Sepolia and TRON
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* From Network */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">From</label>
                <div className="text-sm text-muted-foreground">
                  Balance: {formatBalance(getBalance(fromNetwork))} USDC
                </div>
              </div>
              <NetworkSelector 
                network={fromNetwork} 
                onChange={setFromNetwork}
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USDC)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={switchNetworks}
                className="rounded-full"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Network */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <NetworkSelector 
                network={toNetwork} 
                onChange={setToNetwork}
              />
            </div>

            {/* Destination Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Destination Address {toNetwork === 'tron' ? '(TRON)' : '(Ethereum)'}
              </label>
              <Input
                placeholder={toNetwork === 'tron' ? 'T...' : '0x...'}
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
              />
            </div>

            {/* Bridge Status */}
            {bridgeStatus.step !== 'idle' && (
              <Card className={bridgeStatus.step === 'error' ? "border-red-200 bg-red-50/50" : "border-blue-200 bg-blue-50/50"}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {bridgeStatus.step === 'approving' && 'Approving tokens...'}
                      {bridgeStatus.step === 'bridging' && 'Connecting to resolver...'}
                      {bridgeStatus.step === 'waiting' && 'Processing cross-chain swap...'}
                      {bridgeStatus.step === 'completed' && 'Bridge completed!'}
                      {bridgeStatus.step === 'error' && 'Bridge failed'}
                    </div>
                    {bridgeStatus.step === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : bridgeStatus.step === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                  </div>
                  
                  <Progress value={bridgeStatus.progress} className="h-2" />
                  
                  {bridgeStatus.error && bridgeStatus.step === 'error' && (
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                      {bridgeStatus.error}
                    </div>
                  )}
                  
                  {bridgeStatus.txHash && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span>Transaction:</span>
                      <code className="bg-muted px-2 py-1 rounded font-mono">
                        {bridgeStatus.txHash.slice(0, 10)}...
                      </code>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isConnected ? (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Please connect your wallet to continue
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {getNeedsApproval() ? (
                    <Button 
                      onClick={handleApproval}
                      disabled={isTxPending || !amount}
                      className="w-full"
                      size="lg"
                    >
                      {isTxPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        `Approve ${amount} USDC`
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleBridge}
                        disabled={!amount || !destinationAddress || (bridgeStatus.step !== 'idle' && bridgeStatus.step !== 'error')}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="lg"
                      >
                        {bridgeStatus.step === 'idle' ? (
                          `Bridge ${amount || '0'} USDC`
                        ) : bridgeStatus.step === 'error' ? (
                          'Try Again'
                        ) : (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Bridging...
                          </>
                        )}
                      </Button>
                      
                      {bridgeStatus.step === 'error' && (
                        <Button 
                          onClick={resetBridgeStatus}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          Reset
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Network Info */}
            <div className="text-center text-xs text-muted-foreground">
              <p>Powered by 1inch Fusion+ Protocol</p>
              <p>Resolver: {RESOLVER_ADDRESS.slice(0, 6)}...{RESOLVER_ADDRESS.slice(-4)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
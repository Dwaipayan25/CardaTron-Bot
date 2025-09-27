"use client"

import { useState } from "react"
import { SwapInterface } from "@/components/swap-interface"
import { OrdersDashboard } from "@/components/orders-dashboard"
import { OrderDetail } from "@/components/order-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, List, Zap } from "lucide-react"
import { useEthereumWallet } from "@/hooks/use-ethereum-wallet"
import { useCardanoWallet } from "@/context/WalletContext"

export default function Home() {
  const [currentView, setCurrentView] = useState<"swap" | "orders" | "order-detail">("swap")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
const {isConnected: isCardanoWalletConnected,connect: connectCardanoWallet} = useCardanoWallet()
  const { isConnected: isEvmWalletConnected, connect: connectEvmWallet } = useEthereumWallet()

  const handleViewOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId)
    setCurrentView("order-detail")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a183d] via-[#142e5c] to-[#0a183d] flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#101c3a] border-b border-[#1a2a4d] px-0 py-0 shadow-lg">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">Cross-Chain Bridge</h1>
              <div className="text-xs text-slate-300">Powered by 1inch Fusion+</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Network Dropdown */}
            <div className="bg-[#182a4d] rounded-lg px-3 py-1 text-white text-sm font-medium flex items-center gap-2">
              <span>Sepolia</span>
              <span className="bg-blue-600 text-white rounded px-2 py-0.5 text-xs">0.195 ETH</span>
            </div>
            {/* Wallet Info */}
            {isEvmWalletConnected && (
              <div className="bg-[#182a4d] rounded-lg px-3 py-1 text-white text-sm font-medium flex items-center gap-2">
                <span>{typeof window !== 'undefined' && window.localStorage.getItem('evmAddress') ? `${window.localStorage.getItem('evmAddress')?.slice(0,6)}...${window.localStorage.getItem('evmAddress')?.slice(-4)}` : '0x29B9...3b99'}</span>
              </div>
            )}
            {isCardanoWalletConnected && (
              <div className="bg-[#182a4d] rounded-lg px-3 py-1 text-white text-sm font-medium flex items-center gap-2">
                <span>TTK630...ZvGP</span>
                <span className="bg-orange-500 text-white rounded px-2 py-0.5 text-xs">983.31 TRX</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          {currentView !== "order-detail" && (
            <div className="flex gap-2 mb-6 justify-center">
              <Button
                variant={currentView === "swap" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("swap")}
                className="text-white"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Swap
              </Button>
              <Button
                variant={currentView === "orders" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("orders")}
                className="text-white"
              >
                <List className="w-4 h-4 mr-2" />
                Orders
              </Button>
            </div>
          )}

          {/* Main Content */}
          {currentView === "swap" && (
            <SwapInterface
              isEvmWalletConnected={isEvmWalletConnected}
              onEvmWalletConnect={connectEvmWallet}
            />
          )}

          {currentView === "orders" && (
            <OrdersDashboard
              isEvmWalletConnected={isEvmWalletConnected}
              onEvmWalletConnect={connectEvmWallet}
              onViewDetail={handleViewOrderDetail}
            />
          )}

          {currentView === "order-detail" && selectedOrderId && (
            <OrderDetail orderId={selectedOrderId} onBack={() => setCurrentView("orders")} />
          )}
        </div>
      </main>
    </div>
  )
}

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { ModernBridge } from '@/components/ModernBridge'
import { TronConnectButton } from '@/components/TronConnectButton'

function App() {
  const { address } = useAccount();
  const chainId = useChainId();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Cross-Chain Bridge</h1>
              <p className="text-sm text-slate-300">Powered by 1inch Fusion+</p>
            </div>
          </div>
          
          {/* Wallet Connect Buttons */}
          <div className="flex items-center gap-3">
            <ConnectButton />
            <TronConnectButton />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Network Warning */}
        {(chainId !== 11155111 || !chainId) && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-900/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg">
              <p className="text-sm">
                Please connect to Sepolia testnet to use this bridge
              </p>
            </div>
          </div>
        )}

        <ModernBridge />
      </main>
    </div>
  );
}

export default App;
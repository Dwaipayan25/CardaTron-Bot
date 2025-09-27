// Mock Web3 Service
// Simulates Web3 API calls and returns appropriate responses

const MOCK_RESPONSES = {
  token_swap: {
    success: " Tokens swapped successfully! Your {amount} tokens have been transferred from {source_network} to {target_network}. Transaction hash: 0x{tx_hash}",
    error: " Token swap failed. Please check your balance and try again."
  },
  nft_mint: {
    success: " NFT minted successfully! Your NFT '{name}' has been created and added to your wallet. Token ID: {token_id}",
    error: " NFT minting failed. Please check your wallet and try again."
  },
  send_money: {
    success: " Transaction successful! {amount} tokens have been sent to {recipient}. Transaction hash: 0x{tx_hash}",
    error: " Transaction failed. Please check the recipient address and your balance."
  },
  check_balance: {
    success: " Your current balance:\n• Ethereum: 2.5 ETH\n• Solana: 150 SOL\n• Bitcoin: 0.1 BTC\n• USDC: 1,000 USDC",
    error: " Unable to fetch balance. Please check your wallet connection."
  },
  stake_tokens: {
    success: " Staking successful! {amount} tokens have been staked. You'll start earning rewards in 24 hours.",
    error: " Staking failed. Please check your token balance and try again."
  },
  provide_liquidity: {
    success: " Liquidity provided successfully! {amount} tokens added to the pool. You'll start earning trading fees immediately.",
    error: " Failed to provide liquidity. Please check your balance and try again."
  },
  general_help: {
    success: " I can help you with various Web3 operations:\n\n• **Token Swaps**: Exchange tokens between different blockchains\n• **NFT Minting**: Create new NFTs\n• **Send Money**: Transfer tokens to other addresses\n• **Check Balance**: View your wallet balance\n• **Stake Tokens**: Earn rewards by staking\n• **Provide Liquidity**: Earn fees by providing liquidity\n\nJust tell me what you'd like to do!",
    error: " I'm having trouble understanding your request. Please try rephrasing it."
  }
};

function generateTransactionHash() {
  return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
}

function generateTokenId() {
  return Math.floor(Math.random() * 1000000);
}

function simulateAPICall(operation, entities) {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90% success rate for demo purposes
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        resolve({
          success: true,
          data: {
            tx_hash: generateTransactionHash(),
            token_id: generateTokenId(),
            ...entities
          }
        });
      } else {
        resolve({
          success: false,
          error: "Simulated API error"
        });
      }
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  });
}

function formatResponse(template, data) {
  let response = template;
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    response = response.replace(new RegExp(placeholder, 'g'), value || 'N/A');
  }
  
  return response;
}

async function mockWeb3API(intent) {
  const { type, entities } = intent;
  
  try {
    // Simulate API call
    const result = await simulateAPICall(type, entities);
    
    if (result.success) {
      const template = MOCK_RESPONSES[type]?.success || MOCK_RESPONSES.general_help.success;
      const message = formatResponse(template, result.data);
      
      return {
        message,
        success: true,
        operation: type,
        data: result.data
      };
    } else {
      const template = MOCK_RESPONSES[type]?.error || MOCK_RESPONSES.general_help.error;
      
      return {
        message: template,
        success: false,
        operation: type,
        error: result.error
      };
    }
  } catch (error) {
    console.error('Mock API error:', error);
    
    return {
      message: " An unexpected error occurred. Please try again later.",
      success: false,
      operation: type,
      error: error.message
    };
  }
}

// Additional utility functions for future real API integration
function validateAddress(address) {
  // Basic address validation
  if (!address) return false;
  
  // Ethereum address validation
  if (address.startsWith('0x') && address.length === 42) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  // Solana address validation (simplified)
  if (address.length >= 32 && address.length <= 44) {
    return /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
  }
  
  return false;
}

function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0;
}

function getNetworkInfo(network) {
  const networks = {
    ethereum: {
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/...'
    },
    solana: {
      name: 'Solana',
      symbol: 'SOL',
      chainId: 101,
      rpcUrl: 'https://api.mainnet-beta.solana.com'
    },
    polygon: {
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com'
    }
  };
  
  return networks[network?.toLowerCase()] || null;
}

module.exports = {
  mockWeb3API,
  validateAddress,
  validateAmount,
  getNetworkInfo
};


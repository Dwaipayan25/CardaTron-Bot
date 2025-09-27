import dotenv from 'dotenv';
dotenv.config();

export const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    // Updated with deployed contracts
    weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    trueERC20: "0x63fe7b072FA5f32ac659D0d6135C2ACa29129E90",
    limitOrderProtocol: "0xE12fF25857db54Eada11c4739915cb0eE6865aE9",
    settlement: "0x38904B729Cb7ff0CBb44d85D260C401C8414d64D",
    escrowFactory: "0xf97BE1a0913419bEA46bEE99bA3a9E28A8e13941",
    usdc: "0x91942B4882a0C9d6fD69CDaAE07844D1776740bf"
  },
  tron: {
    chainId: 2,
    rpcUrl: "https://api.shasta.trongrid.io",
    fullNode: "https://api.shasta.trongrid.io",
    solidityNode: "https://api.shasta.trongrid.io",
    eventServer: "https://api.shasta.trongrid.io",
    // Updated with deployed contracts
    usdc: "TVi8uh66C3XNzZbPjJtkE2wBw6DcVaz21A",
    weth: "TCMyjZA9FdrXNaFdhUqKxXZqXMTdnpj8Td",
    trueERC20: "THg7iq7yTgkubicMvkS1jt9T3xRi97J1KY",
    limitOrderProtocol: "TUBuiMvLv5JeiZQnCDCNFfmQBiDfRVTeT3",
    escrowFactory: "TKzQ1wdyQBdWKRHiuSdRSCkEMF8KCj3HGm",
    settlement: "TBW5RahmXqL4CzQaQVJx2Xqa9wo9VPVJz8",
    resolver: "TTkG3osicf8R9ugpVsYjWs9SHXopz4ZvGP"
  }
  // Commented out unused networks
  /*
  celo: {
    chainId: 44787,
    rpcUrl: "https://celo-alfajores.drpc.org",
    // Deployed contracts
    weth: "0xfC47b0FFACC1ef1c6267f06F2A15cDB23a44c93d",
    trueERC20: "0xC97139a987a0B2c988Cb478b7A392FBF05C5f168",
    limitOrderProtocol: "0x176f5c341F9b1812b866c97677c270F3209d7D8b",
    settlement: "0x14367b834E7C39fD316730D413bF07c7e7a2E1A9",
    escrowFactory: "0x3FF2736041437F74eA564505db782F86ADC69e35",
    usdc: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B"
  },
  monad: {
    chainId: 10143,
    rpcUrl: "https://monad-testnet.drpc.org",
    weth: "0x1eB50687659aD0012e70f6407C4Fe2d312827df2",
    settlement: "0x1eB50687659aD0012e70f6407C4Fe2d312827df2",
    escrowFactory: "0xcEeeaA149BEd3Af5FB9553f0AdA0a537efcc6256",
    usdc: "0xc477386a8ced1fe69d5d4ecd8eaf6558da9e537c"
  },
  etherlink: {
    chainId: 128123,
    rpcUrl: "https://node.ghostnet.etherlink.com",
    weth: "0x1eB50687659aD0012e70f6407C4Fe2d312827df2",
    settlement: "0x1eB50687659aD0012e70f6407C4Fe2d312827df2",
    escrowFactory: "0xcEeeaA149BEd3Af5FB9553f0AdA0a537efcc6256",
    usdc: "0xC477386A8CED1fE69d5d4eCD8EaF6558DA9e537c"
  },
  */
};

export const RESOLVER_CONFIG = {
  // Resolver account - load from environment variable
  privateKey: process.env.RESOLVER_PRIVATE_KEY || "",
  address: "0xB4A98E40FF6dd793338B684d7DbfCfB1FEC352bF",
  
  // 1inch Fusion+ Time lock configuration (in seconds)
  timeLocks: {
    // Source chain timelock phases
    srcFinalityLock: 300,        // 5 minutes - wait for finality
    srcPrivateWithdrawal: 600,   // 10 minutes - resolver can withdraw
    srcPublicWithdrawal: 1200,   // 20 minutes - anyone can withdraw
    srcPrivateCancellation: 1800, // 30 minutes - maker can cancel
    srcPublicCancellation: 86400, // 1 day - anyone can cancel for maker
    
    // Destination chain timelock phases  
    dstFinalityLock: 300,        // 5 minutes
    dstPrivateWithdrawal: 600,   // 10 minutes
    dstPublicWithdrawal: 1200,   // 20 minutes
    dstPrivateCancellation: 1800  // 30 minutes
  },
  
  // Safety deposits (in wei for native tokens, wei equivalent for ERC20)
  safetyDeposit: {
    src: "1000000000000000000", // 1 ETH equivalent
    dst: "1000000000000000000"  // 1 ETH equivalent
  },
  
  // Server configuration
  port: 3001,
  
  // Gas configuration
  gasLimits: {
    escrowCreation: 800000,
    secretReveal: 200000,
    withdrawal: 150000,
    cancellation: 150000
  },
  
  // Dutch auction configuration
  auction: {
    startTime: 0, // Immediate start
    duration: 1800, // 30 minutes
    initialRateBump: 10000, // 100% initial premium (in basis points)
    finalRateBump: 0 // No premium at end
  }
};
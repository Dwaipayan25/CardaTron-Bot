import { sepolia } from 'viem/chains'

// Define custom chains
const tronShasta = {
  id: 2,
  name: 'Tron Shasta',
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://api.shasta.trongrid.io'] }
  },
  blockExplorers: {
    default: { name: 'Tronscan Shasta', url: 'https://shasta.tronscan.org' }
  }
} as const

// Commented out unused chains
// const celoAlfajores = {...}
// const monadTestnet = {...}
// const etherlinkTestnet = {...}

export const NETWORKS = {
  sepolia: {
    chainId: sepolia.id,
    name: 'Ethereum Sepolia',
    nativeCurrency: sepolia.nativeCurrency,
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    blockExplorer: 'https://sepolia.etherscan.io',
    usdc: '0x91942B4882a0C9d6fD69CDaAE07844D1776740bf',
    weth: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    trueERC20: '0xf221aA2F6B9d5B176Cf5033C02eBE9210B23B9Bd',
    limitOrderProtocol: '0x4B9aEE0D144C33C05aa46d08B3A4d0FbFe409d30',
    escrowFactory: '0x9337089084C880258E9badaF795C35a88da43671',
    settlement: '0x166A5c2cc2af0fe9DCf1672b462540DeBAaCcc54',
    resolver: '0xB4A98E40FF6dd793338B684d7DbfCfB1FEC352bF',
  },
  tron: {
    chainId: tronShasta.id,
    name: 'Tron Shasta',
    nativeCurrency: tronShasta.nativeCurrency,
    rpcUrl: 'https://api.shasta.trongrid.io',
    blockExplorer: 'https://shasta.tronscan.org',
    usdc: 'TVi8uh66C3XNzZbPjJtkE2wBw6DcVaz21A',
    weth: 'TLcd2djcAotbJ4o8Q8KAb9SdjCLJLgEsxo',
    trueERC20: 'TVJWy1cH5VFFJ5DtvdsU5QeM1T8CgPnnkJ',
    limitOrderProtocol: 'TFvasQBUe6UUTvg6hCMDATd8fZLmqpHRTK',
    escrowFactory: 'TXwv4wLWe3e5sNSF6Nw7sG5rDsAnhEPfdG',
    settlement: 'TGPw7L2wF4BiXAXiY7TV62uWTk72GP76MM',
    resolver: 'TUZvTpUn9kJrsnSgv5jPCs8soAWvaTjNJb',
  },
  // Commented out unused networks
  /*
  celo: {
    chainId: celoAlfajores.id,
    name: 'Celo Alfajores',
    nativeCurrency: celoAlfajores.nativeCurrency,
    rpcUrl: 'https://celo-alfajores.drpc.org',
    blockExplorer: 'https://celo-alfajores.blockscout.com',
    usdc: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
    escrowFactory: '0x3FF2736041437F74eA564505db782F86ADC69e35',
    resolver: '0x917999645773E99d03d44817B7318861F018Cb74',
  },
  monad: {
    chainId: monadTestnet.id,
    name: 'Monad Testnet',
    nativeCurrency: monadTestnet.nativeCurrency,
    rpcUrl: 'https://monad-testnet.drpc.org',
    blockExplorer: 'https://explorer.monad.xyz',
    usdc: '0xc477386a8ced1fe69d5d4ecd8eaf6558da9e537c',
    escrowFactory: '0xcEeeaA149BEd3Af5FB9553f0AdA0a537efcc6256',
    resolver: '0x917999645773E99d03d44817B7318861F018Cb74',
  },
  etherlink: {
    chainId: etherlinkTestnet.id,
    name: 'Etherlink Testnet',
    nativeCurrency: etherlinkTestnet.nativeCurrency,
    rpcUrl: 'https://node.ghostnet.etherlink.com',
    blockExplorer: 'https://testnet.explorer.etherlink.com',
    usdc: '0xC477386A8CED1fE69d5d4eCD8EaF6558DA9e537c',
    escrowFactory: '0xcEeeaA149BEd3Af5FB9553f0AdA0a537efcc6256',
    resolver: '0x917999645773E99d03d44817B7318861F018Cb74',
  },
  */
} as const

export const SUPPORTED_TOKENS = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      [sepolia.id]: NETWORKS.sepolia.usdc,
      [tronShasta.id]: NETWORKS.tron.usdc,
      // Commented out unused networks
      // [celoAlfajores.id]: NETWORKS.celo.usdc,
      // [monadTestnet.id]: NETWORKS.monad.usdc,
      // [etherlinkTestnet.id]: NETWORKS.etherlink.usdc,
    },
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
} as const

// Contract ABIs
export const ERC20_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ESCROW_FACTORY_ABI = [
  {
    inputs: [
      { name: 'orderHash', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'hashLock', type: 'bytes32' },
      { name: 'timeLocks', type: 'uint256' },
      { name: 'maker', type: 'address' },
      { name: 'taker', type: 'address' }
    ],
    name: 'createEscrow',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderHash', type: 'bytes32' }],
    name: 'getEscrow',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderHash', type: 'bytes32' }],
    name: 'escrowExists',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'orderHash', type: 'bytes32' },
      { indexed: true, name: 'escrow', type: 'address' },
      { indexed: true, name: 'token', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'hashLock', type: 'bytes32' },
      { indexed: false, name: 'deployedAt', type: 'uint256' }
    ],
    name: 'EscrowCreated',
    type: 'event',
  },
] as const

export const ESCROW_ABI = [
  'function withdraw(bytes32 secret) external',
  'function cancel() external',
  'function getState() view returns (string)',
  'function revealedSecret() view returns (bytes32)',
  'function immutables() view returns (tuple(bytes32 orderHash, bytes32 hashLock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timeLocks))',
  'function timeLocks() view returns (tuple(uint32 deployedAt, uint32 withdrawal, uint32 publicWithdrawal, uint32 cancellation, uint32 publicCancellation))',
  'function withdrawn() view returns (bool)',
  'function cancelled() view returns (bool)',
  'event SecretRevealed(bytes32 indexed orderHash, bytes32 secret)',
  'event Withdrawn(bytes32 indexed orderHash, address indexed to, uint256 amount)',
  'event Cancelled(bytes32 indexed orderHash, address indexed to, uint256 amount)',
] as const

// Resolver address that users need to approve for intent-based bridging
export const RESOLVER_ADDRESS = '0xB4A98E40FF6dd793338B684d7DbfCfB1FEC352bF'

export type NetworkKey = keyof typeof NETWORKS
export type TokenKey = keyof typeof SUPPORTED_TOKENS
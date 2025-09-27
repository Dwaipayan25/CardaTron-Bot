lop.preInteraction(orderHash, tokenAddress, amount);

# Cardano Swap: Unified Project Documentation

This repository implements a cross-chain atomic swap system for EVM ↔ Cardano, featuring trustless token exchanges, backend API, smart contracts, and a modern frontend. Below you'll find a unified architecture overview, backend API endpoints, model structure, and quick start steps.

---

## 🏗️ Architecture Overview

The system enables secure, decentralized swaps between EVM and Cardano using Hash-Time-Locked Contracts (HTLCs), relayer services, and WebSocket notifications. Key flows:

- **EVM → Cardano**: Maker locks tokens on EVM, Resolver facilitates swap via Cardano
- **Cardano → EVM**: Maker locks tokens on Cardano, Resolver facilitates swap via EVM

Relayer monitors both chains, shares secrets, and coordinates atomic execution.

---

## 📦 Backend API & Model Structure

### Project Structure

```
backend/
├── app.js                  # Main application entry point
├── config/
│   └── database.js         # Database connection setup
├── controllers/
│   ├── ordersController.js # Business logic for orders
│   └── relayerController.js# Business logic for relayer
├── models/
│   ├── index.js            # Database sync logic
│   └── Order.js            # Order model definition
├── routes/
│   ├── orders.js           # Orders API routes
│   └── relayer.js          # Relayer API routes
├── services/
│   ├── monitorService.js   # Order monitoring logic
│   ├── orderService.js     # Order business logic
│   ├── relayerService.js   # Relayer business logic
│   └── websocketService.js # WebSocket notifications
├── utils/
│   ├── constants.js        # App constants
│   ├── errorHandler.js     # Error handling middleware
│   └── validation.js       # Request validation
├── .env                    # Environment variables
├── .env.example            # Example env file
├── package.json
└── README.md
```

### Order Model (`models/Order.js`)

Stores all swap order data:
- `id` (UUID): Unique order identifier
- `status`: pending, depositing, withdrawing, completed, failed, expired, cancelled
- `fromChain`, `toChain`: Source and destination blockchains
- `fromToken`, `toToken`: Asset symbols
- `fromAmount`, `toAmount`: Amounts (string for large numbers)
- `makerSrcAddress`, `makerDstAddress`: Maker addresses
- `resolverAddress`: Resolver address
- `hashlock`, `salt`, `orderHash`, `signature`: Atomic swap primitives
- `escrowSrcAddress`, `escrowDstAddress`: Escrow contract addresses
- `srcEscrowTxHash`, `dstEscrowTxHash`, `srcWithdrawTxHash`, `dstWithdrawTxHash`: Transaction hashes
- `secret`: Secret revealed for swap
- `relayerFee`: Fee for relayer
- `expiresAt`: Expiration timestamp
- `createdAt`, `updatedAt`: Timestamps

---

### API Endpoints

#### Orders
- `GET /api/orders` — List all orders (supports pagination & filtering)
- `GET /api/orders/:id` — Get order by ID
- `POST /api/orders` — Create a new order
- `PATCH /api/orders/:id/status` — Update order status
- `PATCH /api/orders/:id/escrow-addresses` — Update escrow addresses for an order
- `PATCH /api/orders/:id/tx-hash` — Update transaction hashes for an order
- `POST /api/orders/:id/accept` — Accept an order (resolver)

#### Relayer
- `POST /api/relayer/monitor/:orderId` — Monitor order, update escrow tx hashes, and trigger secret request

#### Other
- `GET /health` — Health check endpoint
- `GET /api-docs` — Swagger API documentation

---

### Example API Usage

#### Create an Order
```sh
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "EVM",
    "toChain": "Cardano",
    "fromToken": "USDC",
    "toToken": "ADA",
    "fromAmount": "1000000",
    "toAmount": "999999",
    "makerSrcAddress": "0x...",
    "makerDstAddress": "addr1...",
    "hashlock": "0x...",
    "salt": 123456,
    "orderHash": "0x...",
    "signature": "0x...",
    "expiresAt": "2025-10-01T00:00:00Z"
  }'
```

#### Accept an Order
```sh
curl -X POST http://localhost:3000/api/orders/<orderId>/accept \
  -H "Content-Type: application/json" \
  -d '{ "resolverAddress": "0x..." }'
```

#### Update Escrow Addresses
```sh
curl -X PATCH http://localhost:3000/api/orders/<orderId>/escrow-addresses \
  -H "Content-Type: application/json" \
  -d '{ "escrowSrcAddress": "0x...", "escrowDstAddress": "0x..." }'
```

#### Update Transaction Hashes
```sh
curl -X PATCH http://localhost:3000/api/orders/<orderId>/tx-hash \
  -H "Content-Type: application/json" \
  -d '{ "srcEscrowTxHash": "0x...", "dstEscrowTxHash": "0x..." }'
```

#### Monitor Order (Relayer)
```sh
curl -X POST http://localhost:3000/api/relayer/monitor/<orderId> \
  -H "Content-Type: application/json" \
  -d '{ "srcEscrowTxHash": "0x...", "dstEscrowTxHash": "0x..." }'
```

---

## 🚀 Quick Start Steps

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Blockfrost API key (Cardano)
- Infura/Alchemy API key (EVM)

### 1. Clone & Install
```sh
git clone <repository-url>
cd cardano-swap-main
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../contracts/evm && npm install
cd ../contracts/cardano && npm install
```

### 2. Environment Setup
Create `.env` files in each directory. See backend/README.md for examples.

### 3. Database Setup
```sh
cd backend
createdb cardano_swap
# Tables auto-created on first run
```

### 4. Compile & Deploy Contracts
```sh
# EVM
cd contracts/evm
npm run compile
# Cardano
cd ../cardano
npm run build
```

### 5. Start Backend & Frontend
```sh
cd backend
npm run dev
cd ../frontend
npm run dev
```

---

## 📄 API Documentation

Visit `http://localhost:3000/api-docs` for full Swagger docs and try out endpoints interactively.

---

## 🛡️ Security & Monitoring

- All contracts use OpenZeppelin libraries for security
- Timelock and safety deposit mechanisms
- WebSocket notifications for swap status
- Health checks at `/health`

---

## 🤝 Support & License

For issues, questions, or contributions:
- GitHub Issues
- Inline code comments
- MIT License

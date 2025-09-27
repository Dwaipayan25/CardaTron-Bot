# uAgents, Agentverse, Fetch.ai & ASI One Integration Guide

## 🚀 Overview

DecentraBot now integrates with Fetch.ai's ecosystem, including uAgents, Agentverse, Fetch Network, and ASI One (when available). This integration enables autonomous, decentralized Web3 operations through conversational AI.

## 🏗️ Architecture

```
Frontend (React) → Backend (Node.js) → uAgent Bridge → Python uAgent Service
                                      ↓
                              Agentverse API → Fetch.ai Network → ASI One
```

## 📦 Installation & Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `backend/env.example` to `backend/.env` and configure:

```bash
cp backend/env.example backend/.env
```

Edit the `.env` file with your API keys and configuration.

## 🔧 Components

### 1. uAgent Service (`backend/uagent_service.py`)

**Purpose**: Core Python service using Fetch.ai's uAgents framework for autonomous Web3 operations.

**Key Features**:
- Autonomous agent handling Web3 operations
- Message-based communication protocol
- Integration with Fetch.ai network
- Support for token swaps, NFT minting, transfers, staking, and liquidity provision

**Usage**:
```bash
cd backend
python uagent_service.py
```

### 2. uAgent Bridge (`backend/services/uagentBridge.js`)

**Purpose**: Node.js bridge connecting the Express backend with the Python uAgent service.

**Key Features**:
- Process management for Python uAgent service
- Request/response handling
- Agentverse API integration
- Fetch.ai network connectivity
- ASI One integration (placeholder)

### 3. Enhanced Server (`backend/server.js`)

**Purpose**: Updated Express server with uAgent integration and new API endpoints.

**New Endpoints**:
- `GET /api/uagent/status` - Check uAgent connection status
- `POST /api/uagent/request` - Send direct requests to uAgent
- `POST /api/agentverse/deploy` - Deploy agents to Agentverse
- `GET /api/agentverse/status/:agentId` - Check agent status
- `GET /api/fetch/balance/:address` - Query Fetch.ai wallet balance
- `GET /api/fetch/transactions/:address` - Get transaction history
- `POST /api/asi/query` - ASI One queries (when available)

## 🧪 Testing

### Run uAgent Tests

```bash
cd backend
python test_uagent.py
```

### Test Individual Components

```bash
# Test uAgent service
cd backend
python uagent_service.py

# Test backend with uAgent integration
npm run dev
```

## 🔮 Future Scope & Applications

### 1. **Advanced DeFi Operations**
- **Automated Yield Farming**: Agents can autonomously move funds between different yield farming protocols based on optimal returns
- **Cross-chain Arbitrage**: Agents monitor price differences across chains and execute arbitrage trades
- **Liquidity Management**: Intelligent liquidity provision and withdrawal based on market conditions
- **Risk Management**: Automated stop-losses and portfolio rebalancing

### 2. **NFT Ecosystem Integration**
- **Dynamic NFT Minting**: Agents create NFTs based on real-world events or user preferences
- **NFT Trading**: Automated buying/selling of NFTs based on market analysis
- **Royalty Management**: Automated collection and distribution of NFT royalties
- **Metadata Management**: Dynamic NFT metadata updates based on external data

### 3. **Multi-Agent Collaboration**
- **Agent Swarms**: Multiple specialized agents working together for complex operations
- **Service Discovery**: Agents finding and collaborating with other agents in the network
- **Task Delegation**: Intelligent delegation of tasks to specialized agents
- **Consensus Mechanisms**: Agents reaching consensus on complex decisions

### 4. **Real-time Market Intelligence**
- **Price Prediction**: AI agents analyzing market data for price predictions
- **Sentiment Analysis**: Monitoring social media and news for market sentiment
- **Technical Analysis**: Automated technical analysis and trading signals
- **Fundamental Analysis**: Analyzing project fundamentals and tokenomics

### 5. **Cross-chain Interoperability**
- **Universal Bridges**: Seamless asset transfers between any blockchain
- **Cross-chain Smart Contracts**: Contracts that operate across multiple chains
- **Unified Liquidity**: Single liquidity pools spanning multiple chains
- **Cross-chain Governance**: Voting and governance across different networks

### 6. **Enterprise Integration**
- **Supply Chain Management**: Tracking and managing supply chains using blockchain
- **Identity Verification**: Decentralized identity verification systems
- **Document Management**: Immutable document storage and verification
- **Payment Processing**: Automated payment processing with smart contracts

## 📋 Example Test Cases

### 1. **Token Swap Test Case**

```javascript
// Frontend test
const testTokenSwap = async () => {
  const response = await fetch('/api/process-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "Swap my tokens from Ethereum to Solana"
    })
  });
  
  const result = await response.json();
  console.log('Token swap result:', result);
};

// Expected Result:
// {
//   "response": "✅ Tokens swapped successfully! Your 1 tokens have been transferred from ethereum to solana. Transaction hash: 0x...",
//   "intent": "token_swap",
//   "confidence": 1,
//   "mettaQuery": "(swap-tokens (source-network ethereum) (target-network solana) (amount 1) (user-intent \"token_swap\"))",
//   "timestamp": "2024-01-01T00:00:00.000Z"
// }
```

### 2. **NFT Minting Test Case**

```javascript
const testNFTMint = async () => {
  const response = await fetch('/api/uagent/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'nft_mint',
      params: {
        nft_name: 'Test NFT',
        nft_description: 'A test NFT for demonstration'
      },
      user_id: 'test_user'
    })
  });
  
  const result = await response.json();
  console.log('NFT mint result:', result);
};

// Expected Result:
// {
//   "success": true,
//   "message": "🎨 NFT minted successfully! Your NFT 'Test NFT' has been created and added to your wallet. Token ID: 12345",
//   "data": {
//     "nft_name": "Test NFT",
//     "nft_description": "A test NFT for demonstration",
//     "token_id": 12345
//   },
//   "request_id": "req_1_1234567890"
// }
```

### 3. **Agentverse Deployment Test Case**

```javascript
const testAgentverseDeployment = async () => {
  const agentCode = `
from uagents import Agent

agent = Agent(name="TestAgent")

@agent.on_message()
async def handle_message(ctx, sender, msg):
    ctx.logger.info(f"Received: {msg}")
    await ctx.send(sender, "Hello from deployed agent!")
  `;

  const response = await fetch('/api/agentverse/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_code: agentCode })
  });
  
  const result = await response.json();
  console.log('Deployment result:', result);
};
```

### 4. **Fetch.ai Network Query Test Case**

```javascript
const testFetchNetworkQuery = async () => {
  const walletAddress = "fetch1..."; // Your Fetch.ai wallet address
  
  const response = await fetch(`/api/fetch/balance/${walletAddress}`);
  const result = await response.json();
  console.log('Fetch.ai balance:', result);
};

// Expected Result:
// {
//   "balances": [
//     {
//       "denom": "afet",
//       "amount": "1000000000000000000"
//     }
//   ]
// }
```

## 🔄 Integration Workflow

### 1. **User Interaction Flow**
1. User speaks/types request in frontend
2. Speech-to-text converts to text
3. NLU service extracts intent and entities
4. MeTTa service generates structured query
5. uAgent Bridge forwards request to Python uAgent
6. uAgent processes request autonomously
7. Response flows back through the system
8. User receives confirmation

### 2. **Agent Deployment Flow**
1. Develop agent using uAgents framework
2. Test agent locally
3. Deploy to Agentverse via API
4. Agent becomes available on Fetch.ai network
5. Other agents can discover and interact with it

### 3. **Cross-chain Operation Flow**
1. User requests cross-chain operation
2. uAgent identifies source and target chains
3. Agentverse provides bridge services
4. Fetch.ai network facilitates the transfer
5. ASI One provides additional interoperability (when available)
6. Operation completes and user is notified

## 🛠️ Development Commands

```bash
# Start the complete system
npm run dev

# Start only uAgent service
npm run agent

# Test uAgent integration
npm run test-agent

# Install Python dependencies
pip install -r requirements.txt

# Run uAgent tests
python test_uagent.py
```

## 📊 Monitoring & Analytics

The system includes comprehensive logging and monitoring:

- **uAgent Status**: Real-time connection status
- **Operation Metrics**: Success rates and response times
- **Network Health**: Fetch.ai network connectivity
- **Agent Performance**: Individual agent metrics

## 🔐 Security Considerations

- **API Key Management**: Secure storage of API keys
- **Agent Authentication**: Verified agent identities
- **Transaction Signing**: Secure transaction handling
- **Rate Limiting**: Protection against abuse
- **Audit Logging**: Complete operation history

## 🚀 Getting Started

1. **Clone and Setup**: Follow the main README installation steps
2. **Configure Environment**: Set up your `.env` file with API keys
3. **Install Dependencies**: Install both Node.js and Python dependencies
4. **Start Services**: Run `npm run dev` to start everything
5. **Test Integration**: Use the provided test cases to verify functionality
6. **Deploy Agents**: Use Agentverse API to deploy your agents
7. **Monitor Operations**: Use the monitoring endpoints to track performance

This integration transforms DecentraBot from a simple chatbot into a powerful, autonomous Web3 agent capable of complex operations across multiple blockchain networks!

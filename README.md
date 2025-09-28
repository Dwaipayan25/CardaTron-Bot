# CardaTron Project

CardaTron is a cross-chain atomic swap and agentic Web3 platform, enabling secure token swaps between Cardano, EVM, and Tron blockchains, with conversational AI integration for Web3 operations.

---

## 🏗️ Project Structure

```
Cardano/      # Cardano ↔ EVM atomic swap system
Chatbot/      # Agentic Web3 conversational AI agent
Tron/         # Tron swap contracts and frontend
```

---

## Cardano Module

Implements cross-chain atomic swaps (EVM ↔ Cardano) using Hash-Time-Locked Contracts (HTLCs), relayer services, and WebSocket notifications.

- **Backend**: Node.js API for order management, relayer, and monitoring
- **Contracts**: Smart contracts for EVM and Cardano
- **Frontend**: Next.js dashboard for swap operations

**Key Features:**
- Secure, decentralized swaps
- Relayer monitors both chains and coordinates atomic execution
- WebSocket notifications for swap status

**Quick Start:**
1. Install Node.js, PostgreSQL, and API keys
2. Clone repo & install dependencies
3. Set up `.env` files
4. Deploy contracts
5. Start backend & frontend

See `Cardano/README.md` for full API docs and setup instructions.

---

## Chatbot Module

Conversational AI agent for Web3 operations using speech and text.

- **Voice Interaction**: Speech-to-Text via Web Speech API
- **NLU & MeTTa Reasoning**: Converts user requests to blockchain actions
- **Mock Web3 API**: Simulated operations (token swaps, NFT minting, etc.)
- **Frontend**: React chat UI with voice input

**Quick Start:**
1. Clone repo & install dependencies
2. Start backend and frontend
3. Interact via browser at `http://localhost:3000`

See `Chatbot/README.md` for details and configuration.

---

## Tron Module

Implements swap contracts and frontend for Tron blockchain.

- **Contracts**: Hardhat-based smart contracts
- **Frontend**: Vite/React UI for Tron swaps

See `Tron/README.md` for usage and setup.

---

## 🛡️ Security & Monitoring

- OpenZeppelin libraries for contract security
- Timelock and safety deposit mechanisms
- Health checks and WebSocket notifications

---

## 🤝 Support & License

- MIT License
- For issues or contributions, use GitHub Issues or inline code comments

---

For detailed setup, API usage, and architecture, refer to the individual module READMEs.

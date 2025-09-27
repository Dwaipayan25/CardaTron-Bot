# Agentic Web3 Conversational AI Agent

A sophisticated conversational AI agent that enables users to interact with Web3 operations through natural language. The system uses Speech-to-Text, Natural Language Understanding (NLU), and MeTTa reasoning to process user requests and execute blockchain operations.

## 🌟 Features

- **Voice Interaction**: Speech-to-Text using Web Speech API
- **Natural Language Understanding**: Converts user speech/text to structured intents
- **MeTTa Reasoning Engine**: Processes intents using MeTTa query language
- **Web3 Operations**: Support for token swaps, NFT minting, transfers, and more
- **Modern UI**: Beautiful, responsive React frontend with real-time chat interface
- **Mock API**: Simulated Web3 operations for demonstration purposes

## 🚀 Supported Operations

- **Token Swaps**: "Swap my tokens from Ethereum to Solana"
- **NFT Minting**: "I want to mint an NFT"
- **Send Money**: "Help me send money to my friend"
- **Check Balance**: "What's my wallet balance?"
- **Stake Tokens**: "I want to stake my tokens"
- **Provide Liquidity**: "Add liquidity to a pool"

## 🏗️ Architecture

```
Frontend (React) → Backend (Express) → NLU Service → MeTTa Engine → Web3 Service
     ↓                    ↓              ↓            ↓            ↓
Voice Input → STT → Text → Intent → MeTTa Query → Mock API → Response
```

### Components

1. **Frontend**: React application with voice interaction and chat UI
2. **NLU Service**: Natural Language Understanding to extract intents and entities
3. **MeTTa Service**: Reasoning engine that converts intents to MeTTa queries
4. **Web3 Service**: Mock API for Web3 operations (easily replaceable with real APIs)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentic-web3-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the frontend (port 3000) and backend (port 5000) concurrently.

## 📱 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Click the microphone button to start voice input or type your request
3. Speak or type commands like:
   - "Swap my tokens from Ethereum to Solana"
   - "I want to mint an NFT"
   - "Help me send money to my friend"
   - "What's my wallet balance?"

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
```

### Adding Real Web3 APIs

To integrate with real Web3 APIs, replace the mock functions in `backend/services/web3Service.js` with actual API calls:

```javascript
// Example: Real API integration
async function realWeb3API(intent) {
  const { type, entities } = intent;
  
  switch (type) {
    case 'token_swap':
      return await executeTokenSwap(entities);
    case 'nft_mint':
      return await mintNFT(entities);
    // ... other operations
  }
}
```

## 🧠 MeTTa Query Examples

The system converts natural language to MeTTa queries:

```
User: "Swap my tokens from Ethereum to Solana"
MeTTa: (swap-tokens 
         (source-network ethereum)
         (target-network solana) 
         (amount 1.0)
         (user-intent "token_swap"))
```

## 🎨 UI Features

- **Real-time Chat Interface**: Modern chat UI with message bubbles
- **Voice Input**: Click-to-talk functionality with visual feedback
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Visual feedback during processing
- **Error Handling**: User-friendly error messages

## 🔮 Future Enhancements

- Integration with real Web3 APIs (Uniswap, OpenSea, etc.)
- Multi-language support
- Advanced voice commands
- Transaction history
- Portfolio management
- DeFi strategy recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for EthGlobal hackathon
- Uses MeTTa reasoning engine
- React and Express.js for the full-stack implementation


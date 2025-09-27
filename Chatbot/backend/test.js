// Simple test script to verify the backend services
const { processQuery } = require('./services/nluService');
const { executeMeTTaQuery } = require('./services/mettaService');
const { mockWeb3API } = require('./services/web3Service');

async function testServices() {
  console.log('🧪 Testing Agentic Web3 Chatbot Services...\n');

  const testQueries = [
    "Swap my tokens from Ethereum to Solana",
    "I want to mint an NFT",
    "Help me send money to my friend",
    "What's my wallet balance?",
    "I want to stake my tokens"
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Testing query: "${query}"`);
    console.log('─'.repeat(50));

    try {
      // Test NLU
      const intent = await processQuery(query);
      console.log('🎯 Intent:', intent.type);
      console.log('📊 Confidence:', intent.confidence);
      console.log('🏷️  Entities:', intent.entities);

      // Test MeTTa
      const mettaResult = executeMeTTaQuery(intent);
      console.log('🧠 MeTTa Query:', mettaResult.query);
      console.log('💭 Reasoning:', mettaResult.reasoning);

      // Test Web3 API
      const web3Result = await mockWeb3API(intent);
      console.log('🌐 Web3 Response:', web3Result.message);
      console.log('✅ Success:', web3Result.success);

    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('\n🎉 Testing completed!');
}

// Run tests
testServices().catch(console.error);


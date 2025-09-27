// Natural Language Understanding Service
// Converts user input to structured intents

const INTENT_PATTERNS = {
  token_swap: {
    keywords: ['swap', 'exchange', 'convert', 'trade', 'change', 'from', 'to'],
    tokens: ['token', 'coin', 'crypto', 'ethereum', 'solana', 'bitcoin', 'btc', 'eth', 'sol'],
    networks: ['ethereum', 'solana', 'polygon', 'arbitrum', 'optimism', 'bsc', 'binance'],
    confidence_threshold: 0.3
  },
  check_balance: {
    keywords: ['balance', 'check', 'show', 'display', 'how much', 'what\'s my', 'wallet'],
    tokens: ['balance', 'funds', 'tokens', 'coins', 'crypto', 'wallet'],
    confidence_threshold: 0.3
  },
};

function calculateIntentConfidence(text, intentPattern) {
  const lowerText = text.toLowerCase();
  let score = 0;
  let keywordMatches = 0;
  let tokenMatches = 0;
  let networkMatches = 0;

  // Check for keywords (higher weight)
  for (const keyword of intentPattern.keywords) {
    if (lowerText.includes(keyword)) {
      keywordMatches++;
      score += 2; // Higher weight for keywords
    }
  }

  // Check for token-related terms
  for (const token of intentPattern.tokens) {
    if (lowerText.includes(token)) {
      tokenMatches++;
      score += 1.5;
    }
  }

  // Check for network terms (for swaps)
  if (intentPattern.networks) {
    for (const network of intentPattern.networks) {
      if (lowerText.includes(network)) {
        networkMatches++;
        score += 1;
      }
    }
  }

  // Calculate confidence based on matches
  const totalMatches = keywordMatches + tokenMatches + networkMatches;
  
  if (totalMatches === 0) return 0;
  
  // Base confidence from score
  let confidence = score / (intentPattern.keywords.length * 2 + intentPattern.tokens.length * 1.5 + (intentPattern.networks?.length || 0));
  
  // Boost confidence for multiple matches
  if (keywordMatches > 0) confidence += 0.2;
  if (tokenMatches > 0) confidence += 0.1;
  if (networkMatches > 0) confidence += 0.1;
  
  // Special boosts for specific patterns
  if (intentPattern.keywords.some(k => lowerText.includes(k)) && 
      intentPattern.tokens.some(t => lowerText.includes(t))) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0); // Cap at 1.0
}

function extractEntities(text) {
  const lowerText = text.toLowerCase();
  const entities = {
    source_network: null,
    target_network: null,
    token_amount: null,
    recipient_address: null,
    nft_name: null,
    nft_description: null
  };

  // Extract networks
  const networks = ['ethereum', 'solana', 'polygon', 'arbitrum', 'optimism', 'bsc', 'binance'];
  const foundNetworks = networks.filter(network => lowerText.includes(network));
  
  if (foundNetworks.length >= 2) {
    entities.source_network = foundNetworks[0];
    entities.target_network = foundNetworks[1];
  } else if (foundNetworks.length === 1) {
    entities.target_network = foundNetworks[0];
  }

  // Extract token amount (improved regex for numbers)
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:tokens?|coins?|eth|btc|sol|tokens|coins)?/i);
  if (amountMatch) {
    entities.token_amount = parseFloat(amountMatch[1]);
  } else {
    // Default amount if no specific amount mentioned
    entities.token_amount = 1.0;
  }

  // Extract recipient address (simple pattern)
  const addressMatch = text.match(/0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}/);
  if (addressMatch) {
    entities.recipient_address = addressMatch[0];
  }

  // Extract NFT details
  if (lowerText.includes('nft') || lowerText.includes('mint')) {
    const nameMatch = text.match(/nft\s+(?:called|named|titled)\s+["']?([^"']+)["']?/i);
    if (nameMatch) {
      entities.nft_name = nameMatch[1];
    } else {
      entities.nft_name = "My NFT";
    }
    entities.nft_description = "A unique digital collectible";
  }

  // Set default values for better responses
  if (!entities.recipient_address && (lowerText.includes('friend') || lowerText.includes('send'))) {
    entities.recipient_address = "0x1234...5678";
  }

  return entities;
}

async function processQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Calculate confidence for each intent
  const intentScores = {};
  
  for (const [intentType, pattern] of Object.entries(INTENT_PATTERNS)) {
    const confidence = calculateIntentConfidence(query, pattern);
    if (confidence >= pattern.confidence_threshold) {
      intentScores[intentType] = confidence;
    }
  }

  // Find the best intent
  const bestIntent = Object.keys(intentScores).reduce((a, b) => 
    intentScores[a] > intentScores[b] ? a : b, null
  );

  // Extract entities
  const entities = extractEntities(query);

  if (bestIntent) {
    return {
      type: bestIntent,
      confidence: intentScores[bestIntent],
      entities: entities,
      original_query: query
    };
  } else {
    // Default to general help if no intent is detected
    return {
      type: 'general_help',
      confidence: 0.3,
      entities: entities,
      original_query: query
    };
  }
}

module.exports = {
  processQuery
};

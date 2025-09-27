// MeTTa Reasoning Service
// Converts intents to MeTTa queries and provides reasoning

const KNOWLEDGE_BASE = {
  token_swap: {
    description: "Swap tokens between different blockchain networks",
    requirements: ["source_network", "target_network", "token_amount"],
    metta_template: `
      (swap-tokens 
        (source-network $source_network)
        (target-network $target_network) 
        (amount $token_amount)
        (user-intent "token_swap")
      )
    `,
    reasoning: "User wants to exchange tokens from one blockchain to another. This requires cross-chain bridge functionality."
  },
  
  check_balance: {
    description: "Check wallet balance",
    requirements: [],
    metta_template: `
      (check-balance
        (user-intent "check_balance")
      )
    `,
    reasoning: "User wants to check their current wallet balance across different tokens."
  },

  general_help: {
    description: "General help and information",
    requirements: [],
    metta_template: `
      (provide-help
        (user-intent "general_help")
        (query $original_query)
      )
    `,
    reasoning: "User needs general assistance or information about Web3 operations."
  }
};

function substituteVariables(template, entities) {
  let query = template;
  
  // Replace variables with actual values
  for (const [key, value] of Object.entries(entities)) {
    if (value !== null && value !== undefined) {
      const placeholder = `$${key}`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      query = query.replace(regex, value);
    }
  }
  
  // Remove any remaining undefined variables and clean up
  query = query.replace(/\$[a-zA-Z_]+/g, 'null');
  query = query.replace(/\s+/g, ' ').trim();
  
  return query;
}

function executeMeTTaQuery(intent) {
  const { type, entities, original_query } = intent;
  
  const knowledge = KNOWLEDGE_BASE[type];
  if (!knowledge) {
    return {
      query: `(unknown-intent "${type}")`,
      reasoning: "Unknown intent type detected",
      requirements: []
    };
  }

  // Generate MeTTa query
  const mettaQuery = substituteVariables(knowledge.metta_template, {
    ...entities,
    original_query: original_query
  });

  return {
    query: mettaQuery,
    reasoning: knowledge.reasoning,
    description: knowledge.description,
    requirements: knowledge.requirements,
    entities_used: entities
  };
}

function validateMeTTaQuery(mettaQuery) {
  // Basic validation - check for balanced parentheses
  const openParens = (mettaQuery.match(/\(/g) || []).length;
  const closeParens = (mettaQuery.match(/\)/g) || []).length;
  
  if (openParens !== closeParens) {
    throw new Error("Invalid MeTTa query: unbalanced parentheses");
  }
  
  return true;
}

function explainMeTTaQuery(mettaQuery) {
  // Extract the main operation from the query
  const operationMatch = mettaQuery.match(/\(([a-z-]+)/);
  const operation = operationMatch ? operationMatch[1] : 'unknown';
  
  const explanations = {
    'swap-tokens': 'This query will initiate a cross-chain token swap operation',
    'check-balance': 'This query will retrieve the current wallet balance',
    'provide-help': 'This query will provide general assistance'
  };
  
  return explanations[operation] || 'This query will execute a Web3 operation';
}

module.exports = {
  executeMeTTaQuery,
  validateMeTTaQuery,
  explainMeTTaQuery,
  KNOWLEDGE_BASE
};

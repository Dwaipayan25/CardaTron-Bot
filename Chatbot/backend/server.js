const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { processQuery } = require('./services/nluService');
const { executeMeTTaQuery } = require('./services/mettaService');
const { mockWeb3API } = require('./services/web3Service');
const UAgentBridge = require('./services/uagentBridge');

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE = 'http://127.0.0.1:8002'

// Initialize uAgent Bridge
const uagentBridge = new UAgentBridge();
const messages = []

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start uAgent service on server startup and wait for it
(async () => {
  try {
    await uagentBridge.startUAgentService();
  } catch (err) {
    console.error("Failed to start uAgent service:", err);
  }
})();

// -----------------------------
// Routes
// -----------------------------

// Natural language query endpoint
app.post('/api/process-query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });// Basic requirement
    console.log('Processing query:', query);// logging the query

    const messages = [
      {
        role: "user", // must match your Pydantic Role enum
        content: query,
        tool_calls: null
      }
    ];

    const resp = await fetch(`${API_BASE}/api/chat`,{
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages, stream: false })

    })// calling ASI:One LLM
//     const text = await res.text();
// console.log("Raw ASI One response:", text);

// const data = JSON.parse(text);
    // Parse JSON
    const data = await resp.json();

    // Access the ChatResponse structure
    console.log("Role:", data.message.role);
    console.log("Content:", data.message.content);


    // // Step 1: NLU - Convert natural language to intent
    // const intent = await processQuery(query);
    // console.log('Detected intent:', intent);

    // // Step 2: MeTTa reasoning
    // const mettaQuery = executeMeTTaQuery(intent);
    // console.log('MeTTa query:', mettaQuery);

    // // Step 3: Execute Web3 operation via uAgent
    // let result;
    // try {
    //   result = await uagentBridge.sendRequestToUAgent(intent.type, intent.entities, 'web_user');
    //   console.log('uAgent Web3 operation result:', result);
    // } catch (uagentError) {
    //   console.log('uAgent not available');
    // }
    // app.post('/uagent/request', async (req, res) => {
    //   const { type, entities, userId } = req.body;
    
    //   try {
    //     const result = await uagentBridge.sendRequestToUAgent(type, entities, userId);
    //     res.json({ success: true, result });
    //   } catch (err) {
    //     console.error("uAgent error:", err);
    //     res.status(500).json({ success: false, error: err.message });
    //   }
    // });

    // res.json({
    //   response: result.message,
    //   intent: intent.type,
    //   confidence: intent.confidence,
    //   mettaQuery: mettaQuery,
    //   timestamp: new Date().toISOString()
    // });
    // console.log(res.json());
    // console.log(data.message.role)
    res.json({
      role: data.message.role,
      content: data.message.content
    })
    // console.log({
    //   role: data.message.role,
    //   content: data.message.content
    // })

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Sorry, I encountered an error processing your request. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DecentraBot Backend with uAgent Integration',
    uagent_status: uagentBridge.isConnected ? 'connected' : 'disconnected'
  });
});

// uAgent endpoints
app.get('/api/uagent/status', (req, res) => {
  res.json({
    status: uagentBridge.isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/uagent/request', async (req, res) => {
  try {
    const { operation, params, user_id } = req.body;
    if (!operation) return res.status(400).json({ error: 'Operation is required' });

    const result = await uagentBridge.sendRequestToUAgent(operation, params, user_id);
    res.json(result);
  } catch (error) {
    console.error('uAgent request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Agentverse endpoints
app.post('/api/agentverse/deploy', async (req, res) => {
  try {
    const { agent_code } = req.body;
    if (!agent_code) return res.status(400).json({ error: 'Agent code is required' });

    const result = await uagentBridge.deployToAgentverse(agent_code);
    res.json(result);
  } catch (error) {
    console.error('Agentverse deploy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agentverse/status/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await uagentBridge.queryAgentverseStatus(agentId);
    res.json(result);
  } catch (error) {
    console.error('Agentverse status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch.ai network endpoints
app.get('/api/fetch/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await uagentBridge.queryFetchNetwork(address);
    res.json(result);
  } catch (error) {
    console.error('Fetch network error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fetch/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 10 } = req.query;
    const result = await uagentBridge.getFetchNetworkTransactions(address, limit);
    res.json(result);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ASI One (placeholder)
app.post('/api/asi/query', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await uagentBridge.queryASINetwork(query);
    res.json(result);
  } catch (error) {
    console.error('ASI query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Web3 AI Agent Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

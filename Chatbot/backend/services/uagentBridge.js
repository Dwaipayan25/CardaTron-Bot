// uAgent Bridge Service
// Connects Node.js backend with Python uAgent service via stdin/stdout

const { spawn } = require("child_process");
const axios = require("axios");

class UAgentBridge {
  constructor() {
    this.uagentProcess = null;
    this.isConnected = false;
    this.requestQueue = new Map();
    this.requestId = 0;
  }

  async startUAgentService() {
    return new Promise((resolve, reject) => {
      console.log("🔄 Starting uAgent service...");

      // Start Python uAgent service
      this.uagentProcess = spawn("python", ["uagent_service.py"], {
        cwd: __dirname + "/..",
        stdio: ["pipe", "pipe", "pipe"]
      });

      // Handle stdout from Python (agent responses + logs)
      this.uagentProcess.stdout.on("data", (data) => {
        try {
          const messages = data.toString().split("\n").filter(Boolean);
          for (const msg of messages) {
            let parsed;
            try {
              parsed = JSON.parse(msg); // Attempt to parse JSON
            } catch {
              console.log("uAgent Log:", msg); // Non-JSON logs
              continue;
            }

            if (parsed.request_id && this.requestQueue.has(parsed.request_id)) {
              const { resolve } = this.requestQueue.get(parsed.request_id);
              resolve(parsed);
              this.requestQueue.delete(parsed.request_id);
            } else {
              console.log("uAgent Message:", parsed);
            }
          }
        } catch (err) {
          console.error("uAgent stdout error:", err);
        }
      });

      // Handle stderr from Python
      this.uagentProcess.stderr.on("data", (data) => {
        console.error(`uAgent Error: ${data}`);
      });

      // Handle process exit
      this.uagentProcess.on("close", (code) => {
        console.log(`uAgent process exited with code ${code}`);
        this.isConnected = false;
      });

      // Give the Python agent time to boot up
      setTimeout(() => {
        this.isConnected = true;
        console.log("✅ uAgent service started successfully");
        resolve();
      }, 3000);
    });
  }

  async sendRequestToUAgent(operation, params, userId = "default_user") {
    return new Promise((resolve, reject) => {
      const requestId = `req_${++this.requestId}_${Date.now()}`;

      const request = {
        operation,
        params,
        user_id: userId,
        request_id: requestId
      };

      // Store resolver for later
      this.requestQueue.set(requestId, { resolve, reject });

      // Send JSON to Python agent via stdin
      if (this.uagentProcess && this.uagentProcess.stdin.writable) {
        const jsonStr = JSON.stringify(request) + "\n";
    
        // Print to console
        console.log("Sending JSON to python agent:", jsonStr);
    
        // Write to stdin
        this.uagentProcess.stdin.write(jsonStr);
    } else {
        return reject(new Error("Python uAgent process not running"));
    }
    

      // Timeout after 30s if no response
      setTimeout(() => {
        const pending = this.requestQueue.get(requestId);
        if (pending) {
          pending.reject(new Error("uAgent request timeout"));
          this.requestQueue.delete(requestId);
        }
      }, 5000);
    });
  }

  async stopUAgentService() {
    if (this.uagentProcess) {
      console.log("🛑 Stopping uAgent service...");
      this.uagentProcess.kill();
      this.uagentProcess = null;
      this.isConnected = false;
    }
  }

  // ---------------------------
  // Agentverse API integration
  // ---------------------------

  async deployToAgentverse(agentCode) {
    try {
      const response = await axios.post(
        "https://api.agentverse.ai/v1/agents/deploy",
        {
          agent_code: agentCode,
          network: "fetchai-mainnet"
        },
        {
          headers: {
            Authorization: `Bearer ${
              process.env.AGENTVERSE_API_KEY || "your_api_key"
            }`,
            "Content-Type": "application/json"
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Agentverse deployment error:", error.message);
      throw error;
    }
  }

  async queryAgentverseStatus(agentId) {
    try {
      const response = await axios.get(
        `https://api.agentverse.ai/v1/agents/${agentId}/status`,
        {
          headers: {
            Authorization: `Bearer ${
              process.env.AGENTVERSE_API_KEY || "your_api_key"
            }`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Agentverse status query error:", error.message);
      throw error;
    }
  }

  // ---------------------------
  // Fetch.ai Network integration
  // ---------------------------

  async queryFetchNetwork(walletAddress) {
    try {
      const response = await axios.get(
        `https://rest-fetchhub.fetch.ai/cosmos/bank/v1beta1/balances/${walletAddress}`
      );
      return response.data;
    } catch (error) {
      console.error("Fetch.ai network query error:", error.message);
      throw error;
    }
  }

  async getFetchNetworkTransactions(walletAddress, limit = 10) {
    try {
      const response = await axios.get(
        `https://rest-fetchhub.fetch.ai/cosmos/tx/v1beta1/txs?events=transfer.recipient='${walletAddress}'&pagination.limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Fetch.ai transactions query error:", error.message);
      throw error;
    }
  }

  // ---------------------------
  // ASI One (future integration)
  // ---------------------------

  async queryASINetwork(query) {
    try {
      console.log("ASI One integration not yet available");
      return {
        success: false,
        message: "ASI One integration coming soon",
        data: null
      };
    } catch (error) {
      console.error("ASI One query error:", error.message);
      throw error;
    }
  }
}

module.exports = UAgentBridge;

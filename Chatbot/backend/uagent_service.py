import asyncio
from uagents import Agent, Context, Model
from typing import Dict, Any, Optional
import sys

# Force stdout to UTF-8
sys.stdout.reconfigure(encoding='utf-8')


class Web3Request(Model):
    operation: str
    params: Dict[str, Any]
    user_id: str
    request_id: str

class Web3Response(Model):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    transaction_hash: Optional[str] = None
    request_id: str

DECENTRABOT_ID = "agent1qv7m6tft07jqhhz7qfj83hsa735sqf243573flfd45lf7n60dn8zxlvl2gx"
# MAILBOX_URL = "https://agents.fetch.ai/mailbox/<your-local-mailbox-id>"

client = Agent(name="local_client", seed="local_client_seed", network="testnet", mailbox=True)

# Handler for incoming responses
@client.on_message(model=Web3Response)
async def handle_response(ctx: Context, sender: str, msg: Web3Response):
    print("[DEBUG] Received response from DecentraBot:", msg.message, msg.data)

@client.on_interval(period=10.0)
async def send_periodic_request(ctx: Context):
    req = Web3Request(
        operation="check_balance",
        params={},
        user_id="user123",
        request_id="req1"
    )
    print("[DEBUG] Sending request to DecentraBot...")
    await ctx.send(DECENTRABOT_ID, req)

async def send_request():
    req = Web3Request(
        operation="check_balance",
        params={},
        user_id="user123",
        request_id="req1"
    )
    print("[DEBUG] Sending request to DecentraBot...")
    await client.send(DECENTRABOT_ID, req)  # fire-and-forget



if __name__ == "__main__":
    # Run both sending and receiving
    client.run()

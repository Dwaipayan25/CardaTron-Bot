import os
import uuid
import requests
import json
import re
from typing import List, Literal, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
# from .chat_tools import mcp, initialize_mcp, shutdown_mcp
load_dotenv()

ASI_API_KEY = os.getenv("ASI_API_KEY")
BASE_URL = os.getenv("ASI_BASE_URL", "https://agentverse.ai/api/v1").rstrip("/")
MODEL = os.getenv("ASI_MODEL", "asi1-mini")
PORT = int(os.getenv("PORT", "8002"))
ENDPOINT = f"{BASE_URL}/chat/completions"
TIMEOUT = 90
# Updated system prompt to resemble OpenAI best model
system_prompt = f"""
You are a highly intelligent, helpful, and concise AI assistant.
- Always explain things step by step.
- Provide reasoning for answers.
- If a question is ambiguous, ask clarifying questions first.
- Keep the tone polite, professional, and friendly.
- When providing code, make it clear, tested, and minimal.
- Avoid filler words; be precise and informative.
- Also try to convert the following user request into a MeTTa intent: 
  Token swap
  Wallet Balance
- Use structured MeTTa syntax:
- Example 1: User: "Swap 5 ETH from Ethereum to BNB on Binance Smart Chain"
- MeTTa:
 (swap-tokens
 	 (source-network ethereum)
	 (target-network bnb) 
	 (token "ETH")
	 (amount 5))
- Example 2:
 User: "What is my wallet balance?"
- MeTTa:
 (check-balance
  (network "Etherium")
  (token "ETH")
  (wallet "0xUSER_WALLET_ADDRESS"))

- Now convert the following user request into a MeTTa intent, provided that it is either a token swap or a wallet balance check:
"""


if not ASI_API_KEY:
	raise RuntimeError("ASI_API_KEY not set. Add it to .env or export it in the shell.")

app = FastAPI(title="basic_chat_bot API")

# @app.on_event("startup")
# async def startup_event():
# 	"""Initialize MCP server on startup"""
# 	await initialize_mcp()

# @app.on_event("shutdown")
# async def shutdown_event():
# 	"""Shutdown MCP server on shutdown"""
# 	await shutdown_mcp()

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False,
    allow_methods=["*"], allow_headers=["*"],
)

Role = Literal["system", "user", "assistant"]

class ChatMessage(BaseModel):
	role: Role
	content: str
	tool_calls: Optional[List[Dict[str, Any]]] = None

class ChatRequest(BaseModel):
	messages: List[ChatMessage]
	stream: bool = False

class ChatResponse(BaseModel):
	message: ChatMessage

@app.get("/health")
async def health() -> Dict[str, Any]:
	return {"status": "ok", "model": MODEL, "endpoint": ENDPOINT}

@app.get("/api/tools")
async def get_tools() -> Dict[str, Any]:
	"""Get available tools"""
	return {
		# "tools": mcp.get_tools_list(),
		# "count": len(mcp.get_tools_list())
	}

def detect_tool_usage(message_content: str) -> Optional[Dict[str, Any]]:
	"""Detect if the message is asking for a tool operation"""
	content_lower = message_content.lower()
	
	# Check for "save data" patterns
	if any(phrase in content_lower for phrase in ["save data", "store data", "save file", "create file"]):
		# Extract length if specified
		length_match = re.search(r"(\d+)\s*(?:characters?|chars?)", content_lower)
		length = int(length_match.group(1)) if length_match else 100
		
		return {
			"tool_name": "store_data",
			"arguments": {"length": length}
		}
	
	# Look for sum/addition patterns
	sum_patterns = [
		r"sum\s+of\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)",
		r"add\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)",
		r"(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)",
		r"what\s+is\s+(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)",
		r"calculate\s+(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)"
	]
	
	for pattern in sum_patterns:
		match = re.search(pattern, content_lower)
		if match:
			try:
				a = float(match.group(1))
				b = float(match.group(2))
				return {
					"tool_name": "sum_two_numbers",
					"arguments": {"a": a, "b": b}
				}
			except (ValueError, IndexError):
				continue
	
	return None

# @app.post("/api/chat", response_model=ChatResponse)
@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
	# Check if the last user message requires a tool
	# last_message = req.messages[-1] if req.messages else None
	# tool_usage = None
	
	# if last_message and last_message.role == "user":
	# 	tool_usage = detect_tool_usage(last_message.content)
	
	# If tool usage detected, call MCP server
	# if tool_usage:
	# 	try:
	# 		# result = await mcp.call_tool(tool_usage["tool_name"], tool_usage["arguments"])
	# 		# if result["success"]:
	# 		# 	return ChatResponse(
	# 		# 		message=ChatMessage(
	# 		# 			role="assistant", 
	# 		# 			content=result["result"]
	# 		# 		)
	# 		# 	)
	# 		# Prepare payload
	# 		intent = {
	# 			"type": tool_usage["tool_name"], 
	# 			"entities": tool_usage["arguments"], 
	# 			"userId": "web_user"
	# 		}
	# 		response = requests.post("http://localhost:5000/uagent/request", json=intent, timeout=30)
	# 		response.raise_for_status()
	# 		result = response.json()

	# 		if result.get("success"):
	# 			return ChatResponse(
	# 				message=ChatMessage(
	# 					role="assistant",
	# 					content=f"uAgent Result: {result['result']}"
	# 				)
	# 			)
	# 		else:
	# 			return ChatResponse(
	# 				message=ChatMessage(
	# 					role="assistant", 
	# 					content=f"Error: {result['error']}"
	# 				)
	# 			)
	# 	except Exception as e:
	# 		return ChatResponse(
	# 			message=ChatMessage(
	# 				role="assistant", 
	# 				content=f"Tool execution error: {str(e)}"
	# 			)
	# 		)
	
	# Regular chat flow - send to ASI
	print(req.messages)
	messages = [{"role": "system", "content": system_prompt}]
	for m in req.messages:
		msg_dict = {"role": m.role, "content": m.content}
		if m.tool_calls:
			msg_dict["tool_calls"] = m.tool_calls
		messages.append(msg_dict)
	
	session_id = str(uuid.uuid4())
	headers = {
		"Authorization": f"Bearer {ASI_API_KEY}",
		"x-session-id": session_id,
		"Content-Type": "application/json",
	}
	payload = {
		"model": MODEL,
		"messages": messages,
		"stream": False,
	}
	try:
		resp = requests.post(ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
		resp.raise_for_status()
		data = resp.json()
		print(data)
		assistant_text = data["choices"][0]["message"]["content"]
		
		return ChatResponse(message=ChatMessage(role="assistant", content=assistant_text))
	except requests.HTTPError as e:
		raise HTTPException(status_code=resp.status_code, detail=resp.text)
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))

import os, uuid, json, requests, sys, readline
import time
from dotenv import load_dotenv

# Load environment
load_dotenv()

API_KEY = os.getenv("ASI_API_KEY")
BASE_URL = os.getenv("ASI_BASE_URL", "https://agentverse.ai/api/v1")
MODEL = os.getenv("ASI_MODEL", "asi1-fast-agentic")
TIMEOUT = 90  # seconds

if not API_KEY:
	raise RuntimeError("ASI_API_KEY not set. Export it or add it to .env")

ENDPOINT = f"{BASE_URL.rstrip('/')}/chat/completions"

# In-memory session management
SESSION_MAP: dict[str, str] = {}

def get_session_id(conv_id: str) -> str:
	"""Return existing session UUID for this conversation or create a new one."""
	sid = SESSION_MAP.get(conv_id)
	if sid is None:
		sid = str(uuid.uuid4())
		SESSION_MAP[conv_id] = sid
	return sid

def ask(conv_id: str, messages: list[dict], *, stream: bool = False) -> str:
	"""Send messages list to asi1-agentic; return assistant reply."""
	session_id = get_session_id(conv_id)
	print(f"[session] Using session-id: {session_id}")

	headers = {
		"Authorization": f"Bearer {API_KEY}",
		"x-session-id": session_id,
		"Content-Type": "application/json",
	}
	
	payload = {
		"model": MODEL,
		"messages": messages,
		"stream": stream,
	}

	if not stream:
		resp = requests.post(ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
		resp.raise_for_status()
		return resp.json()["choices"][0]["message"]["content"]

	# Streaming implementation
	with requests.post(ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT, stream=True) as resp:
		resp.raise_for_status()
		full_text = ""
		for line in resp.iter_lines(decode_unicode=True):
			if not line or not line.startswith("data: "):
				continue
			line = line[len("data: ") :]
			if line == "[DONE]":
				break
			try:
				chunk = json.loads(line)
				choices = chunk.get("choices")
				if choices and "content" in choices[0].get("delta", {}):
					token = choices[0]["delta"]["content"]
					sys.stdout.write(token)
					sys.stdout.flush()
					full_text += token
			except json.JSONDecodeError:
				continue
		print()
		return full_text

# Simple usage example - agent will be called from Agentverse marketplace
conv_id = str(uuid.uuid4())
messages = [{"role": "user", "content": "Best agent in agentverse"}]
reply = ask(conv_id, messages, stream=True)
print(f"Assistant: {reply}")
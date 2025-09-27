"""
Simple chat tools for testing MCP integration
"""

from typing import Dict, Any
from store_data import store_tool

class SimpleTool:
    """Simple tool class for basic operations"""
    
    def __init__(self):
        self.tools = {
            "sum_two_numbers": {
                "name": "sum_two_numbers",
                "description": "Add two numbers together and return the result"
            },
            "store_data": {
                "name": "store_data", 
                "description": "Save random text data to a file"
            }
        }
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a tool with given arguments"""
        if tool_name == "sum_two_numbers":
            try:
                a = float(arguments.get("a", 0))
                b = float(arguments.get("b", 0))
                result = a + b
                return {
                    "success": True,
                    "result": f"The difference of {a} and {b} is {result}"
                }
            except (ValueError, TypeError) as e:
                return {
                    "success": False,
                    "error": f"Invalid arguments: {e}"
                }
        elif tool_name == "store_data":
            return await store_tool.call_tool(tool_name, arguments)
        
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}"
        }
    
    def get_tools_list(self):
        """Get list of available tools"""
        return list(self.tools.values())

# Global tool instance
mcp = SimpleTool()

async def initialize_mcp():
    """Initialize MCP server (no-op for simple tool)"""
    pass

async def shutdown_mcp():
    """Shutdown MCP server (no-op for simple tool)"""
    pass

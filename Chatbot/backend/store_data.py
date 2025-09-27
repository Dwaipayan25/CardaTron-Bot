"""
Store data tool for saving random text to files
"""

import os
import random
import string
from datetime import datetime
from typing import Dict, Any

class StoreDataTool:
    """Tool for storing random data to files"""
    
    def __init__(self):
        self.name = "store_data"
        self.description = "Save random text data to a file in the current directory"
    
    def generate_random_text(self, length: int = 100) -> str:
        """Generate random text of specified length"""
        letters = string.ascii_letters + string.digits + " \n"
        return ''.join(random.choice(letters) for _ in range(length))
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call the store data tool"""
        if tool_name == "store_data":
            try:
                # Generate filename with timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"stored_data_{timestamp}.txt"
                
                # Generate random text
                text_length = arguments.get("length", 100)
                random_text = self.generate_random_text(text_length)
                
                # Add header with timestamp
                content = f"Stored Data - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                content += "=" * 50 + "\n"
                content += random_text + "\n"
                content += "=" * 50 + "\n"
                content += f"End of file - {filename}\n"
                
                # Write to file
                filepath = os.path.join(os.getcwd(), filename)
                with open(filepath, 'w') as f:
                    f.write(content)
                
                return {
                    "success": True,
                    "result": f"Data successfully saved to file: {filename}\nFile path: {filepath}\nText length: {text_length} characters"
                }
                
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Failed to save data: {str(e)}"
                }
        
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}"
        }

# Global tool instance
store_tool = StoreDataTool()

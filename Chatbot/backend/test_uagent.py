"""
Test cases for uAgent integration
"""

import asyncio
import unittest
from uagent_service import DecentraBotService, Web3Request, Web3Response, AgentverseManager, AgentverseConfig

class TestUAgentIntegration(unittest.TestCase):
    """Test cases for uAgent functionality"""
    
    def setUp(self):
        """Setup test environment"""
        self.service = DecentraBotService()
        self.agentverse_config = AgentverseConfig()
        self.agentverse_manager = AgentverseManager(self.agentverse_config)
    
    def test_token_swap_request(self):
        """Test token swap operation"""
        async def run_test():
            request = Web3Request(
                operation="token_swap",
                params={
                    "source_network": "ethereum",
                    "target_network": "solana",
                    "amount": 1.5
                },
                user_id="test_user",
                request_id="test_req_001"
            )
            
            response = await self.service.process_web3_operation(request)
            
            # Assertions
            self.assertIsInstance(response, Web3Response)
            self.assertTrue(response.success)
            self.assertIn("Tokens swapped successfully", response.message)
            self.assertIsNotNone(response.transaction_hash)
            self.assertEqual(response.request_id, "test_req_001")
            
            return response
        
        # Run the async test
        response = asyncio.run(run_test())
        print(f"Token swap test passed: {response.message}")
    
    def test_nft_mint_request(self):
        """Test NFT minting operation"""
        async def run_test():
            request = Web3Request(
                operation="nft_mint",
                params={
                    "nft_name": "Test NFT",
                    "nft_description": "A test NFT for unit testing"
                },
                user_id="test_user",
                request_id="test_req_002"
            )
            
            response = await self.service.process_web3_operation(request)
            
            # Assertions
            self.assertIsInstance(response, Web3Response)
            self.assertTrue(response.success)
            self.assertIn("NFT minted successfully", response.message)
            self.assertIsNotNone(response.data)
            self.assertEqual(response.data["nft_name"], "Test NFT")
            
            return response
        
        response = asyncio.run(run_test())
        print(f"NFT mint test passed: {response.message}")
    
    def test_send_money_request(self):
        """Test money transfer operation"""
        async def run_test():
            request = Web3Request(
                operation="send_money",
                params={
                    "recipient_address": "0x1234567890abcdef1234567890abcdef12345678",
                    "amount": 2.5
                },
                user_id="test_user",
                request_id="test_req_003"
            )
            
            response = await self.service.process_web3_operation(request)
            
            # Assertions
            self.assertIsInstance(response, Web3Response)
            self.assertTrue(response.success)
            self.assertIn("Transaction successful", response.message)
            self.assertIsNotNone(response.transaction_hash)
            
            return response
        
        response = asyncio.run(run_test())
        print(f"Send money test passed: {response.message}")
    
    def test_check_balance_request(self):
        """Test balance checking operation"""
        async def run_test():
            request = Web3Request(
                operation="check_balance",
                params={},
                user_id="test_user",
                request_id="test_req_004"
            )
            
            response = await self.service.process_web3_operation(request)
            
            # Assertions
            self.assertIsInstance(response, Web3Response)
            self.assertTrue(response.success)
            self.assertIn("Your current balance", response.message)
            self.assertIsNotNone(response.data)
            
            return response
        
        response = asyncio.run(run_test())
        print(f"Check balance test passed: {response.message}")
    
    def test_stake_tokens_request(self):
        """Test token staking operation"""
        async def run_test():
            request = Web3Request(
                operation="stake_tokens",
                params={
                    "amount": 10.0
                },
                user_id="test_user",
                request_id="test_req_005"
            )
            
            response = await self.service.process_web3_operation(request)
            
            # Assertions
            self.assertIsInstance(response, Web3Response)
            self.assertTrue(response.success)
            self.assertIn("Staking successful", response.message)
            self.assertIsNotNone(response.transaction_hash)
            
            return response
        
        response = asyncio.run(run_test())
        print(f"Stake tokens test passed: {response.message}")
    
    def test_provide_liquidity_request(self):
        """Test liquidity provision operation"""
        async def run_test():
            request = Web3Request(
                operation="provide_liquidity",
                params={
                    "amount": 5.0
                },
                user_id="test_user",
                request_id="test_req_006"
            )
            
            response = await self.service.process_web3_operation(request)
            
            # Assertions
            self.assertIsInstance(response, Web3Response)
            self.assertTrue(response.success)
            self.assertIn("Liquidity provided successfully", response.message)
            self.assertIsNotNone(response.transaction_hash)
            
            return response
        
        response = asyncio.run(run_test())
        print(f"Provide liquidity test passed: {response.message}")
    
    def test_unknown_operation(self):
        """Test handling of unknown operations"""
        async def run_test():
            request = Web3Request(
                operation="unknown_operation",
                params={},
                user_id="test_user",
                request_id="test_req_007"
            )
            
            response = await self.service.process_web3_operation(request)
            
            # Assertions
            self.assertIsInstance(response, Web3Response)
            self.assertFalse(response.success)
            self.assertIn("Unknown operation", response.message)
            
            return response
        
        response = asyncio.run(run_test())
        print(f"Unknown operation test passed: {response.message}")
    
    def test_agentverse_config(self):
        """Test Agentverse configuration"""
        self.assertIsNotNone(self.agentverse_config.api_base)
        self.assertIsNotNone(self.agentverse_config.network)
        print("Agentverse config test passed")

# Integration test scenarios
class TestIntegrationScenarios(unittest.TestCase):
    """Integration test scenarios for complete workflows"""
    
    def test_complete_token_swap_workflow(self):
        """Test complete token swap workflow"""
        async def run_workflow():
            service = DecentraBotService()
            
            # Step 1: User requests token swap
            request = Web3Request(
                operation="token_swap",
                params={
                    "source_network": "ethereum",
                    "target_network": "solana",
                    "amount": 1.0
                },
                user_id="integration_test_user",
                request_id="integration_req_001"
            )
            
            # Step 2: Process the request
            response = await service.process_web3_operation(request)
            
            # Step 3: Verify response
            self.assertTrue(response.success)
            self.assertIn("swapped successfully", response.message.lower())
            
            return response
        
        response = asyncio.run(run_workflow())
        print(f"Complete token swap workflow test passed")
    
    def test_complete_nft_creation_workflow(self):
        """Test complete NFT creation workflow"""
        async def run_workflow():
            service = DecentraBotService()
            
            # Step 1: User requests NFT minting
            request = Web3Request(
                operation="nft_mint",
                params={
                    "nft_name": "Integration Test NFT",
                    "nft_description": "Created during integration testing"
                },
                user_id="integration_test_user",
                request_id="integration_req_002"
            )
            
            # Step 2: Process the request
            response = await service.process_web3_operation(request)
            
            # Step 3: Verify response
            self.assertTrue(response.success)
            self.assertIn("nft minted successfully", response.message.lower())
            
            return response
        
        response = asyncio.run(run_workflow())
        print(f"Complete NFT creation workflow test passed")

# Performance tests
class TestPerformance(unittest.TestCase):
    """Performance tests for uAgent operations"""
    
    def test_concurrent_requests(self):
        """Test handling multiple concurrent requests"""
        async def run_concurrent_test():
            service = DecentraBotService()
            
            # Create multiple concurrent requests
            requests = [
                Web3Request(
                    operation="check_balance",
                    params={},
                    user_id=f"user_{i}",
                    request_id=f"concurrent_req_{i}"
                ) for i in range(5)
            ]
            
            # Process all requests concurrently
            responses = await asyncio.gather(*[
                service.process_web3_operation(req) for req in requests
            ])
            
            # Verify all responses
            for response in responses:
                self.assertTrue(response.success)
                self.assertIn("balance", response.message.lower())
            
            return responses
        
        responses = asyncio.run(run_concurrent_test())
        print(f"Concurrent requests test passed: {len(responses)} responses processed")

if __name__ == '__main__':
    print("Running uAgent Integration Tests...")
    print("=" * 50)
    
    # Run unit tests
    unittest.main(verbosity=2, exit=False)
    
    print("\n All uAgent integration tests completed!")
    print("\n Test Summary:")
    print("- Token swap operations ")
    print("- NFT minting operations ")
    print("- Money transfer operations ")
    print("- Balance checking operations ")
    print("- Token staking operations ")
    print("- Liquidity provision operations ")
    print("- Error handling ")
    print("- Integration workflows ")
    print("- Performance tests ")

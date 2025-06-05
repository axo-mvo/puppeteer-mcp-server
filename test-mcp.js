#!/usr/bin/env node

const BASE_URL = process.env.BASE_URL || 'https://puppeteer-mcp-server.vercel.app';

async function testMCPEndpoint() {
  console.log('🧪 Testing MCP Endpoint...\n');

  // Test 1: Initialize
  console.log('1. Testing initialization...');
  try {
    const response = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      })
    });
    
    const result = await response.json();
    console.log('✅ Initialize response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Initialize failed:', error.message);
  }

  // Test 2: List tools
  console.log('\n2. Testing tools list...');
  try {
    const response = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      })
    });
    
    const result = await response.json();
    console.log('✅ Tools list response:');
    result.result?.tools?.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
  } catch (error) {
    console.error('❌ Tools list failed:', error.message);
  }

  // Test 3: GET endpoint info
  console.log('\n3. Testing GET endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/mcp`);
    const result = await response.json();
    console.log('✅ GET endpoint response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ GET endpoint failed:', error.message);
  }

  console.log('\n🎉 MCP endpoint tests completed!');
}

if (require.main === module) {
  testMCPEndpoint().catch(console.error);
}

module.exports = { testMCPEndpoint }; 
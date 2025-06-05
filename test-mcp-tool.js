#!/usr/bin/env node

const BASE_URL = process.env.BASE_URL || 'https://puppeteer-mcp-server.vercel.app';

async function testMCPTool() {
  console.log('🧪 Testing MCP Tool Execution...\n');

  console.log('Testing take_screenshot tool...');
  try {
    const response = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'take_screenshot',
          arguments: {
            url: 'https://example.com',
            fullPage: false,
            viewport: { width: 800, height: 600 }
          }
        }
      })
    });
    
    const result = await response.json();
    
    if (result.error) {
      console.error('❌ Tool execution failed:', result.error);
    } else {
      console.log('✅ Tool executed successfully!');
      console.log('Result type:', result.result?.content?.[0]?.type);
      console.log('MIME type:', result.result?.content?.[0]?.mimeType);
      console.log('Description:', result.result?.content?.[0]?.description);
      console.log('Data length:', result.result?.content?.[0]?.data?.length, 'characters');
    }
  } catch (error) {
    console.error('❌ Tool test failed:', error.message);
  }

  console.log('\n🎉 MCP tool test completed!');
}

if (require.main === module) {
  testMCPTool().catch(console.error);
}

module.exports = { testMCPTool }; 
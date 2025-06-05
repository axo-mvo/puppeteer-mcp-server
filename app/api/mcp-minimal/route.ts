import { NextRequest, NextResponse } from 'next/server';

// Ultra-minimal MCP implementation for ChatGPT validation testing
interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

// Minimal tools - no actual web scraping, just mock responses
const MINIMAL_TOOLS = [
  {
    name: 'search',
    description: 'Search for information (demo implementation)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'retrieve',
    description: 'Retrieve information (demo implementation)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Information ID to retrieve'
        }
      },
      required: ['id']
    }
  }
];

async function handleMinimalRequest(request: MCPRequest): Promise<MCPResponse> {
  const { id, method, params } = request;
  
  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'minimal-demo-server',
              version: '1.0.0',
              description: 'Minimal demo MCP server for validation testing'
            }
          }
        };
        
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: MINIMAL_TOOLS }
        };
        
      case 'tools/call':
        const { name, arguments: args } = params;
        
        if (name === 'search') {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `Search results for: ${args.query}\n\nThis is a demo implementation. In a real server, this would return actual search results.`
              }]
            }
          };
        }
        
        if (name === 'retrieve') {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `Retrieved information for ID: ${args.id}\n\nThis is a demo implementation. In a real server, this would return actual retrieved data.`
              }]
            }
          };
        }
        
        throw new Error(`Unknown tool: ${name}`);
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const mcpRequest: MCPRequest = await request.json();
    const response = await handleMinimalRequest(mcpRequest);
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error'
      }
    }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'Minimal Demo MCP Server',
    description: 'Ultra-minimal MCP server for ChatGPT validation testing',
    version: '1.0.0',
    tools: ['search', 'retrieve'],
    note: 'This is a demo server with mock responses for validation testing'
  });
} 
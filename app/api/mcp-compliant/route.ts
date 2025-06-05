import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// MCP Protocol Types
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
    data?: any;
  };
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// ChatGPT-Compliant Tools (only 'search' and 'retrieve' allowed)
const COMPLIANT_TOOLS: MCPTool[] = [
  {
    name: 'search',
    description: 'Search for content on approved websites by taking screenshots and extracting text',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query or website URL from approved domains'
        },
        mode: {
          type: 'string',
          enum: ['screenshot', 'text'],
          description: 'Type of content to retrieve (screenshot or text)',
          default: 'text'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'retrieve',
    description: 'Retrieve specific content from approved websites',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL from approved domains to retrieve content from'
        },
        content_type: {
          type: 'string',
          enum: ['text', 'html', 'screenshot'],
          description: 'Type of content to retrieve',
          default: 'text'
        },
        selector: {
          type: 'string',
          description: 'CSS selector for specific content (optional)'
        }
      },
      required: ['url']
    }
  }
];

// Approved domains for security (whitelist approach)
const APPROVED_DOMAINS = [
  'example.com',
  'httpbin.org',
  'jsonplaceholder.typicode.com',
  'wikipedia.org',
  'en.wikipedia.org'
];

// Authentication check
function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.MCP_AUTH_TOKEN;
  
  // If no auth token is set in environment, allow access (for demo purposes)
  if (!expectedToken) {
    return true;
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === expectedToken;
}

// URL validation
function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Check if domain is in approved list
    return APPROVED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// Safe tool execution with restrictions
async function executeCompliantTool(toolName: string, params: any): Promise<any> {
  let browser;
  
  try {
    // Validate inputs based on tool
    let targetUrl: string;
    
    if (toolName === 'search') {
      // For search, if query looks like URL, use it; otherwise search example.com
      if (params.query.startsWith('http')) {
        targetUrl = params.query;
      } else {
        // Default to example.com for search demo
        targetUrl = `https://example.com`;
      }
    } else if (toolName === 'retrieve') {
      targetUrl = params.url;
    } else {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    // Validate URL against whitelist
    if (!validateUrl(targetUrl)) {
      throw new Error(`Access denied: URL not in approved domains. Approved domains: ${APPROVED_DOMAINS.join(', ')}`);
    }
    
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    
    // Set a reasonable timeout
    await page.goto(targetUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    let result: any;
    const mode = params.mode || params.content_type || 'text';
    
    switch (mode) {
      case 'screenshot':
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: false, // Limited for security
        });
        result = {
          type: 'image',
          data: Buffer.from(screenshot).toString('base64'),
          mimeType: 'image/png',
          description: `Screenshot of ${targetUrl}`,
          url: targetUrl
        };
        break;
        
      case 'html':
        let html;
        if (params.selector) {
          html = await page.$eval(params.selector, el => el.outerHTML);
        } else {
          html = await page.content();
        }
        result = {
          type: 'html',
          content: html.substring(0, 5000), // Limit content length
          description: `HTML content from ${targetUrl}`,
          url: targetUrl
        };
        break;
        
      case 'text':
      default:
        let text;
        if (params.selector) {
          text = await page.$eval(params.selector, el => el.textContent);
        } else {
          text = await page.evaluate(() => document.body.textContent);
        }
        result = {
          type: 'text',
          content: text?.substring(0, 2000) || '', // Limit content length
          description: `Text content from ${targetUrl}`,
          url: targetUrl
        };
        break;
    }
    
    await browser.close();
    return result;
    
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    throw error;
  }
}

// MCP Protocol Handler
async function handleCompliantMCPRequest(request: MCPRequest): Promise<MCPResponse> {
  const { id, method, params } = request;
  
  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'puppeteer-mcp-compliant',
              version: '1.0.0',
              description: 'ChatGPT-compliant web content retrieval tools with security restrictions'
            }
          }
        };
        
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: COMPLIANT_TOOLS
          }
        };
        
      case 'tools/call':
        const { name, arguments: toolArgs } = params;
        
        // Only allow compliant tool names
        if (!COMPLIANT_TOOLS.find(tool => tool.name === name)) {
          throw new Error(`Tool not allowed: ${name}. Only 'search' and 'retrieve' are permitted.`);
        }
        
        const result = await executeCompliantTool(name, toolArgs);
        
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [result]
          }
        };
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
        data: error
      }
    };
  }
}

// HTTP Endpoints
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    if (!validateAuth(request)) {
      return NextResponse.json(
        { 
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32401,
            message: 'Unauthorized: Invalid or missing authentication token'
          }
        }, 
        { status: 401 }
      );
    }
    
    const mcpRequest: MCPRequest = await request.json();
    const response = await handleCompliantMCPRequest(mcpRequest);
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Compliant MCP request error:', error);
    return NextResponse.json(
      { 
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      }, 
      { status: 400 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET endpoint for server info (ChatGPT-compliant)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Puppeteer MCP Server (ChatGPT Compliant)',
    description: 'ChatGPT-compliant web content retrieval with security restrictions',
    version: '1.0.0',
    capabilities: ['tools'],
    compliance: {
      openai_chatgpt: true,
      allowed_tools: ['search', 'retrieve'],
      security_features: ['domain_whitelist', 'content_length_limits', 'authentication']
    },
    approved_domains: APPROVED_DOMAINS,
    tools: COMPLIANT_TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description
    }))
  });
} 
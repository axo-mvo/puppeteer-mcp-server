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

// Available MCP Tools
const TOOLS: MCPTool[] = [
  {
    name: 'take_screenshot',
    description: 'Take a screenshot of a web page',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the web page to screenshot'
        },
        fullPage: {
          type: 'boolean',
          description: 'Whether to capture the full page or just the viewport',
          default: false
        },
        viewport: {
          type: 'object',
          properties: {
            width: { type: 'number', description: 'Viewport width' },
            height: { type: 'number', description: 'Viewport height' }
          },
          description: 'Custom viewport size'
        },
        waitFor: {
          type: 'number',
          description: 'Additional wait time in milliseconds before taking screenshot'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'generate_pdf',
    description: 'Generate a PDF from a web page',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the web page to convert to PDF'
        },
        format: {
          type: 'string',
          enum: ['A4', 'Letter'],
          description: 'PDF page format',
          default: 'A4'
        },
        landscape: {
          type: 'boolean',
          description: 'Whether to use landscape orientation',
          default: false
        },
        waitFor: {
          type: 'number',
          description: 'Additional wait time in milliseconds before generating PDF'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'extract_text',
    description: 'Extract text content from a web page',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the web page to extract text from'
        },
        selector: {
          type: 'string',
          description: 'CSS selector to extract text from specific elements'
        },
        waitFor: {
          type: 'number',
          description: 'Additional wait time in milliseconds before extracting text'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'extract_html',
    description: 'Extract HTML content from a web page',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the web page to extract HTML from'
        },
        selector: {
          type: 'string',
          description: 'CSS selector to extract HTML from specific elements'
        },
        waitFor: {
          type: 'number',
          description: 'Additional wait time in milliseconds before extracting HTML'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'get_performance_metrics',
    description: 'Get performance metrics for a web page',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the web page to analyze'
        },
        waitFor: {
          type: 'number',
          description: 'Additional wait time in milliseconds before collecting metrics'
        }
      },
      required: ['url']
    }
  }
];

// Tool execution functions
async function executeTool(toolName: string, params: any): Promise<any> {
  let browser;
  try {
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
    
    // Set viewport if specified
    if (params.viewport) {
      await page.setViewport(params.viewport);
    }
    
    await page.goto(params.url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Wait additional time if specified
    if (params.waitFor) {
      await new Promise(resolve => setTimeout(resolve, params.waitFor));
    }
    
    let result: any;
    
    switch (toolName) {
      case 'take_screenshot':
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: params.fullPage || false,
        });
                 result = {
           type: 'image',
           data: Buffer.from(screenshot).toString('base64'),
           mimeType: 'image/png',
           description: `Screenshot of ${params.url}`
         };
        break;
        
      case 'generate_pdf':
        const pdf = await page.pdf({
          format: params.format || 'A4',
          landscape: params.landscape || false,
          printBackground: true,
        });
                 result = {
           type: 'document',
           data: Buffer.from(pdf).toString('base64'),
           mimeType: 'application/pdf',
           description: `PDF of ${params.url}`
         };
        break;
        
      case 'extract_text':
        let text;
        if (params.selector) {
          text = await page.$eval(params.selector, el => el.textContent);
        } else {
          text = await page.evaluate(() => document.body.textContent);
        }
        result = {
          type: 'text',
          content: text,
          description: `Text content from ${params.url}${params.selector ? ` (selector: ${params.selector})` : ''}`
        };
        break;
        
      case 'extract_html':
        let html;
        if (params.selector) {
          html = await page.$eval(params.selector, el => el.outerHTML);
        } else {
          html = await page.content();
        }
        result = {
          type: 'html',
          content: html,
          description: `HTML content from ${params.url}${params.selector ? ` (selector: ${params.selector})` : ''}`
        };
        break;
        
      case 'get_performance_metrics':
        const metrics = await page.metrics();
        const performanceData = await page.evaluate((): {
          loadTime: number;
          domContentLoaded: number;
          firstContentfulPaint: number;
          largestContentfulPaint: number;
        } => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
            largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
          };
        });
        result = {
          type: 'metrics',
          metrics,
          performance: performanceData,
          description: `Performance metrics for ${params.url}`
        };
        break;
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
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
async function handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
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
              name: 'puppeteer-mcp-server',
              version: '1.0.0',
              description: 'Puppeteer-based web scraping and automation tools'
            }
          }
        };
        
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: TOOLS
          }
        };
        
      case 'tools/call':
        const { name, arguments: toolArgs } = params;
        if (!TOOLS.find(tool => tool.name === name)) {
          throw new Error(`Unknown tool: ${name}`);
        }
        
        const result = await executeTool(name, toolArgs);
        
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
    const mcpRequest: MCPRequest = await request.json();
    const response = await handleMCPRequest(mcpRequest);
    
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
    console.error('MCP request error:', error);
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Server-Sent Events endpoint for streaming
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transport = searchParams.get('transport');
  
  if (transport === 'sse') {
    // For SSE transport, we need to handle streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const message = `data: ${JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
          params: {}
        })}\n\n`;
        controller.enqueue(encoder.encode(message));
        
        // Keep connection alive
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'));
        }, 30000);
        
        // Clean up on close
        return () => {
          clearInterval(keepAlive);
        };
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  }
  
  // Default response for info about the MCP server
  return NextResponse.json({
    name: 'Puppeteer MCP Server',
    description: 'Web scraping and automation tools via Model Context Protocol',
    version: '1.0.0',
    capabilities: ['tools'],
    tools: TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description
    }))
  });
} 
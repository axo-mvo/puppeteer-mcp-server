# Puppeteer MCP Server

A headless Chrome automation server built with Next.js and Puppeteer, designed to run on Vercel with multiple cloud browser options. This project provides RESTful API endpoints for web scraping, screenshot capture, PDF generation, and performance monitoring.

**🔗 GitHub Repository:** https://github.com/axo-mvo/puppeteer-mcp-server  
**🌐 Live Demo:** https://puppeteer-mcp-server.vercel.app  
**🎮 Interactive Demo:** https://puppeteer-mcp-server.vercel.app/demo

## Quick Test

Try the live API right now:
```bash
# Take a screenshot
curl "https://puppeteer-mcp-server.vercel.app/api/screenshot-chromium?url=https://example.com" -o screenshot.png

# Extract text content
curl -X POST "https://puppeteer-mcp-server.vercel.app/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","action":"text"}'
```

## Project Structure

```
puppeteer-vercel/
├── app/
│   ├── api/
│   │   ├── screenshot-browserless/     # Browserless.io API endpoint
│   │   │   └── route.ts
│   │   ├── screenshot-chromium/        # @sparticuz/chromium API endpoint
│   │   │   └── route.ts
│   │   ├── scrape/                     # Advanced scraping API endpoint
│   │   │   └── route.ts
│   │   └── mcp/                        # Model Context Protocol endpoint
│   │       └── route.ts
│   ├── demo/                           # Interactive demo page
│   │   └── page.tsx
│   ├── page.tsx                        # Main landing page
│   ├── layout.tsx                      # Root layout
│   └── globals.css                     # Global styles
├── package.json                        # Dependencies and scripts
├── next.config.ts                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
└── README.md                           # Project documentation
```

## Architectural Decisions

### Browser Execution Options

The project implements two approaches for running headless Chrome in serverless environments:

1. **@sparticuz/chromium** (`/api/screenshot-chromium`)
   - Self-contained Chromium binary packaged with the function
   - No external dependencies required
   - Larger bundle size but more reliable
   - Works within Vercel's function size limits

2. **Browserless.io** (`/api/screenshot-browserless`)
   - Connects to managed headless Chrome instances in the cloud
   - Requires `BLESS_TOKEN` environment variable
   - Smaller function size
   - Better for high-volume usage

### API Design

- **RESTful endpoints** for different functionality
- **TypeScript interfaces** for request/response validation
- **Comprehensive error handling** with proper HTTP status codes
- **Caching headers** for improved performance
- **Flexible options** for customization

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/axo-mvo/puppeteer-mcp-server.git
   cd puppeteer-mcp-server
   npm install
   ```

2. **Set up environment variables (for Browserless.io):**
   Create `.env.local` file:
   ```env
   BLESS_TOKEN=your_browserless_api_token_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Main page: http://localhost:3000
   - Demo page: http://localhost:3000/demo

### Deployment to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Import your GitHub repository in Vercel dashboard
   - Add environment variables if using Browserless.io:
     - `BLESS_TOKEN`: Your Browserless.io API token

3. **Configure function timeout (optional):**
   Add to `vercel.json`:
   ```json
   {
     "functions": {
       "app/api/**/route.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

## MCP (Model Context Protocol) Support

This server now supports the **Model Context Protocol (MCP)**, allowing it to be used as a tool server in AI assistants like Cursor, Claude Desktop, and other MCP-compatible clients.

### MCP Endpoint

**URL:** `/api/mcp`

The MCP endpoint provides the following tools:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `take_screenshot` | Take a screenshot of a web page | `url`, `fullPage?`, `viewport?`, `waitFor?` |
| `generate_pdf` | Generate a PDF from a web page | `url`, `format?`, `landscape?`, `waitFor?` |
| `extract_text` | Extract text content from a web page | `url`, `selector?`, `waitFor?` |
| `extract_html` | Extract HTML content from a web page | `url`, `selector?`, `waitFor?` |
| `get_performance_metrics` | Get performance metrics for a web page | `url`, `waitFor?` |

### Adding to Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "puppeteer-mcp": {
      "url": "https://puppeteer-mcp-server.vercel.app/api/mcp",
      "transport": "sse"
    }
  }
}
```

### Using MCP Tools

Once configured, you can use natural language commands in Cursor:

- "Take a screenshot of example.com"
- "Generate a PDF of the homepage"
- "Extract the title text from this website"
- "Get performance metrics for this URL"

## API Endpoints

### Screenshot APIs

#### GET `/api/screenshot-chromium`
Takes screenshots using @sparticuz/chromium.

**Parameters:**
- `url` (required): URL to capture

**Example:**
```bash
curl "https://your-app.vercel.app/api/screenshot-chromium?url=https://example.com"
```

#### GET `/api/screenshot-browserless`
Takes screenshots using Browserless.io.

**Parameters:**
- `url` (required): URL to capture

**Requires:** `BLESS_TOKEN` environment variable

**Example:**
```bash
curl "https://your-app.vercel.app/api/screenshot-browserless?url=https://example.com"
```

### Advanced Scraping API

#### POST `/api/scrape`
Comprehensive scraping endpoint with multiple actions.

**Request Body:**
```typescript
{
  url: string;
  action: 'screenshot' | 'pdf' | 'text' | 'html' | 'performance';
  options?: {
    fullPage?: boolean;
    selector?: string;
    format?: 'A4' | 'Letter';
    landscape?: boolean;
    waitFor?: number;
    viewport?: {
      width: number;
      height: number;
    };
  };
}
```

**Examples:**

Screenshot with custom viewport:
```bash
curl -X POST "https://your-app.vercel.app/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "action": "screenshot",
    "options": {
      "fullPage": true,
      "viewport": {"width": 1200, "height": 800}
    }
  }'
```

Generate PDF:
```bash
curl -X POST "https://your-app.vercel.app/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "action": "pdf",
    "options": {
      "format": "A4",
      "landscape": false
    }
  }'
```

Extract text content:
```bash
curl -X POST "https://your-app.vercel.app/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "action": "text",
    "options": {
      "selector": "h1"
    }
  }'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BLESS_TOKEN` | No* | Browserless.io API token (*required for browserless endpoints) |

## Features

- ✅ Screenshot capture (full page or viewport)
- ✅ PDF generation from web pages  
- ✅ Text and HTML content extraction
- ✅ Performance metrics collection
- ✅ Custom viewport and wait options
- ✅ RESTful API endpoints
- ✅ **MCP (Model Context Protocol) support**
- ✅ TypeScript support
- ✅ Interactive demo interface
- ✅ Multiple browser execution options
- ✅ Comprehensive error handling
- ✅ AI assistant integration (Cursor, Claude Desktop)

## Limitations

- **Function timeout:** Vercel free tier has 10-second timeout
- **Function size:** @sparticuz/chromium adds ~50MB to function
- **Memory usage:** Chrome requires significant memory allocation
- **Concurrent executions:** Consider rate limiting for production use

## Troubleshooting

### Common Issues

1. **Function timeout errors (FUNCTION_INVOCATION_TIMEOUT):**
   - **Fixed in latest version**: Optimized Chrome args and faster page loading
   - Uses `domcontentloaded` instead of `networkidle0` for faster loading
   - Increased function timeout to 60 seconds in `vercel.json`
   - Added proper browser cleanup to prevent memory leaks

2. **Memory errors:**
   - Close browser instances properly (handled automatically)
   - Avoid concurrent requests to same function
   - Function memory set to 1024MB in configuration

3. **Browserless.io connection errors:**
   - Verify `BLESS_TOKEN` is correctly set
   - Check Browserless.io service status

### Performance Optimizations

The latest version includes several Vercel-specific optimizations:
- **Faster Chrome startup** with optimized arguments
- **Reduced page load time** using `domcontentloaded`
- **Better error handling** with automatic browser cleanup
- **Increased timeouts** for complex pages (60s function timeout)
- **Memory optimization** with single-process Chrome mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Submit a pull request

## Change Log

- **2025-06-05**: Initial project setup with Next.js 15 and Puppeteer integration
- **2025-06-05**: Added @sparticuz/chromium support for self-contained browser execution  
- **2025-06-05**: Implemented Browserless.io integration for cloud browser instances
- **2025-06-05**: Created comprehensive scraping API with multiple action types
- **2025-06-05**: Built interactive demo interface with real-time testing
- **2025-06-05**: Added TypeScript interfaces and comprehensive error handling
- **2025-06-05**: Updated main landing page with feature overview and setup instructions
- **2025-06-05**: Fixed Vercel timeout issues with optimized Chrome args and faster loading
- **2025-06-05**: Increased function timeout to 60s and improved error handling
- **2025-06-05**: Added production URL storage and comprehensive testing suite
- **2025-06-05**: Fixed file download issue - PDFs and images now download with proper extensions (.pdf, .png) instead of generic .file extension
- **2025-06-05**: Added Model Context Protocol (MCP) support with comprehensive tool definitions for AI assistant integration

## Testing

### Production Testing

Run the comprehensive test suite:
```bash
./test-production.sh
```

Or test individual endpoints:
```bash
# Health check
npm run test:prod

# Screenshot test
npm run test:screenshot

# Open demo page
npm run test:demo
```

### Manual Testing

**Live Endpoints:**
- **Main Site:** https://puppeteer-mcp-server.vercel.app/
- **Demo Page:** https://puppeteer-mcp-server.vercel.app/demo
- **Screenshot API:** `https://puppeteer-mcp-server.vercel.app/api/screenshot-chromium?url=https://example.com`
- **Advanced Scraping:** `POST https://puppeteer-mcp-server.vercel.app/api/scrape`

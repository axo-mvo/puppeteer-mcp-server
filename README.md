# Puppeteer MCP Server

A headless Chrome automation server built with Next.js and Puppeteer, designed to run on Vercel with multiple cloud browser options. This project provides RESTful API endpoints for web scraping, screenshot capture, PDF generation, and performance monitoring.

## Project Structure

```
puppeteer-vercel/
├── app/
│   ├── api/
│   │   ├── screenshot-browserless/     # Browserless.io API endpoint
│   │   │   └── route.ts
│   │   ├── screenshot-chromium/        # @sparticuz/chromium API endpoint
│   │   │   └── route.ts
│   │   └── scrape/                     # Advanced scraping API endpoint
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
   git clone <repository-url>
   cd puppeteer-vercel
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
- ✅ TypeScript support
- ✅ Interactive demo interface
- ✅ Multiple browser execution options
- ✅ Comprehensive error handling

## Limitations

- **Function timeout:** Vercel free tier has 10-second timeout
- **Function size:** @sparticuz/chromium adds ~50MB to function
- **Memory usage:** Chrome requires significant memory allocation
- **Concurrent executions:** Consider rate limiting for production use

## Troubleshooting

### Common Issues

1. **Function timeout errors:**
   - Reduce page complexity or increase timeout in `vercel.json`
   - Use `waitUntil: 'domcontentloaded'` instead of `'networkidle0'`

2. **Memory errors:**
   - Close browser instances properly
   - Avoid concurrent requests to same function

3. **Browserless.io connection errors:**
   - Verify `BLESS_TOKEN` is correctly set
   - Check Browserless.io service status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Submit a pull request

## Change Log

- **2024-12-23**: Initial project setup with Next.js 15 and Puppeteer integration
- **2024-12-23**: Added @sparticuz/chromium support for self-contained browser execution  
- **2024-12-23**: Implemented Browserless.io integration for cloud browser instances
- **2024-12-23**: Created comprehensive scraping API with multiple action types
- **2024-12-23**: Built interactive demo interface with real-time testing
- **2024-12-23**: Added TypeScript interfaces and comprehensive error handling
- **2024-12-23**: Updated main landing page with feature overview and setup instructions

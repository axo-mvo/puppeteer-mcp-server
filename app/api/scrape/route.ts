import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

interface ScrapeRequest {
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

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json();
    const { url, action, options = {} } = body;
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL is required in request body' }, 
        { status: 400 }
      );
    }

    if (!['screenshot', 'pdf', 'text', 'html', 'performance'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Supported actions: screenshot, pdf, text, html, performance' }, 
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    
    const page = await browser.newPage();
    
    // Set viewport if specified
    if (options.viewport) {
      await page.setViewport(options.viewport);
    }
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Wait additional time if specified
    if (options.waitFor) {
      await new Promise(resolve => setTimeout(resolve, options.waitFor));
    }
    
    let result: any;
    let contentType = 'application/json';
    
    switch (action) {
      case 'screenshot':
        result = await page.screenshot({
          type: 'png',
          fullPage: options.fullPage || false,
        });
        contentType = 'image/png';
        break;
        
      case 'pdf':
        result = await page.pdf({
          format: (options.format as any) || 'A4',
          landscape: options.landscape || false,
          printBackground: true,
        });
        contentType = 'application/pdf';
        break;
        
      case 'text':
        if (options.selector) {
          result = await page.$eval(options.selector, el => el.textContent);
        } else {
          result = await page.evaluate(() => document.body.textContent);
        }
        result = { text: result };
        break;
        
      case 'html':
        if (options.selector) {
          result = await page.$eval(options.selector, el => el.outerHTML);
        } else {
          result = await page.content();
        }
        result = { html: result };
        break;
        
      case 'performance':
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
        result = { metrics, performance: performanceData };
        break;
        
      default:
        throw new Error('Invalid action specified');
    }
    
    await browser.close();

    if (action === 'screenshot' || action === 'pdf') {
      return new NextResponse(result, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      return NextResponse.json(result, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { message: 'Failed to perform scraping action', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 
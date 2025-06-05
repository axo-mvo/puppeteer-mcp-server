import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { message: 'URL parameter is required' }, 
      { status: 400 }
    );
  }

  let browser;
  try {
    // Optimize Chromium for Vercel
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
    
    // Set a reasonable timeout for page load
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const screenshot = await page.screenshot({ 
      type: 'png'
    });
    
    await browser.close();

    return new NextResponse(screenshot, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { message: 'Failed to take screenshot', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let browser;
  try {
    const body = await request.json();
    const { url, options = {} } = body;
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL is required in request body' }, 
        { status: 400 }
      );
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
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: options.fullPage || false,
      ...options,
    });
    
    await browser.close();

    return new NextResponse(screenshot, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { message: 'Failed to take screenshot', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 
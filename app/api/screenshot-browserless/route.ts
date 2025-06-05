import { NextRequest, NextResponse } from 'next/server';
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

  if (!process.env.BLESS_TOKEN) {
    return NextResponse.json(
      { message: 'BLESS_TOKEN environment variable is not configured' }, 
      { status: 500 }
    );
  }

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    return new NextResponse(screenshot, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { message: 'Failed to take screenshot', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, options = {} } = body;
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL is required in request body' }, 
        { status: 400 }
      );
    }

    if (!process.env.BLESS_TOKEN) {
      return NextResponse.json(
        { message: 'BLESS_TOKEN environment variable is not configured' }, 
        { status: 500 }
      );
    }

    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    
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
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { message: 'Failed to take screenshot', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 
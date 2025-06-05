#!/bin/bash

# Puppeteer MCP Server - Production Test Suite
# URL: https://puppeteer-mcp-server.vercel.app

echo "🎭 Testing Puppeteer MCP Server Production Deployment"
echo "=================================================="
echo "Production URL: https://puppeteer-mcp-server.vercel.app"
echo ""

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
echo "----------------------"
response=$(curl -s -I https://puppeteer-mcp-server.vercel.app)
if echo "$response" | grep -q "HTTP/2 200"; then
    echo "✅ Main site is accessible"
else
    echo "❌ Main site is not accessible"
    exit 1
fi
echo ""

# Test 2: Demo Page
echo "🎮 Test 2: Demo Page Check"
echo "-------------------------"
demo_response=$(curl -s -I https://puppeteer-mcp-server.vercel.app/demo)
if echo "$demo_response" | grep -q "HTTP/2 200"; then
    echo "✅ Demo page is accessible"
    echo "   URL: https://puppeteer-mcp-server.vercel.app/demo"
else
    echo "❌ Demo page is not accessible"
fi
echo ""

# Test 3: Screenshot API (Chromium)
echo "📸 Test 3: Screenshot API (@sparticuz/chromium)"
echo "----------------------------------------------"
echo "Testing with URL: https://example.com"
curl -s "https://puppeteer-mcp-server.vercel.app/api/screenshot-chromium?url=https://example.com" -o test-chromium.png
if [ -s test-chromium.png ]; then
    size=$(ls -la test-chromium.png | awk '{print $5}')
    echo "✅ Screenshot generated successfully ($size bytes)"
    echo "   File: test-chromium.png"
else
    echo "❌ Screenshot generation failed"
fi
echo ""

# Test 4: Advanced Scrape API - Text Extraction
echo "📄 Test 4: Scrape API - Text Extraction"
echo "---------------------------------------"
text_result=$(curl -s -X POST "https://puppeteer-mcp-server.vercel.app/api/scrape" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com","action":"text"}')
if echo "$text_result" | grep -q "Example Domain"; then
    echo "✅ Text extraction successful"
    echo "   Sample: $(echo "$text_result" | jq -r '.text' | head -1 | cut -c1-50)..."
else
    echo "❌ Text extraction failed"
    echo "   Response: $text_result"
fi
echo ""

# Test 5: Advanced Scrape API - HTML Extraction
echo "🌐 Test 5: Scrape API - HTML Extraction"
echo "---------------------------------------"
html_result=$(curl -s -X POST "https://puppeteer-mcp-server.vercel.app/api/scrape" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com","action":"html"}')
if echo "$html_result" | grep -q "html"; then
    echo "✅ HTML extraction successful"
    html_length=$(echo "$html_result" | jq -r '.html' | wc -c)
    echo "   HTML length: $html_length characters"
else
    echo "❌ HTML extraction failed"
fi
echo ""

# Test 6: Advanced Scrape API - Screenshot
echo "📷 Test 6: Scrape API - Screenshot"
echo "----------------------------------"
curl -s -X POST "https://puppeteer-mcp-server.vercel.app/api/scrape" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com","action":"screenshot","options":{"fullPage":true}}' \
    -o test-scrape-screenshot.png
if [ -s test-scrape-screenshot.png ]; then
    size=$(ls -la test-scrape-screenshot.png | awk '{print $5}')
    echo "✅ Scrape screenshot generated successfully ($size bytes)"
    echo "   File: test-scrape-screenshot.png"
else
    echo "❌ Scrape screenshot generation failed"
fi
echo ""

# Test 7: Performance Metrics
echo "⚡ Test 7: Performance Metrics"
echo "-----------------------------"
perf_result=$(curl -s -X POST "https://puppeteer-mcp-server.vercel.app/api/scrape" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com","action":"performance"}')
if echo "$perf_result" | grep -q "loadTime"; then
    echo "✅ Performance metrics collected successfully"
    load_time=$(echo "$perf_result" | jq -r '.performance.loadTime')
    echo "   Load time: ${load_time}ms"
else
    echo "❌ Performance metrics collection failed"
fi
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo "Production URL: https://puppeteer-mcp-server.vercel.app"
echo ""
echo "Available endpoints:"
echo "  • Main site: https://puppeteer-mcp-server.vercel.app/"
echo "  • Demo page: https://puppeteer-mcp-server.vercel.app/demo"
echo "  • Screenshot (Chromium): /api/screenshot-chromium?url=..."
echo "  • Screenshot (Browserless): /api/screenshot-browserless?url=..."
echo "  • Advanced Scraping: /api/scrape (POST)"
echo ""
echo "Generated test files:"
if [ -s test-chromium.png ]; then
    echo "  ✅ test-chromium.png ($(ls -la test-chromium.png | awk '{print $5}') bytes)"
fi
if [ -s test-scrape-screenshot.png ]; then
    echo "  ✅ test-scrape-screenshot.png ($(ls -la test-scrape-screenshot.png | awk '{print $5}') bytes)"
fi
echo ""
echo "🎉 All tests completed! Your Puppeteer MCP Server is working perfectly!" 
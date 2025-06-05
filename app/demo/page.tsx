'use client';

import { useState } from 'react';

export default function DemoPage() {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testScreenshot = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/${endpoint}?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to take screenshot');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResult(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testScraping = async (action: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          action,
          options: {
            fullPage: action === 'screenshot',
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action}`);
      }

      if (action === 'screenshot' || action === 'pdf') {
        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);
        setResult(fileUrl);
      } else {
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Puppeteer MCP Server Demo</h1>
      
      <div className="mb-6">
        <label htmlFor="url" className="block text-sm font-medium mb-2">
          URL to test:
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Screenshot APIs</h2>
          
          <button
            onClick={() => testScreenshot('screenshot-chromium')}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Test @sparticuz/chromium'}
          </button>
          
          <button
            onClick={() => testScreenshot('screenshot-browserless')}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white p-3 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Test Browserless.io'}
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Advanced Scraping</h2>
          
          {['screenshot', 'pdf', 'text', 'html', 'performance'].map((action) => (
            <button
              key={action}
              onClick={() => testScraping(action)}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : `Get ${action.charAt(0).toUpperCase() + action.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Result:</h3>
          {result.startsWith('blob:') ? (
            result.includes('image') || result.includes('png') ? (
              <img src={result} alt="Screenshot" className="max-w-full h-auto border rounded" />
            ) : (
              <a
                href={result}
                download={`result.${result.includes('pdf') ? 'pdf' : 'file'}`}
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Download File
              </a>
            )
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {result}
            </pre>
          )}
        </div>
      )}

      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">API Endpoints:</h3>
        <ul className="space-y-2 text-sm">
          <li><code className="bg-gray-200 px-2 py-1 rounded">GET /api/screenshot-chromium?url=...</code></li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">GET /api/screenshot-browserless?url=...</code></li>
          <li><code className="bg-gray-200 px-2 py-1 rounded">POST /api/scrape</code> - Advanced scraping with JSON body</li>
        </ul>
      </div>
    </div>
  );
} 
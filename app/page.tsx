import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <span className="text-2xl font-bold">+</span>
          <div className="text-2xl font-bold">🎭 Puppeteer</div>
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-4">Puppeteer MCP Server</h1>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            A headless Chrome automation server built with Next.js and Puppeteer, 
            ready to deploy on Vercel with multiple cloud browser options.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">🚀 @sparticuz/chromium</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Self-contained Chromium binary packaged with your function. 
              No external dependencies required.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">☁️ Browserless.io</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Connect to managed headless Chrome instances in the cloud. 
              Requires BLESS_TOKEN environment variable.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg w-full">
          <h3 className="font-semibold mb-3">✨ Features</h3>
          <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Screenshot capture (full page or viewport)</li>
            <li>• PDF generation from web pages</li>
            <li>• Text and HTML content extraction</li>
            <li>• Performance metrics collection</li>
            <li>• Custom viewport and wait options</li>
            <li>• RESTful API endpoints</li>
          </ul>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/demo"
          >
            🎮 Try Demo
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert mr-2"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy to Vercel
          </a>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 w-full">
          <p className="text-sm">
            <strong>⚙️ Setup:</strong> For Browserless.io integration, add your <code>BLESS_TOKEN</code> 
            environment variable in Vercel dashboard or local <code>.env.local</code> file.
          </p>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://pptr.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>🎭</span>
          Puppeteer Docs
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://browserless.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>☁️</span>
          Browserless.io
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Next.js
        </a>
      </footer>
    </div>
  );
}

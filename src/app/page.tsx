import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between p-6 glass-panel rounded-none border-b border-gray-800">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold gradient-text">Consensus AI</span>
          <span className="bg-violet-900/50 text-violet-300 text-xs px-2 py-1 rounded-full border border-violet-800">Demo Mode Available</span>
        </div>
        <Link href="/ask" className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
          Ask a Question
        </Link>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[80vh] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none" />
        <div className="z-10 max-w-4xl animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            One question. Multiple AIs.<br />
            <span className="gradient-text">One verified answer.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Compare responses from GPT-4o, Claude, Gemini, and more. We verify claims, resolve disagreements, and deliver the truth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ask" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition glow-violet">
              Ask a Question →
            </Link>
            <a href="#how-it-works" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition border border-gray-700">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="p-12 md:p-24 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How Consensus AI Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 text-center">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Query Multiple Models</h3>
              <p className="text-gray-400">We simultaneously send your question to the world's best AI models.</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Cross-Reference</h3>
              <p className="text-gray-400">We extract claims and detect disagreements between their responses.</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Synthesize Truth</h3>
              <p className="text-gray-400">You receive a single, verified answer with confidence ratings and sources.</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="p-8 text-center border-t border-gray-800 text-gray-500">
        <p>© 2026 Consensus AI. Open Source Demo.</p>
      </footer>
    </main>
  );
}

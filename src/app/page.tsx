import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Consensus AI
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition">How it Works</a>
            <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
          </nav>
          <Link href="/ask" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            Ask a Question
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] -z-10"></div>
          
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-gray-900/50 border border-gray-800 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-4">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Multi-Model Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              One question. <br/>
              Multiple AIs. <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                One verified answer.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Stop guessing which model is right. We query GPT-4o, Claude 3.5, Gemini 1.5, and more—cross-verifying their claims to eliminate hallucinations and give you absolute confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link href="/ask" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full text-lg font-semibold transition shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                Try it now
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white px-8 py-3.5 rounded-full text-lg font-semibold transition">
                See how it works
              </a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-gray-900/30 border-y border-gray-800/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">The Verification Pipeline</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Our specialized synthesis engine automatically detects disagreements and fact-checks each model against the others.</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-blue-900 via-blue-500 to-purple-900 z-0"></div>
              
              {[
                { step: '01', title: 'Query Models', desc: 'Your prompt is optimized and sent simultaneously to frontier models.' },
                { step: '02', title: 'Extract Claims', desc: 'We break down each response into discrete, verifiable factual claims.' },
                { step: '03', title: 'Find Conflicts', desc: 'The engine identifies areas where models disagree or hallucinate.' },
                { step: '04', title: 'Synthesize', desc: 'You get one cohesive, highly confident answer with evidence.' }
              ].map((s, i) => (
                <div key={i} className="relative z-10 bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center hover:border-gray-700 transition">
                  <div className="w-12 h-12 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center text-blue-400 font-mono font-bold mb-6">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900 bg-gray-950 py-12 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Consensus AI. Built for absolute accuracy.</p>
      </footer>
    </div>
  );
}

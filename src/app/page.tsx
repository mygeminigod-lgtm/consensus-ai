import Link from 'next/link';

const PIPELINE_STEPS = [
  { icon: '🔍', label: 'Understand question' },
  { icon: '🤖', label: 'Select models' },
  { icon: '⚡', label: 'Query independently' },
  { icon: '🔄', label: 'Compare responses' },
  { icon: '📌', label: 'Extract claims' },
  { icon: '⚠️', label: 'Detect disagreements' },
  { icon: '🔬', label: 'Verify evidence' },
  { icon: '🧮', label: 'Run calculations' },
  { icon: '🧩', label: 'Synthesize answer' },
  { icon: '✅', label: 'Final verification' },
  { icon: '📊', label: 'Calculate confidence' },
  { icon: '💬', label: 'Show answer + sources' },
];

const FEATURES = [
  { icon: '🤖', title: 'Multi-Model Consensus', desc: 'Query up to 7 AI providers independently. No cross-contamination between models.' },
  { icon: '🔬', title: 'Claim Verification', desc: 'Extract and verify every important factual claim against evidence and primary sources.' },
  { icon: '⚠️', title: 'Disagreement Detection', desc: 'Identify when models contradict each other. Agreement is not proof of truth.' },
  { icon: '📊', title: 'Evidence Matrix', desc: 'Visualize which models support or contradict each claim at a glance.' },
  { icon: '🧮', title: 'Math Verification', desc: 'Independently verify calculations using deterministic symbolic math — not just AI arithmetic.' },
  { icon: '🎯', title: 'Transparent Confidence', desc: 'Heuristic confidence scoring that honestly reflects uncertainty, never claiming 100% accuracy.' },
];

const MODES = [
  { name: 'Quick', desc: 'Fast · 2 models', color: 'border-blue-800 text-blue-400' },
  { name: 'Balanced', desc: '3-4 models · verified', color: 'border-violet-800 text-violet-400' },
  { name: 'Deep Verify', desc: 'All models · deep', color: 'border-purple-800 text-purple-400' },
  { name: 'Academic', desc: 'Citations · scholarly', color: 'border-emerald-800 text-emerald-400' },
  { name: 'Math', desc: 'Calculator · symbolic', color: 'border-orange-800 text-orange-400' },
  { name: 'Coding', desc: 'Code analysis · review', color: 'border-cyan-800 text-cyan-400' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-900 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Consensus AI
          </span>
          <Link href="/ask" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
            Ask a Question →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-gray-950 to-indigo-950/20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-900/30 border border-violet-800/50 rounded-full text-violet-400 text-xs font-medium mb-8">
            ✦ Multi-model AI verification
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              One question.
            </span>
            <br />
            <span className="text-white">Multiple AIs.</span>
            <br />
            <span className="text-gray-300 text-4xl sm:text-5xl">One verified answer.</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Consensus AI compares independent AI responses, checks evidence, detects disagreements, 
            and synthesizes the strongest answer available.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ask" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-base font-semibold transition-all hover:scale-105 shadow-lg shadow-violet-900/30">
              Ask a Question →
            </Link>
            <a href="#how-it-works" className="px-8 py-4 bg-gray-900/80 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-2xl text-base font-medium transition-colors">
              See How Verification Works
            </a>
          </div>

          {/* Model badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {['GPT-4o', 'Claude 3.5', 'Gemini 1.5', 'DeepSeek', 'Mistral', 'Perplexity', 'Grok'].map(m => (
              <span key={m} className="px-3 py-1.5 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-gray-400">
                🟢 {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">How Verification Works</h2>
          <p className="text-center text-gray-500 mb-12">Every question runs through a 12-step pipeline</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{step.icon}</div>
                <div className="text-xs text-gray-300 font-medium">{step.label}</div>
                <div className="text-xs text-gray-700 mt-1">Step {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Answer Modes</h2>
          <p className="text-center text-gray-500 mb-12">Tailor the verification process to your needs.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MODES.map(m => (
              <div key={m.name} className={`bg-gray-900/60 border ${m.color.split(' ')[0]} rounded-2xl p-6`}>
                 <h3 className={`text-sm font-semibold mb-2 ${m.color.split(' ')[1]}`}>{m.name}</h3>
                 <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="py-8 border-t border-gray-900 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} Consensus AI. All rights reserved.
      </footer>
    </div>
  );
}

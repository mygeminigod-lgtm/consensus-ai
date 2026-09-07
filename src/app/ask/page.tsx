'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { AnswerMode, FinalAnswer, PipelineProgressEvent, PipelineStage, ProviderConfig } from '@/types/consensus';
import { addToHistory } from '@/utils/storage';
import { copyToClipboard, exportAsMarkdown } from '@/utils/export';

// Inline fallback components since separate components might not exist yet

function LiveProgress({ stage, message, progressPercent }: { stage: PipelineStage, message: string, progressPercent: number }) {
  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-lg p-6 my-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Analyzing Request</h3>
      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>{message}</span>
        <span>{progressPercent}%</span>
      </div>
      <div className="mt-4 text-xs text-gray-500 uppercase tracking-wide">
        Current Stage: {stage.replace(/_/g, ' ')}
      </div>
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  let color = 'bg-green-500';
  let label = 'High Confidence';
  if (score < 60) {
    color = 'bg-red-500';
    label = 'Low Confidence';
  } else if (score < 85) {
    color = 'bg-yellow-500';
    label = 'Medium Confidence';
  }
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${color} bg-opacity-20 border border-opacity-50`}>
      <span className={`w-2 h-2 rounded-full ${color} mr-2`}></span>
      {label} ({score}%)
    </div>
  );
}

function DisagreementAlert({ disagreements }: { disagreements: any[] }) {
  if (!disagreements || disagreements.length === 0) return null;
  return (
    <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-4 my-6">
      <h4 className="text-red-400 font-semibold mb-2 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        Model Disagreements Detected
      </h4>
      <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
        {disagreements.map((d, i) => (
          <li key={i}>{d.description} ({d.severity})</li>
        ))}
      </ul>
    </div>
  );
}

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<AnswerMode>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [hasRealProviders, setHasRealProviders] = useState(false);
  
  // Pipeline State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage | null>(null);
  const [pipelineMessage, setPipelineMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<FinalAnswer | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then((data: ProviderConfig[]) => {
        setProviders(data);
        setHasRealProviders(data.some(p => p.hasApiKey && p.id !== 'demo'));
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResult(null);
    setPipelineStage('understanding_question');
    setPipelineMessage('Initializing pipeline...');
    setProgressPercent(5);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          mode, 
          demoMode: !hasRealProviders 
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to connect to API');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const event = JSON.parse(jsonStr) as PipelineProgressEvent;
              setPipelineStage(event.stage);
              setPipelineMessage(event.message);
              setProgressPercent(event.progressPercent);
              
              if (event.stage === 'complete' && event.data) {
                const finalAnswer = event.data as FinalAnswer;
                setResult(finalAnswer);
                setIsLoading(false);
                if (typeof window !== 'undefined') {
                  addToHistory({
                    id: finalAnswer.id,
                    question: finalAnswer.question,
                    mode: finalAnswer.mode,
                    timestamp: Date.now(),
                    confidence: finalAnswer.confidence,
                    isDemo: finalAnswer.isDemo
                  });
                }
              }
              if (event.stage === 'error') {
                setError(event.message);
                setIsLoading(false);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An unknown error occurred');
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const setExample = (text: string) => {
    setQuestion(text);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <header className="border-b border-gray-800 p-4 flex justify-between items-center bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Consensus AI
          </Link>
          {!hasRealProviders && (
            <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded border border-blue-800">
              DEMO MODE
            </span>
          )}
        </div>
        <nav className="flex space-x-4">
          <Link href="/history" className="text-gray-400 hover:text-white transition">History</Link>
          <Link href="/saved" className="text-gray-400 hover:text-white transition">Saved</Link>
          <Link href="/settings" className="text-gray-400 hover:text-white transition">Settings</Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-6 pt-12 pb-24">
        {!result && !isLoading && (
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Ask the AI Consensus</h1>
            <p className="text-gray-400 text-lg">We query multiple frontier models and verify their answers.</p>
          </div>
        )}

        <div className={`transition-all duration-500 ${result || isLoading ? 'mb-8' : 'mb-12'}`}>
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a complex question..."
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-6 pr-24 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[120px]"
              disabled={isLoading}
            />
            
            <div className="absolute bottom-4 left-6 flex space-x-2">
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value as AnswerMode)}
                className="bg-gray-800 border border-gray-700 text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500 text-gray-300"
                disabled={isLoading}
              >
                <option value="quick">Quick</option>
                <option value="balanced">Balanced</option>
                <option value="deep">Deep</option>
                <option value="academic">Academic</option>
                <option value="math">Math</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !question.trim()}
              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white p-2 rounded-xl transition-colors shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>

          {!result && !isLoading && (
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500 py-1 mr-2">Try:</span>
              {[
                'Explain quantum entanglement', 
                'Solve: 15 * 4 + 10', 
                'Compare Python and Rust', 
                'What is the greenhouse effect?'
              ].map((ex, i) => (
                <button 
                  key={i}
                  onClick={() => setExample(ex)}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-300 text-sm px-3 py-1 rounded-full transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {isLoading && pipelineStage && (
          <LiveProgress stage={pipelineStage} message={pipelineMessage} progressPercent={progressPercent} />
        )}

        {result && (
          <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <ConfidenceBadge score={result.confidence} />
                <h2 className="text-3xl font-bold mt-4 mb-2 text-white">Synthesized Answer</h2>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => typeof window !== 'undefined' && copyToClipboard(result.directAnswer)}
                  className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-lg transition border border-gray-800"
                  title="Copy Answer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </div>

            <DisagreementAlert disagreements={result.disagreements} />

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 shadow-xl">
              <div className="prose prose-invert prose-blue max-w-none">
                <p className="text-xl leading-relaxed text-gray-100 whitespace-pre-wrap">{result.directAnswer}</p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">Why this is correct:</h3>
                <p className="text-gray-400">{result.whyExplanation}</p>
              </div>
            </div>

            {/* Models Consulted Section */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-200 border-b border-gray-800 pb-2">Models Consulted</h3>
              <div className="flex flex-wrap gap-2">
                {result.modelsConsulted.map((model, i) => (
                  <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-md text-sm border border-gray-700">
                    {model}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="pt-8 flex justify-center">
              <button 
                onClick={() => {
                  setResult(null);
                  setQuestion('');
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
              >
                Ask Another Question
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

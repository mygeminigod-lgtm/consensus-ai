'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { AnswerMode, FinalAnswer, PipelineStage, ProviderConfig } from '@/types/consensus';
import { addToHistory, saveAnswer } from '@/utils/storage';
import { copyToClipboard, exportAsMarkdown } from '@/utils/export';
import { v4 as uuidv4 } from 'uuid';

const MODES: { id: AnswerMode; label: string; description: string; color: string }[] = [
  { id: 'quick', label: 'Quick', description: '2 models, fast', color: 'text-blue-400' },
  { id: 'balanced', label: 'Balanced', description: '3-4 models + verification', color: 'text-violet-400' },
  { id: 'deep', label: 'Deep Verify', description: 'All models + deep analysis', color: 'text-purple-400' },
  { id: 'academic', label: 'Academic', description: 'Citations + sources', color: 'text-emerald-400' },
  { id: 'math', label: 'Math', description: 'Calculation verification', color: 'text-orange-400' },
  { id: 'coding', label: 'Coding', description: 'Code analysis + review', color: 'text-cyan-400' },
];

const EXAMPLE_QUESTIONS = [
  'Explain quantum entanglement',
  'Solve: 15 * 4 + 10',
  'Compare Python and Rust performance',
  'What is the greenhouse effect?',
  'Is caffeine addictive?',
];

const PIPELINE_LABELS: Record<string, string> = {
  idle: 'Waiting',
  understanding_question: 'Understanding question',
  selecting_models: 'Selecting models',
  querying_models: 'Querying models',
  comparing_responses: 'Comparing responses',
  extracting_claims: 'Extracting claims',
  detecting_disagreements: 'Detecting disagreements',
  verifying_evidence: 'Verifying evidence',
  performing_calculations: 'Running calculations',
  synthesizing_answer: 'Synthesizing answer',
  final_verification: 'Final verification',
  complete: 'Complete',
  error: 'Error',
};

const PIPELINE_ORDER = [
  'understanding_question', 'selecting_models', 'querying_models',
  'comparing_responses', 'extracting_claims', 'detecting_disagreements',
  'verifying_evidence', 'performing_calculations', 'synthesizing_answer',
  'final_verification', 'complete'
];

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<AnswerMode>('balanced');
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [pipelineMessage, setPipelineMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<FinalAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load provider status and check for demo mode
    fetch('/api/providers')
      .then(r => r.json())
      .then((data: ProviderConfig[]) => {
        setProviders(data);
        const hasReal = data.some(p => p.id !== 'demo' && p.hasApiKey);
        setDemoMode(!hasReal);
      })
      .catch(() => setDemoMode(true));
    
    // Check if there's a pre-loaded question from history
    const stored = sessionStorage.getItem('consensus_replay');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(parsed.finalAnswer);
        setQuestion(parsed.question);
        sessionStorage.removeItem('consensus_replay');
      } catch {}
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setPipelineStage('understanding_question');
    setPipelineMessage('Starting...');
    setProgressPercent(5);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), mode, demoMode }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            setPipelineStage(event.stage);
            setPipelineMessage(event.message ?? '');
            setProgressPercent(event.progressPercent ?? 0);
            
            if (event.stage === 'complete' && event.data) {
              const finalAnswer = event.data as FinalAnswer;
              setResult(finalAnswer);
              setIsLoading(false);
              // Save to history
              addToHistory({
                id: uuidv4(),
                question: question.trim(),
                mode,
                createdAt: new Date().toISOString(),
                confidenceLevel: finalAnswer.confidence.level,
                modelsCount: finalAnswer.modelsConsulted.length,
                finalAnswer,
              });
            }
            if (event.stage === 'error') {
              setError(event.message);
              setIsLoading(false);
            }
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
      setIsLoading(false);
    }
  }, [question, mode, demoMode, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleSave = useCallback(() => {
    if (!result) return;
    saveAnswer({ id: uuidv4(), question: question.trim(), finalAnswer: result, savedAt: new Date().toISOString() });
    setSaved(true);
  }, [result, question]);

  const confidenceColor = (level: string) => {
    if (level === 'High') return 'text-emerald-400 bg-emerald-900/30 border-emerald-800';
    if (level === 'Moderate') return 'text-amber-400 bg-amber-900/30 border-amber-800';
    if (level === 'Limited') return 'text-orange-400 bg-orange-900/30 border-orange-800';
    return 'text-red-400 bg-red-900/30 border-red-800';
  };

  const confidenceEmoji = (level: string) => {
    if (level === 'High') return '🟢';
    if (level === 'Moderate') return '🟡';
    if (level === 'Limited') return '🟠';
    return '🔴';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Consensus AI
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {demoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-900/50 text-amber-400 border border-amber-800 rounded-md">
                DEMO MODE
              </span>
            )}
            <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">History</Link>
            <Link href="/saved" className="text-sm text-gray-400 hover:text-white transition-colors">Saved</Link>
            <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">Settings</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Question Input */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
          {demoMode && (
            <div className="mb-4 px-3 py-2 bg-amber-900/30 border border-amber-800/50 rounded-lg text-amber-400 text-sm">
              ⚠️ <strong>Demo Mode</strong> — No API keys configured. Responses are simulated static data, not live AI output.
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Enter to submit, Shift+Enter for newline)"
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg leading-relaxed min-h-[120px]"
            maxLength={10000}
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-600">{question.length}/10000</div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <button
                  onClick={() => { abortControllerRef.current?.abort(); setIsLoading(false); }}
                  className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-xl text-sm border border-red-800 transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!question.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
                >
                  Verify Answer →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                mode === m.id
                  ? 'bg-gray-800 border-gray-600 ' + m.color
                  : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Active Providers Indicator */}
        {providers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-gray-500">
            <span className="text-gray-400 font-medium">Available Models:</span>
            {providers.map(p => (
              <span
                key={p.id}
                className={`px-2 py-0.5 rounded border ${
                  p.badgeStatus === 'connected'
                    ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400'
                    : 'border-gray-800 bg-gray-900/50 text-gray-500'
                }`}
              >
                {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Example Questions */}
        {!isLoading && !result && (
          <div className="mb-8">
            <p className="text-xs text-gray-600 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-3 py-1.5 bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pipeline Progress */}
        {isLoading && (
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Verification Pipeline</h3>
              <span className="text-xs text-gray-500">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
              <div
                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="space-y-2">
              {PIPELINE_ORDER.map(stage => {
                const idx = PIPELINE_ORDER.indexOf(stage);
                const currentIdx = PIPELINE_ORDER.indexOf(pipelineStage);
                const status = idx < currentIdx ? 'complete' : idx === currentIdx ? 'active' : 'pending';
                return (
                  <div key={stage} className={`flex items-center gap-3 text-sm ${
                    status === 'active' ? 'text-violet-400' :
                    status === 'complete' ? 'text-gray-500 line-through' : 'text-gray-700'
                  }`}>
                    <span className="w-4 flex-shrink-0">
                      {status === 'complete' ? '✓' : status === 'active' ? '⟳' : '·'}
                    </span>
                    <span>{PIPELINE_LABELS[stage]}</span>
                    {status === 'active' && pipelineMessage && (
                      <span className="text-xs text-gray-500 truncate">— {pipelineMessage}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-2xl p-4 mb-6 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Demo banner */}
            {result.isDemo && (
              <div className="px-4 py-3 bg-amber-900/30 border border-amber-800 rounded-xl text-amber-400 text-sm">
                ⚠️ <strong>Demo Response</strong> — This is simulated data, not generated by live AI models.
              </div>
            )}

            {/* Answer */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Answer</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${confidenceColor(result.confidence.level)}`}>
                  {confidenceEmoji(result.confidence.level)} {result.confidence.level} Confidence
                </span>
              </div>
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">{result.directAnswer}</div>
              
              {result.whyExplanation && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Why</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.whyExplanation}</p>
                </div>
              )}
            </div>

            {/* Verification Summary */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Verification</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">✓ {result.modelsConsulted.length} model(s) consulted</p>
                <p className="text-gray-400">✓ {result.claims.length} claims extracted</p>
                <p className="text-gray-400">✓ {result.verificationResults.filter(v => v.verdict === 'confirmed' || v.verdict === 'supported').length} claims supported</p>
                {result.disagreements.length > 0 && (
                  <p className="text-amber-400">⚠️ {result.disagreements.length} disagreement(s) detected</p>
                )}
                {result.mathChecks && result.mathChecks.length > 0 && (
                  <p className="text-emerald-400">✓ {result.mathChecks.filter(m => m.isIndependentlyVerified).length} calculation(s) independently verified</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-600">
                <p>{result.confidence.rationale}</p>
                {!result.isDemo && <p className="mt-1">Note: Confidence is a heuristic estimate, not a guarantee of accuracy.</p>}
              </div>
            </div>

            {/* Models Consulted */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Models Consulted</h3>
              <div className="grid grid-cols-2 gap-2">
                {result.modelsConsulted.map(m => (
                  <div key={m.providerId} className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg text-sm">
                    <span className={m.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                      {m.status === 'success' ? '🟢' : '🔴'}
                    </span>
                    <span className="text-gray-300">{m.providerName}</span>
                    {m.latencyMs && <span className="text-gray-600 text-xs ml-auto">{m.latencyMs}ms</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Claims & Evidence Matrix */}
            {result.claims.length > 0 && (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Evidence Matrix</h3>
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 pr-4 text-gray-500 font-medium">Claim</th>
                      <th className="text-center py-2 px-2 text-gray-500 font-medium">Models</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.claims.slice(0, 8).map(claim => {
                      const vr = result.verificationResults.find(v => v.claimId === claim.id);
                      return (
                        <tr key={claim.id} className="border-b border-gray-800/50">
                          <td className="py-2 pr-4 text-gray-300 text-xs leading-relaxed max-w-[300px]">
                            {claim.text.slice(0, 120)}{claim.text.length > 120 ? '...' : ''}
                          </td>
                          <td className="py-2 px-2 text-center text-xs">
                            <span className="text-emerald-400">{claim.supportingModels.length}✓</span>
                            {claim.contradictingModels.length > 0 && <span className="text-red-400 ml-1">{claim.contradictingModels.length}✗</span>}
                          </td>
                          <td className="py-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              vr?.verdict === 'confirmed' ? 'bg-emerald-900/50 text-emerald-400' :
                              vr?.verdict === 'supported' ? 'bg-blue-900/50 text-blue-400' :
                              vr?.verdict === 'contradicted' ? 'bg-red-900/50 text-red-400' :
                              'bg-amber-900/50 text-amber-400'
                            }`}>
                              {vr?.verdict ?? claim.verificationStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Disagreements */}
            {result.disagreements.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">⚠️ Disagreements Detected</h3>
                <div className="space-y-3">
                  {result.disagreements.map(d => (
                    <div key={d.id} className="text-sm">
                      <p className="text-amber-300 font-medium mb-1">{d.claimText.slice(0, 100)}</p>
                      <p className="text-gray-500 text-xs">Type: {d.type} | Severity: {d.severity}</p>
                      {d.resolvedVerdict && <p className="text-emerald-400 text-xs mt-1">✓ Resolved: {d.resolvedVerdict}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Math Checks */}
            {result.mathChecks && result.mathChecks.length > 0 && (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Mathematical Verification</h3>
                {result.mathChecks.map((m, i) => (
                  <div key={i} className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-800 px-2 py-1 rounded text-xs text-violet-300">{m.expression}</code>
                      <span className="text-gray-500">=</span>
                      <code className="bg-gray-800 px-2 py-1 rounded text-xs text-emerald-300">{String(m.calculatedResult)}</code>
                      {m.isIndependentlyVerified && <span className="text-emerald-400 text-xs">✓ Verified</span>}
                    </div>
                    <p className="text-gray-600 text-xs">{m.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Sources */}
            {result.sources.length > 0 && (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Sources</h3>
                <div className="space-y-3">
                  {result.sources.map(s => (
                    <div key={s.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        {s.metadataUnavailable ? (
                          <p className="text-gray-500 text-xs">Metadata unavailable</p>
                        ) : (
                          <>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate block">{s.title}</a>
                            <p className="text-xs text-gray-500">{s.publisher}{s.date ? ` — ${s.date}` : ''}</p>
                          </>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        s.reliabilityScore > 0.8 ? 'bg-emerald-900/50 text-emerald-400' :
                        s.reliabilityScore > 0.5 ? 'bg-amber-900/50 text-amber-400' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {s.sourceType.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  saved 
                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' 
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                {saved ? '⭐ Saved' : '⭐ Save Answer'}
              </button>
              <button
                onClick={() => copyToClipboard(result.directAnswer)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-xl text-sm transition-colors"
              >
                📋 Copy Answer
              </button>
              <button
                onClick={() => {
                  const md = exportAsMarkdown(result);
                  const blob = new Blob([md], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'consensus-answer.md';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-gray-900 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-xl text-sm transition-colors"
              >
                📄 Export Markdown
              </button>
              <button
                onClick={() => { setResult(null); setError(null); textareaRef.current?.focus(); }}
                className="px-4 py-2 bg-gray-900 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-xl text-sm transition-colors"
              >
                🔄 New Question
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

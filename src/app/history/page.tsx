'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HistoryItem } from '@/types/consensus';
import { getHistory, removeFromHistory, clearHistory } from '@/utils/storage';

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    setItems(getHistory());
  };

  const handleClearAll = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
      setItems([]);
    }
  };

  const handleView = (item: HistoryItem) => {
    sessionStorage.setItem('consensus_replay', JSON.stringify({
      question: item.question,
      finalAnswer: item.finalAnswer,
    }));
    window.location.href = '/ask';
  };

  const confidenceColor = (level: string) => {
    if (level === 'High') return 'text-emerald-400';
    if (level === 'Moderate') return 'text-amber-400';
    if (level === 'Limited') return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Consensus AI
          </Link>
          <nav className="flex gap-4 text-sm text-gray-400">
            <Link href="/ask" className="hover:text-white transition-colors">Ask</Link>
            <Link href="/saved" className="hover:text-white transition-colors">Saved</Link>
            <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">History</h1>
          {items.length > 0 && (
            <button onClick={handleClearAll} className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📋</p>
            <p className="text-gray-400">No history yet.</p>
            <Link href="/ask" className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-sm font-medium">
              Ask your first question →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-gray-700 transition-colors">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleView(item)}>
                  <p className="text-white text-sm font-medium truncate mb-1">{item.question}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className={confidenceColor(item.confidenceLevel)}>{item.confidenceLevel}</span>
                    <span>{item.modelsCount} model(s)</span>
                    <span>{item.mode}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.finalAnswer.isDemo && <span className="text-amber-500">Demo</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 text-xs">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

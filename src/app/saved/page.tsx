'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SavedAnswer } from '@/types/consensus';
import { getSavedAnswers, removeSavedAnswer } from '@/utils/storage';
import { exportAsMarkdown, copyToClipboard } from '@/utils/export';

export default function SavedPage() {
  const [items, setItems] = useState<SavedAnswer[]>([]);

  useEffect(() => {
    setItems(getSavedAnswers());
  }, []);

  const handleRemove = (id: string) => {
    removeSavedAnswer(id);
    setItems(getSavedAnswers());
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
            <Link href="/history" className="hover:text-white transition-colors">History</Link>
            <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Saved Answers</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">⭐</p>
            <p className="text-gray-400">No saved answers yet.</p>
            <Link href="/ask" className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-sm font-medium">
              Ask a question →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map(item => (
              <div key={item.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                <p className="text-white text-sm font-medium mb-2 line-clamp-2">{item.question}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{item.finalAnswer.confidence.level} confidence</span>
                  <span>·</span>
                  <span>{new Date(item.savedAt).toLocaleDateString()}</span>
                  {item.finalAnswer.isDemo && <span className="text-amber-500">· Demo</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.finalAnswer.directAnswer)}
                    className="flex-1 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      const md = exportAsMarkdown(item.finalAnswer);
                      const blob = new Blob([md], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'answer.md'; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="py-1 px-2 text-xs bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

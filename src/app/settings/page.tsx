'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AppSettings, ProviderConfig } from '@/types/consensus';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '@/utils/storage';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    fetch('/api/providers').then(r => r.json()).then(setProviders).catch(() => {});
  }, []);

  const update = (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
  };

  const handleClearAll = () => {
    if (confirm('Clear all local data (history, saved answers, settings)? This cannot be undone.')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        setCleared(true);
        setSettings(DEFAULT_SETTINGS);
      }
    }
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
            <Link href="/saved" className="hover:text-white transition-colors">Saved</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Provider Status */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">AI Providers</h2>
          <div className="space-y-2">
            {providers.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-white">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.model}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  p.badgeStatus === 'connected' ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800' :
                  p.badgeStatus === 'limited' ? 'text-amber-400 bg-amber-900/30 border-amber-800' :
                  'text-gray-500 bg-gray-800/50 border-gray-700'
                }`}>
                  {p.badgeStatus === 'connected' ? '🟢' : p.badgeStatus === 'limited' ? '🟡' : '🔴'} {p.badgeStatus}
                </span>
              </div>
            ))}
            {providers.length === 0 && <p className="text-sm text-gray-500">Loading provider status...</p>}
          </div>
          <p className="mt-3 text-xs text-gray-600">Configure API keys via environment variables. See .env.example for details.</p>
        </section>

        {/* Mode Settings */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Defaults</h2>
          
          <div>
            <label className="text-xs text-gray-400 block mb-2">Default Mode</label>
            <select
              value={settings.defaultMode}
              onChange={e => update({ defaultMode: e.target.value as AppSettings['defaultMode'] })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {['quick', 'balanced', 'deep', 'academic', 'math', 'coding'].map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Verification Depth</label>
            <select
              value={settings.verificationDepth}
              onChange={e => update({ verificationDepth: e.target.value as AppSettings['verificationDepth'] })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="quick">Quick</option>
              <option value="balanced">Balanced</option>
              <option value="deep">Deep</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Response Style</label>
            <select
              value={settings.responseStyle}
              onChange={e => update({ responseStyle: e.target.value as AppSettings['responseStyle'] })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="concise">Concise</option>
              <option value="standard">Standard</option>
              <option value="detailed">Detailed</option>
              <option value="academic">Academic</option>
            </select>
          </div>
        </section>

        {/* History Settings */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">History & Privacy</h2>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-300">Save History</span>
            <button
              onClick={() => update({ saveHistory: !settings.saveHistory })}
              className={`w-10 h-6 rounded-full transition-colors relative ${settings.saveHistory ? 'bg-violet-600' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.saveHistory ? 'left-5' : 'left-1'}`} />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-300">Force Demo Mode</span>
            <button
              onClick={() => update({ demoModeOnly: !settings.demoModeOnly })}
              className={`w-10 h-6 rounded-full transition-colors relative ${settings.demoModeOnly ? 'bg-amber-600' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.demoModeOnly ? 'left-5' : 'left-1'}`} />
            </button>
          </label>

          {cleared ? (
            <p className="text-sm text-emerald-400">✓ All data cleared.</p>
          ) : (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-900/30 border border-red-800 text-red-400 rounded-lg text-sm hover:bg-red-900/50 transition-colors"
            >
              Clear All Local Data
            </button>
          )}
        </section>
      </main>
    </div>
  );
}

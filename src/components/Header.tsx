"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Cpu, Bookmark, History, Settings, HelpCircle, Sparkles, AlertCircle } from "lucide-react";
import { ProviderConfig } from "@/types/consensus";

interface HeaderProps {
  onOpenHowItWorks: () => void;
  onOpenSaved: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  savedCount: number;
  historyCount: number;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowItWorks,
  onOpenSaved,
  onOpenHistory,
  onOpenSettings,
  savedCount,
  historyCount,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  useEffect(() => {
    fetch("/api/providers/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) setProviders(data.providers);
      })
      .catch((err) => console.warn("Could not fetch provider status:", err));
  }, []);

  const connectedCount = providers.filter((p) => p.hasApiKey).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080b11]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Consensus AI</span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                v2.0 Frontier
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              One question. Multiple AIs. One carefully verified answer.
            </p>
          </div>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode Toggle Button */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              isDemoMode
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
            title="Toggle between Live Multi-Model API mode and High-Fidelity Demo Scenarios"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Demo Mode:</span>
            <span className={isDemoMode ? "font-bold text-amber-400" : "text-slate-300"}>
              {isDemoMode ? "Active" : "Off"}
            </span>
          </button>

          {/* Connected Providers Status Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
              title="Inspect active AI systems"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connectedCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              <Cpu className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Providers:</span>
              <span className="font-semibold text-white">
                {connectedCount}/{providers.length || 7}
              </span>
            </button>

            {showProviderMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#0f141c] p-3 shadow-2xl z-50">
                <div className="mb-2 flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-semibold text-white">AI Provider Telemetry</span>
                  <span className="text-[10px] text-slate-400">Strict Independence</span>
                </div>
                <div className="space-y-1.5">
                  {providers.length === 0 ? (
                    <div className="py-2 text-center text-xs text-slate-400">Loading providers...</div>
                  ) : (
                    providers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg bg-white/[0.02] p-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              p.hasApiKey ? "bg-emerald-400" : "bg-rose-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-slate-200">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.model}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            p.hasApiKey
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {p.hasApiKey ? "Connected" : "Offline"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <p className="mt-2 text-[10px] text-slate-400 border-t border-white/5 pt-2">
                  Never fabricated. Configure keys in Settings to connect models.
                </p>
              </div>
            )}
          </div>

          {/* How It Works */}
          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">Philosophy</span>
          </button>

          {/* Saved Answers */}
          <button
            onClick={onOpenSaved}
            className="relative flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Saved Answers"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Saved</span>
            {savedCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-400">
                {savedCount}
              </span>
            )}
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Query History"
          >
            <History className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-bold text-indigo-400">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            title="Settings & API Keys"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

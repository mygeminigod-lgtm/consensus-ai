"use client";

import React, { useState } from "react";
import { X, Key, Shield, Sliders, Database, Trash2, Check } from "lucide-react";
import { AnswerMode, AppSettings } from "@/types/consensus";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
}

const PROVIDER_LIST = [
  { id: "gemini", name: "Google Gemini", envName: "GOOGLE_AI_API_KEY", desc: "Multimodal frontier model" },
  { id: "openai", name: "OpenAI GPT-4o", envName: "OPENAI_API_KEY", desc: "Omni reasoning model" },
  { id: "anthropic", name: "Anthropic Claude 3.5", envName: "ANTHROPIC_API_KEY", desc: "Nuanced analysis and code reasoning" },
  { id: "deepseek", name: "DeepSeek-V3", envName: "DEEPSEEK_API_KEY", desc: "Mathematical and logical reasoning" },
  { id: "mistral", name: "Mistral Large", envName: "MISTRAL_API_KEY", desc: "Frontier precision reasoning" },
  { id: "perplexity", name: "Perplexity Sonar", envName: "PERPLEXITY_API_KEY", desc: "Web search and real-time citations" },
  { id: "xai", name: "xAI Grok 2", envName: "XAI_API_KEY", desc: "Truth-seeking reasoning" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllData,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<"providers" | "verification" | "privacy">("providers");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleProviderToggle = (id: string, enabled: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [id]: {
          ...prev.providers[id],
          enabled,
        },
      },
    }));
  };

  const handleCustomKeyChange = (id: string, key: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [id]: {
          ...prev.providers[id],
          customApiKey: key,
        },
      },
    }));
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c1017] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Platform Settings & Credentials</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/5 py-3 text-xs">
          <button
            onClick={() => setActiveTab("providers")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === "providers"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            AI Providers & Keys
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === "verification"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            Verification & Style
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === "privacy"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            Privacy & Storage
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeTab === "providers" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Configure API keys locally in browser storage or server environment variables. Never committed to git.
              </p>

              {PROVIDER_LIST.map((p) => {
                const providerState = localSettings.providers[p.id] || { enabled: true };
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="ml-2 text-[10px] text-slate-500">Env: {p.envName}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={providerState.enabled}
                          onChange={(e) => handleProviderToggle(p.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <input
                        type="password"
                        placeholder="Paste custom API key (or leave empty to use server env)"
                        value={providerState.customApiKey || ""}
                        onChange={(e) => handleCustomKeyChange(p.id, e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "verification" && (
            <div className="space-y-4 text-xs">
              {/* Verification Depth */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Default Verification Depth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["quick", "balanced", "deep"] as const).map((depth) => (
                    <button
                      key={depth}
                      type="button"
                      onClick={() => setLocalSettings((p) => ({ ...p, verificationDepth: depth }))}
                      className={`rounded-lg border p-2 text-center capitalize transition-colors ${
                        localSettings.verificationDepth === depth
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {depth}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Style */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1">Synthesis Style</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["concise", "standard", "detailed", "academic"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setLocalSettings((p) => ({ ...p, responseStyle: style }))}
                      className={`rounded-lg border p-2 text-center capitalize transition-colors ${
                        localSettings.responseStyle === style
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Citation Style */}
              <div>
                <label className="font-semibold text-slate-200 block mb-1">Citation Format</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {(["none", "links", "apa", "mla", "chicago"] as const).map((cite) => (
                    <button
                      key={cite}
                      type="button"
                      onClick={() => setLocalSettings((p) => ({ ...p, citationStyle: cite }))}
                      className={`rounded-lg border p-2 text-center uppercase transition-colors ${
                        localSettings.citationStyle === cite
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {cite}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Save Inquiries Locally</h4>
                  <p className="text-[11px] text-slate-400">
                    Persist your verified inquiries and synthesized answers in browser storage.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.saveHistory}
                    onChange={(e) =>
                      setLocalSettings((p) => ({ ...p, saveHistory: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-rose-400" />
                  <span>Clear All Local Storage</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Erase all stored API keys, query history, saved consensus answers, and preferences.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to erase all local data?")) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="mt-3 flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Erase All Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500"
          >
            {savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

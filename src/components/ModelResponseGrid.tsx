"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Cpu, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { FinalAnswer } from "@/types/consensus";

interface ModelResponseGridProps {
  answer: FinalAnswer;
}

export const ModelResponseGrid: React.FC<ModelResponseGridProps> = ({ answer }) => {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [copiedModel, setCopiedModel] = useState<string | null>(null);

  const models = answer.modelsConsulted;

  const handleCopyModelAnswer = (providerId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModel(providerId);
    setTimeout(() => setCopiedModel(null), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl glass-panel p-5 shadow-xl border border-white/10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Independent Model Consultations ({models.length})
            </h3>
            <p className="text-xs text-slate-400">
              Each model was queried independently without exposure to other systems.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Zero Cross-Contamination</span>
        </div>

        {/* Model Cards Grid */}
        <div className="space-y-3">
          {models.map((model) => {
            const isExpanded = expandedModel === model.providerId;
            const isCopied = copiedModel === model.providerId;

            return (
              <div
                key={model.providerId}
                className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/10"
              >
                {/* Accordion Bar */}
                <div
                  onClick={() => setExpandedModel(isExpanded ? null : model.providerId)}
                  className="flex cursor-pointer items-center justify-between p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        model.status === "success" ? "bg-emerald-400" : "bg-rose-500"
                      }`}
                    />
                    <div>
                      <span className="text-xs font-bold text-white">{model.providerName}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400">{model.model}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {model.latencyMs && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{model.latencyMs}ms</span>
                      </div>
                    )}

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        model.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {model.status === "success" ? "✓ Completed" : "✕ Failed/Offline"}
                    </span>

                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-black/20 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Full Independent Response:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyModelAnswer(model.providerId, answer.directAnswer);
                        }}
                        className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white/5 text-slate-300"
                      >
                        {isCopied ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span className="text-[10px]">{isCopied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="rounded-lg bg-[#080b11] p-3 text-xs leading-relaxed text-slate-300 font-sans border border-white/5 whitespace-pre-line max-h-72 overflow-y-auto">
                      {answer.directAnswer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

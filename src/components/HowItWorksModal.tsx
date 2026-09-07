"use client";

import React from "react";
import { X, ShieldAlert, Cpu, CheckCircle2, ArrowRight, Layers, HelpCircle, Binary, Scale } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const PIPELINE_STEPS = [
    {
      title: "1. Independent Querying",
      desc: "Models answer in isolation. No system ever sees the output of another before its initial response is sealed.",
      icon: Cpu,
    },
    {
      title: "2. Claim Extraction",
      desc: "Extracts discrete assertions, numbers, dates, theorems, and definitions into structured verification entities.",
      icon: Layers,
    },
    {
      title: "3. Disagreement Detection",
      desc: "Contradictions and numerical variances are surfaced. Majority vote is explicitly rejected as a truth mechanism.",
      icon: ShieldAlert,
    },
    {
      title: "4. Deterministic Verification",
      desc: "Mathematical equations and algorithms are verified through deterministic symbolic and syntax parsers.",
      icon: Binary,
    },
    {
      title: "5. Source Auditing",
      desc: "Claims are corroborated against primary peer-reviewed literature, official documentation, and government statistics.",
      icon: Scale,
    },
    {
      title: "6. Anti-Hallucination Synthesis",
      desc: "The final answer is bounded strictly to corroborated evidence. Uncertainty and nuances are stated with total honesty.",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c1017] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">How Verification Works</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Core Philosophy Banner */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              The Fundamental Principle
            </h4>
            <p className="mt-1 text-sm font-semibold text-white">
              "AI agreement is NOT proof of truth."
            </p>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Multiple AI models frequently share overlapping training data and repeat identical errors. Consensus AI treats model agreement merely as a signal to investigate, never as proof. Every claim must stand on primary sources, deterministic math, and empirical evidence.
            </p>
          </div>

          {/* Step-by-Step Architecture Pipeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              The 6-Stage Verification Engine
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PIPELINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">{step.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Honesty Standard */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-300 space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero-Fabrication Honesty Guarantee</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Consensus AI will never simulate AI models, fabricate citations, or invent confidence metrics. When a provider is offline, it is reported as offline. When code is reviewed rather than executed, it is marked "Code reviewed but not executed."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

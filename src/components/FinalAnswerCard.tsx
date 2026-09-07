"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  FileDown,
  Info,
  Sparkles,
} from "lucide-react";
import { FinalAnswer } from "@/types/consensus";

interface FinalAnswerCardProps {
  answer: FinalAnswer;
  onSave: () => void;
  isSaved: boolean;
  onExport: (format: "markdown" | "text") => void;
}

export const FinalAnswerCard: React.FC<FinalAnswerCardProps> = ({
  answer,
  onSave,
  isSaved,
  onExport,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `# ${answer.question}\n\n## Answer\n${answer.directAnswer}\n\n## Why\n${answer.whyExplanation}\n\n## Evidence\n${answer.evidenceSummary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case "High":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          dot: "bg-emerald-400",
          icon: CheckCircle2,
        };
      case "Moderate":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          dot: "bg-amber-400",
          icon: Info,
        };
      case "Limited":
        return {
          bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
          dot: "bg-orange-400",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          dot: "bg-rose-400",
          icon: AlertTriangle,
        };
    }
  };

  const confBadge = getConfidenceBadge(answer.confidence.level);
  const supportedClaimsCount = answer.claims.filter(
    (c) => c.verificationStatus === "confirmed" || c.verificationStatus === "supported"
  ).length;
  const uncertainClaimsCount = answer.claims.filter(
    (c) => c.verificationStatus === "unverified" || c.verificationStatus === "disputed"
  ).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl glass-panel p-6 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Demo Mode Explicit Disclaimer */}
        {answer.isDemo && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/15 p-3 text-xs font-semibold text-amber-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              Demo response — not generated live. Run with configured API keys in Settings for real-time model synthesis.
            </span>
          </div>
        )}

        {/* Top Header: Question, Confidence Badge, Action Buttons */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                Verified Consensus Answer
              </span>
              <span className="text-[11px] text-slate-500">•</span>
              <span className="text-[11px] text-slate-400 capitalize">{answer.mode} mode</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{answer.question}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Answer Button */}
            <button
              onClick={onSave}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                isSaved
                  ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
              title="Save this verified answer"
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-amber-400 text-amber-400" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Answer"}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            {/* Export Markdown */}
            <button
              onClick={() => onExport("markdown")}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              title="Export as Markdown"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* 1. Direct Answer */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Answer</div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-slate-100 text-base leading-relaxed sm:text-lg">
            {answer.directAnswer}
          </div>
        </div>

        {/* 2. Why Explanation */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Why</div>
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {answer.whyExplanation}
          </div>
        </div>

        {/* 3. Evidence Summary */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Evidence</div>
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {answer.evidenceSummary}
          </div>
        </div>

        {/* 4. Verification Stats & Confidence Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/5 pt-5 sm:grid-cols-2">
          {/* Verification Metrics */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Verification Metrics
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{answer.modelsConsulted.length} independent models compared</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{answer.claims.length} factual claims extracted</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{supportedClaimsCount} claims independently supported</span>
              </li>
              {uncertainClaimsCount > 0 && (
                <li className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>{uncertainClaimsCount} claims remain uncertain or disputed</span>
                </li>
              )}
            </ul>
          </div>

          {/* Confidence Assessment */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Confidence Assessment</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${confBadge.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${confBadge.dot}`} />
                {answer.confidence.level} ({Math.round(answer.confidence.score * 100)}%)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{answer.confidence.rationale}</p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Anti-Hallucination Score: {answer.consistencyCheck.antiHallucinationScore}/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

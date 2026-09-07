"use client";

import React from "react";
import { Calculator, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { MathVerificationCheck } from "@/types/consensus";

interface MathVerificationPanelProps {
  mathChecks?: MathVerificationCheck[];
}

export const MathVerificationPanel: React.FC<MathVerificationPanelProps> = ({ mathChecks }) => {
  if (!mathChecks || mathChecks.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl glass-panel p-5 shadow-xl border border-cyan-500/20">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Deterministic Mathematical Verification
              </h3>
              <p className="text-xs text-slate-400">
                Independent symbolic & numeric calculation compared directly against AI model solutions.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
            Isolated Calculator Engine
          </span>
        </div>

        <div className="space-y-4">
          {mathChecks.map((check, idx) => (
            <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-300 text-sm font-semibold">
                  Expression: {check.expression}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    check.isIndependentlyVerified
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {check.isIndependentlyVerified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>✓ Independently verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      <span>⚠ Discrepancy observed</span>
                    </>
                  )}
                </span>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
                {check.modelResults.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs text-center"
                  >
                    <span className="text-[10px] font-semibold text-slate-400">{m.providerName}</span>
                    <div className="my-1 font-mono text-sm font-bold text-white">
                      {String(m.extractedResult)}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        m.matchesCalculator ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {m.matchesCalculator ? "✓ Matches" : "✕ Diverges"}
                    </span>
                  </div>
                ))}

                {/* Deterministic Calculator Result */}
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-xs text-center">
                  <span className="text-[10px] font-semibold text-cyan-300">Deterministic Engine</span>
                  <div className="my-1 font-mono text-sm font-bold text-cyan-200">
                    {String(check.calculatedResult)}
                  </div>
                  <span className="text-[10px] font-medium text-cyan-400">Ground Truth</span>
                </div>
              </div>

              {/* Explanation & Discrepancies */}
              <p className="text-xs text-slate-300 leading-relaxed">{check.explanation}</p>
              {check.discrepancies.length > 0 && (
                <div className="mt-2 text-xs text-amber-300 font-medium">
                  <strong>Notice:</strong> {check.discrepancies.join("; ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

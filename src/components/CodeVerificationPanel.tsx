"use client";

import React from "react";
import { Code2, CheckCircle2, AlertTriangle, ShieldCheck, Terminal } from "lucide-react";
import { CodeVerificationCheck } from "@/types/consensus";

interface CodeVerificationPanelProps {
  codeChecks?: CodeVerificationCheck[];
}

export const CodeVerificationPanel: React.FC<CodeVerificationPanelProps> = ({ codeChecks }) => {
  if (!codeChecks || codeChecks.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl glass-panel p-5 shadow-xl border border-indigo-500/20">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Code Reasoning & Verification Status
              </h3>
              <p className="text-xs text-slate-400">
                Syntax inspection and strict transparency regarding sandbox execution.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300">
            Honest Execution Reporting
          </span>
        </div>

        <div className="space-y-4">
          {codeChecks.map((check, idx) => (
            <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs text-indigo-300 uppercase font-semibold">
                  Language: {check.language || "Unspecified"}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    check.executed
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                  }`}
                >
                  {check.executed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Code Executed</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3 w-3" />
                      <span>Code Reviewed (Not Executed)</span>
                    </>
                  )}
                </span>
              </div>

              {/* Code Snippet Preview */}
              <div className="rounded-lg bg-black/50 p-3 font-mono text-xs text-slate-300 overflow-x-auto border border-white/5 mb-3">
                <pre>{check.code}</pre>
              </div>

              {/* Status Report Notice */}
              <div className="rounded-lg border border-white/5 bg-white/[0.01] p-3 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold text-white">Execution Status:</span>
                  <span className="text-indigo-300 font-medium">{check.statusReport}</span>
                </div>

                {check.reviewNotes.length > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    {check.reviewNotes.map((note, nIdx) => (
                      <li key={nIdx}>{note}</li>
                    ))}
                  </ul>
                )}

                {check.executionOutput && (
                  <div className="mt-2 rounded bg-black/40 p-2 font-mono text-[11px] text-emerald-400">
                    <span className="text-slate-500">Output: </span>
                    {check.executionOutput}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

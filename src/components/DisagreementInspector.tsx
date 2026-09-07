"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { Disagreement } from "@/types/consensus";

interface DisagreementInspectorProps {
  disagreements: Disagreement[];
}

export const DisagreementInspector: React.FC<DisagreementInspectorProps> = ({ disagreements }) => {
  if (!disagreements || disagreements.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl border border-amber-500/30 bg-[#16120b]/90 p-5 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">⚠️ Active Disagreement Detected</h3>
              <p className="text-xs text-amber-400/80">
                AI agreement is NOT proof of truth. Models provided diverging facts or numbers.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
            {disagreements.length} Discrepanc{disagreements.length === 1 ? "y" : "ies"}
          </span>
        </div>

        <div className="space-y-4">
          {disagreements.map((dis) => (
            <div
              key={dis.id}
              className="rounded-xl border border-amber-500/20 bg-black/30 p-4"
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Disputed Assertion:</span>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {dis.type.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium mb-3">"{dis.claimText}"</p>

              {/* Competing Model Positions */}
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {dis.modelPositions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs"
                  >
                    <span className="font-bold text-amber-300">{pos.providerName}:</span>
                    <p className="mt-1 text-slate-300">{pos.position}</p>
                  </div>
                ))}
              </div>

              {/* Resolution Strategy */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Consensus Resolution Strategy (No Majority Vote):</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-100/90">{dis.resolutionStrategy}</p>
                {dis.resolvedVerdict && (
                  <p className="mt-1.5 font-medium text-emerald-300">
                    <strong>Verdict:</strong> {dis.resolvedVerdict}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

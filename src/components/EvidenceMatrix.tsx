"use client";

import React, { useState } from "react";
import { Check, X, HelpCircle, AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Claim, FinalAnswer, VerificationResult } from "@/types/consensus";

interface EvidenceMatrixProps {
  answer: FinalAnswer;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({ answer }) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const claims = answer.claims;
  const models = answer.modelsConsulted;

  const getModelStatusForClaim = (claim: Claim, providerId: string) => {
    if (claim.supportingModels.includes(providerId)) {
      return { icon: Check, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Supported" };
    }
    if (claim.contradictingModels.includes(providerId)) {
      return { icon: X, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", label: "Contradicted" };
    }
    return { icon: HelpCircle, color: "text-slate-500 bg-white/[0.02] border-white/5", label: "Silent/Unverified" };
  };

  const getVerificationBadge = (verdict?: VerificationResult["verdict"] | Claim["verificationStatus"]) => {
    switch (verdict) {
      case "confirmed":
        return { text: "Confirmed", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: Check };
      case "supported":
        return { text: "Supported", bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", icon: Check };
      case "disputed":
        return { text: "Disputed", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: AlertTriangle };
      case "contradicted":
        return { text: "Contradicted", bg: "bg-rose-500/10 text-rose-400 border-rose-500/30", icon: X };
      default:
        return { text: "Uncertain", bg: "bg-slate-500/10 text-slate-400 border-slate-500/30", icon: HelpCircle };
    }
  };

  const activeClaim = claims.find((c) => c.id === selectedClaimId);
  const activeVerification = answer.verificationResults.find((v) => v.claimId === selectedClaimId);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl glass-panel p-5 shadow-xl border border-white/10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase">Independent Evidence Matrix</h3>
            <p className="text-xs text-slate-400">
              Cross-model claim corroboration & empirical verification. Click any row to inspect proof.
            </p>
          </div>
          <span className="text-[10px] text-slate-400">Total Claims: {claims.length}</span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-semibold text-slate-400">
                <th className="p-3">Claim Assertion</th>
                {models.map((m) => (
                  <th key={m.providerId} className="p-3 text-center whitespace-nowrap">
                    {m.providerName.split(" ")[0]}
                  </th>
                ))}
                <th className="p-3 text-right">Evidence Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={models.length + 2} className="p-4 text-center text-slate-500">
                    No discrete factual claims extracted for this query.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => {
                  const verification = answer.verificationResults.find((v) => v.claimId === claim.id);
                  const badge = getVerificationBadge(verification?.verdict);
                  const isSelected = selectedClaimId === claim.id;

                  return (
                    <tr
                      key={claim.id}
                      onClick={() => setSelectedClaimId(isSelected ? null : claim.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-cyan-500/10" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <ChevronDown className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="font-medium text-slate-200 line-clamp-1">{claim.text}</span>
                        </div>
                      </td>

                      {models.map((m) => {
                        const status = getModelStatusForClaim(claim, m.providerId);
                        const Icon = status.icon;
                        return (
                          <td key={m.providerId} className="p-3 text-center">
                            <div className="inline-flex items-center justify-center">
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${status.color}`}
                                title={`${m.providerName}: ${status.label}`}
                              >
                                <Icon className="h-3 w-3" />
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.bg}`}
                        >
                          <badge.icon className="h-2.5 w-2.5" />
                          {badge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Claim Drilldown Modal / Inspector */}
        {activeClaim && (
          <div className="mt-4 rounded-xl border border-cyan-500/30 bg-[#0b1017] p-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-cyan-400">Claim Evidence Drilldown</span>
              <span className="text-[10px] text-slate-400">ID: {activeClaim.id}</span>
            </div>

            <p className="mt-2 text-xs font-semibold text-white">{activeClaim.text}</p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-white/[0.02] p-2.5 border border-white/5">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Supporting Models</span>
                <p className="mt-1 text-slate-300">
                  {activeClaim.supportingModels.length > 0
                    ? activeClaim.supportingModels.join(", ")
                    : "None directly cited"}
                </p>
              </div>

              <div className="rounded-lg bg-white/[0.02] p-2.5 border border-white/5">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Verification Reasoning</span>
                <p className="mt-1 text-slate-300">
                  {activeVerification?.reasoning || "Cross-model heuristic convergence."}
                </p>
              </div>
            </div>

            {/* Evidence items */}
            {activeVerification?.evidence && activeVerification.evidence.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Documented Evidence</span>
                <div className="mt-1 space-y-1.5">
                  {activeVerification.evidence.map((ev) => (
                    <div key={ev.id} className="rounded-lg border border-white/5 bg-white/[0.01] p-2 text-xs">
                      <p className="text-slate-300 italic">"{ev.snippet}"</p>
                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
                        >
                          <span>{ev.sourceTitle || ev.sourceUrl}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

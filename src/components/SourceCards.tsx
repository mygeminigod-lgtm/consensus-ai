"use client";

import React from "react";
import { ExternalLink, BookOpen, ShieldCheck, CheckCircle2, FileText } from "lucide-react";
import { Source } from "@/types/consensus";

interface SourceCardsProps {
  sources: Source[];
}

export const SourceCards: React.FC<SourceCardsProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const getReliabilityBadge = (indicator: Source["reliabilityIndicator"]) => {
    switch (indicator) {
      case "primary_peer_reviewed":
        return {
          label: "Primary Peer-Reviewed",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "official_doc":
        return {
          label: "Official Documentation",
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        };
      case "verified_news":
        return {
          label: "Verified Primary Reporting",
          color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
        };
      default:
        return {
          label: "Secondary Source",
          color: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        };
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl glass-panel p-5 shadow-xl border border-white/10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Authoritative Sources ({sources.length})
            </h3>
            <p className="text-xs text-slate-400">
              Citations audited against peer-reviewed journals, official standards, and primary datasets.
            </p>
          </div>
          <span className="text-[10px] text-slate-500">No AI answers as sources</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sources.map((source) => {
            const relBadge = getReliabilityBadge(source.reliabilityIndicator);

            return (
              <div
                key={source.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${relBadge.color}`}
                    >
                      {relBadge.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {source.date || "Metadata unavailable"}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2">{source.title}</h4>
                  <p className="mt-1 text-[11px] text-slate-400">{source.publisher}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Supports: {source.supportsClaims.join(", ") || "General consensus"}
                  </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

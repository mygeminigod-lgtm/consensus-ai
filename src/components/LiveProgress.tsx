"use client";

import React from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { PipelineStage } from "@/types/consensus";

interface LiveProgressProps {
  currentStage: PipelineStage;
  message: string;
  progressPercent: number;
}

const STAGES: { id: PipelineStage; label: string }[] = [
  { id: "understanding_question", label: "Understanding question" },
  { id: "selecting_models", label: "Selecting models" },
  { id: "querying_models", label: "Querying models" },
  { id: "comparing_responses", label: "Comparing responses" },
  { id: "extracting_claims", label: "Extracting claims" },
  { id: "detecting_disagreements", label: "Detecting disagreements" },
  { id: "verifying_evidence", label: "Checking evidence & sources" },
  { id: "performing_calculations", label: "Performing deterministic checks" },
  { id: "synthesizing_answer", label: "Synthesizing answer" },
  { id: "final_verification", label: "Final verification pass" },
];

export const LiveProgress: React.FC<LiveProgressProps> = ({
  currentStage,
  message,
  progressPercent,
}) => {
  const getStageIndex = (stage: PipelineStage) => {
    return STAGES.findIndex((s) => s.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 my-6">
      <div className="rounded-2xl glass-panel p-5 border border-cyan-500/20 shadow-xl">
        {/* Stage Header & Progress Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span className="text-sm font-semibold text-white">Live Verification Pipeline</span>
          </div>
          <span className="text-xs font-mono text-cyan-400">{progressPercent}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800 mb-5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Active Stage Status Message */}
        <div className="mb-5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 text-xs text-cyan-300 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{message || "Processing request..."}</span>
        </div>

        {/* Real Status Stages Grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentIndex > idx || currentStage === "complete";
            const isCurrent = currentIndex === idx && currentStage !== "complete";

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-2.5 rounded-lg p-2 text-xs transition-colors ${
                  isCurrent
                    ? "bg-cyan-500/10 text-cyan-300 font-medium"
                    : isCompleted
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-700 shrink-0" />
                )}
                <span>{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

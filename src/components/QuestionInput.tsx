"use client";

import React, { useState, useRef } from "react";
import {
  Send,
  Zap,
  Scale,
  Search,
  GraduationCap,
  Calculator,
  Code2,
  Paperclip,
  Globe,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { AnswerMode } from "@/types/consensus";

interface QuestionInputProps {
  onSubmit: (params: {
    question: string;
    mode: AnswerMode;
    documentContext?: string;
    sourceUrl?: string;
  }) => void;
  isLoading: boolean;
  onOpenHowItWorks: () => void;
  isDemoMode: boolean;
}

const MODES: { id: AnswerMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "quick", label: "Quick", icon: Zap, desc: "Fast multi-model check" },
  { id: "balanced", label: "Balanced", icon: Scale, desc: "Standard multi-model verification" },
  { id: "deep", label: "Deep Verify", icon: Search, desc: "Deep claim & disagreement audit" },
  { id: "academic", label: "Academic", icon: GraduationCap, desc: "Peer-reviewed & primary citations" },
  { id: "math", label: "Math", icon: Calculator, desc: "Deterministic calculation engine" },
  { id: "coding", label: "Coding", icon: Code2, desc: "Code syntax & execution status" },
];

const SUGGESTIONS = [
  { text: "Does quantum entanglement allow faster-than-light communication?", mode: "academic" as AnswerMode },
  { text: "What is the population of Tokyo?", mode: "balanced" as AnswerMode },
  { text: "Solve 4x - 8 = 24 and verify step-by-step.", mode: "math" as AnswerMode },
  { text: "Compare Python and Rust memory management and explain how Rust prevents data races without a GC.", mode: "coding" as AnswerMode },
];

export const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  isLoading,
  onOpenHowItWorks,
  isDemoMode,
}) => {
  const [question, setQuestion] = useState("");
  const [selectedMode, setSelectedMode] = useState<AnswerMode>("balanced");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleFormSubmit = () => {
    if (!question.trim() || isLoading) return;
    onSubmit({
      question: question.trim(),
      mode: selectedMode,
      documentContext: uploadedFile?.content,
      sourceUrl: sourceUrl.trim() || undefined,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadedFile({
          name: file.name,
          content: data.wrappedContext,
        });
      } else {
        alert(data.error || "File upload failed");
      }
    } catch (err: unknown) {
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const focusInput = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Hero Headline Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Independent AI Verification Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          One question. Multiple AIs. <br />
          <span className="text-gradient">One carefully verified answer.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
          Consensus AI compares independent AI responses, checks evidence, detects disagreements,
          and synthesizes the strongest answer available.
        </p>

        {/* Hero CTAs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={focusInput}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all active:scale-95"
          >
            Ask a Question
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenHowItWorks}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            See How Verification Works
          </button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>DEMO MODE ACTIVE:</strong> Using pre-computed benchmark consensus scenarios with deterministic math and discrepancy detection. Responses are labeled explicitly.
            </span>
          </div>
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative rounded-2xl glass-panel p-3 sm:p-4 shadow-2xl focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-cyan-500/40 transition-all">
        {/* Uploaded File Chip */}
        {uploadedFile && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
            <FileText className="h-4 w-4 text-cyan-400" />
            <span className="font-medium">{uploadedFile.name}</span>
            <span className="text-[10px] text-slate-400">(Treated as untrusted context)</span>
            <button
              onClick={() => setUploadedFile(null)}
              className="ml-auto text-slate-400 hover:text-rose-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Optional URL Input */}
        {showUrlInput && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
            <Globe className="h-4 w-4 text-cyan-400 shrink-0" />
            <input
              type="url"
              placeholder="https://example.com/source-to-verify"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />
            <button
              onClick={() => setShowUrlInput(false)}
              className="text-slate-400 hover:text-rose-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Question Text Area */}
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… (e.g. quantum physics, calculus, population statistics, code comparison)"
          rows={3}
          className="w-full resize-none bg-transparent text-base text-white outline-none placeholder:text-slate-500"
          disabled={isLoading}
        />

        {/* Action Controls & Mode Selector */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
          {/* Left Buttons: Attach File, Add URL */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.docx,.md,.json,.js,.py,.rs"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200"
              title="Attach document (TXT, PDF, DOCX, Code)"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isUploading ? "Uploading..." : "Attach Document"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showUrlInput ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
              title="Verify specific external URL"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reference URL</span>
            </button>
          </div>

          {/* Right Button: Verify Answer */}
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={!question.trim() || isLoading}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-md transition-all ${
              !question.trim() || isLoading
                ? "cursor-not-allowed bg-slate-800 text-slate-500"
                : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/25 active:scale-95"
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Answer</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Answer Modes Selector */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
            Verification Mode
          </span>
          <span>{MODES.find((m) => m.id === selectedMode)?.desc}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/20"
                    : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="mt-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Try a Benchmark Scenario:
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(item.text);
                setSelectedMode(item.mode);
              }}
              className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-white/5 hover:text-cyan-300 transition-all text-left"
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

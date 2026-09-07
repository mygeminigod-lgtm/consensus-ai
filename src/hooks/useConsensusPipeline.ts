"use client";

import { useState, useCallback } from "react";
import {
  AnswerMode,
  AppSettings,
  FinalAnswer,
  HistoryItem,
  PipelineProgressEvent,
  PipelineStage,
  SavedAnswer,
} from "@/types/consensus";
import { useLocalStorage } from "./useLocalStorage";
import { DEMO_SCENARIOS } from "@/lib/demo/demo-scenarios";

const DEFAULT_SETTINGS: AppSettings = {
  providers: {
    gemini: { enabled: true },
    openai: { enabled: true },
    anthropic: { enabled: true },
    deepseek: { enabled: true },
    mistral: { enabled: true },
    perplexity: { enabled: true },
    xai: { enabled: true },
  },
  verificationDepth: "balanced",
  defaultMode: "balanced",
  responseStyle: "standard",
  citationStyle: "links",
  saveHistory: true,
  demoModeOnly: true, // Default to demo mode for out-of-the-box experience without keys
};

export function useConsensusPipeline() {
  const [currentAnswer, setCurrentAnswer] = useState<FinalAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgressEvent>({
    stage: "idle",
    message: "",
    progressPercent: 0,
  });

  const [settings, setSettings] = useLocalStorage<AppSettings>(
    "consensus_settings",
    DEFAULT_SETTINGS
  );
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("consensus_history", []);
  const [savedAnswers, setSavedAnswers] = useLocalStorage<SavedAnswer[]>(
    "consensus_saved_answers",
    []
  );

  const verifyQuestion = useCallback(
    async (params: {
      question: string;
      mode: AnswerMode;
      documentContext?: string;
      sourceUrl?: string;
    }) => {
      const { question, mode, documentContext, sourceUrl } = params;
      setIsLoading(true);
      setError(null);
      setCurrentAnswer(null);
      setPipelineProgress({
        stage: "understanding_question",
        message: "Understanding question & analyzing domain...",
        progressPercent: 10,
      });

      try {
        // Collect custom API keys from settings
        const customKeys: { [key: string]: string } = {};
        const enabledProviders: string[] = [];
        Object.entries(settings.providers).forEach(([id, cfg]) => {
          if (cfg.enabled) enabledProviders.push(id);
          if (cfg.customApiKey) customKeys[id] = cfg.customApiKey;
        });

        const response = await fetch("/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            question,
            mode,
            documentContext,
            customKeys,
            enabledProviders,
            isDemo: settings.demoModeOnly,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream reader not available");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            const dataMatch = block.match(/^data:\s*(.+)$/m);
            if (dataMatch) {
              try {
                const eventData: PipelineProgressEvent = JSON.parse(dataMatch[1]);
                setPipelineProgress(eventData);

                if (eventData.stage === "complete" && eventData.data) {
                  const verifiedAnswer = eventData.data as FinalAnswer;
                  setCurrentAnswer(verifiedAnswer);

                  // Add to history if enabled
                  if (settings.saveHistory) {
                    setHistory((prev) => [
                      {
                        id: verifiedAnswer.id,
                        question: verifiedAnswer.question,
                        mode: verifiedAnswer.mode,
                        createdAt: verifiedAnswer.createdAt,
                        confidenceLevel: verifiedAnswer.confidence.level,
                        modelsCount: verifiedAnswer.modelsConsulted.length,
                        finalAnswer: verifiedAnswer,
                      },
                      ...prev.slice(0, 49), // Keep latest 50
                    ]);
                  }
                } else if (eventData.stage === "error") {
                  setError(eventData.message);
                }
              } catch (e) {
                console.warn("Failed to parse SSE chunk:", block);
              }
            }
          }
        }
      } catch (err: unknown) {
        console.error("Verification pipeline error:", err);
        setError((err as Error).message || "Verification failed");
      } finally {
        setIsLoading(false);
      }
    },
    [settings, setHistory]
  );

  const toggleSaveAnswer = (answer: FinalAnswer) => {
    const exists = savedAnswers.some((s) => s.id === answer.id || s.question === answer.question);
    if (exists) {
      setSavedAnswers((prev) =>
        prev.filter((s) => s.id !== answer.id && s.question !== answer.question)
      );
    } else {
      setSavedAnswers((prev) => [
        {
          id: answer.id,
          question: answer.question,
          finalAnswer: answer,
          savedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const clearAllHistory = () => {
    setHistory([]);
  };

  const deleteSavedAnswer = (id: string) => {
    setSavedAnswers((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAllData = () => {
    setHistory([]);
    setSavedAnswers([]);
    setSettings(DEFAULT_SETTINGS);
    setCurrentAnswer(null);
  };

  const toggleDemoMode = () => {
    setSettings((prev) => ({
      ...prev,
      demoModeOnly: !prev.demoModeOnly,
    }));
  };

  return {
    currentAnswer,
    setCurrentAnswer,
    isLoading,
    error,
    pipelineProgress,
    settings,
    setSettings,
    history,
    savedAnswers,
    verifyQuestion,
    toggleSaveAnswer,
    deleteHistoryItem,
    clearAllHistory,
    deleteSavedAnswer,
    clearAllData,
    toggleDemoMode,
  };
}

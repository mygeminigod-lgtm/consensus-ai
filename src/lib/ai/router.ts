import { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { DeepSeekProvider } from "./providers/deepseek";
import { MistralProvider } from "./providers/mistral";
import { PerplexityProvider } from "./providers/perplexity";
import { XAIProvider } from "./providers/xai";
import { AnswerMode, QuestionAnalysis } from "@/types/consensus";

export class ModelRouter {
  public static getAllProviders(customKeys?: { [providerId: string]: string }): AIProvider[] {
    return [
      new GeminiProvider(customKeys?.["gemini"]),
      new OpenAIProvider(customKeys?.["openai"]),
      new AnthropicProvider(customKeys?.["anthropic"]),
      new DeepSeekProvider(customKeys?.["deepseek"]),
      new MistralProvider(customKeys?.["mistral"]),
      new PerplexityProvider(customKeys?.["perplexity"]),
      new XAIProvider(customKeys?.["xai"]),
    ];
  }

  /**
   * Intelligently selects appropriate AI providers based on question analysis, selected mode,
   * and user configuration.
   */
  public static selectProviders(params: {
    analysis: QuestionAnalysis;
    mode: AnswerMode;
    availableProviders: AIProvider[];
    enabledProviderIds?: string[];
  }): AIProvider[] {
    const { analysis, mode, availableProviders, enabledProviderIds } = params;

    // Filter by user-enabled provider settings if provided
    let candidatePool = availableProviders;
    if (enabledProviderIds && enabledProviderIds.length > 0) {
      candidatePool = candidatePool.filter((p) => enabledProviderIds.includes(p.id));
    }

    if (candidatePool.length === 0) {
      return availableProviders.slice(0, 3);
    }

    // 1. Math Mode or Math Domain
    if (mode === "math" || analysis.domain === "mathematics" || analysis.requiresCalculation) {
      // Prioritize DeepSeek, Gemini, OpenAI, Anthropic
      const mathPriority = ["deepseek", "gemini", "openai", "anthropic", "mistral", "perplexity", "xai"];
      const selected = candidatePool
        .filter((p) => mathPriority.includes(p.id))
        .sort((a, b) => mathPriority.indexOf(a.id) - mathPriority.indexOf(b.id));

      return selected.slice(0, mode === "quick" ? 2 : 4);
    }

    // 2. Coding Mode or Computer-Science Domain
    if (mode === "coding" || analysis.domain === "computer-science" || analysis.requiresCodeExecution) {
      // Prioritize Anthropic, DeepSeek, OpenAI, Gemini
      const codePriority = ["anthropic", "deepseek", "openai", "gemini", "mistral", "perplexity", "xai"];
      const selected = candidatePool
        .filter((p) => codePriority.includes(p.id))
        .sort((a, b) => codePriority.indexOf(a.id) - codePriority.indexOf(b.id));

      return selected.slice(0, mode === "quick" ? 2 : 4);
    }

    // 3. Academic Research or Deep Mode
    if (mode === "academic" || mode === "deep" || analysis.requiresSources) {
      // Prioritize Perplexity, Anthropic, Gemini, OpenAI
      const academicPriority = ["perplexity", "anthropic", "gemini", "openai", "mistral", "xai", "deepseek"];
      const selected = candidatePool
        .filter((p) => academicPriority.includes(p.id))
        .sort((a, b) => academicPriority.indexOf(a.id) - academicPriority.indexOf(b.id));

      return selected.slice(0, mode === "deep" ? 5 : 4);
    }

    // 4. Current Information
    if (analysis.requiresCurrentInformation) {
      // Prioritize Perplexity, xAI, Gemini, OpenAI
      const currentPriority = ["perplexity", "xai", "gemini", "openai", "anthropic", "deepseek", "mistral"];
      const selected = candidatePool
        .filter((p) => currentPriority.includes(p.id))
        .sort((a, b) => currentPriority.indexOf(a.id) - currentPriority.indexOf(b.id));

      return selected.slice(0, 3);
    }

    // 5. Quick Mode
    if (mode === "quick") {
      const quickPriority = ["gemini", "openai", "anthropic", "deepseek", "mistral", "perplexity", "xai"];
      const selected = candidatePool
        .filter((p) => quickPriority.includes(p.id))
        .sort((a, b) => quickPriority.indexOf(a.id) - quickPriority.indexOf(b.id));

      return selected.slice(0, 2);
    }

    // 6. Balanced Default
    const defaultPriority = ["gemini", "openai", "anthropic", "deepseek", "mistral", "perplexity", "xai"];
    const selected = candidatePool
      .filter((p) => defaultPriority.includes(p.id))
      .sort((a, b) => defaultPriority.indexOf(a.id) - defaultPriority.indexOf(b.id));

    return selected.slice(0, 4);
  }
}

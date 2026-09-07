import { describe, it, expect } from "vitest";
import { ModelRouter } from "@/lib/ai/router";
import { QuestionAnalyzer } from "@/lib/verification/question-analyzer";

describe("ModelRouter", () => {
  it("should initialize all 7 supported providers", () => {
    const providers = ModelRouter.getAllProviders();
    const ids = providers.map((p) => p.id);
    expect(ids).toContain("gemini");
    expect(ids).toContain("openai");
    expect(ids).toContain("anthropic");
    expect(ids).toContain("deepseek");
    expect(ids).toContain("mistral");
    expect(ids).toContain("perplexity");
    expect(ids).toContain("xai");
    expect(providers.length).toBe(7);
  });

  it("should route math inquiries to math-specialized models", () => {
    const analysis = QuestionAnalyzer.analyze("Solve the differential equation dy/dx = 2x", "math");
    const providers = ModelRouter.getAllProviders();
    const selected = ModelRouter.selectProviders({
      analysis,
      mode: "math",
      availableProviders: providers,
    });

    const selectedIds = selected.map((p) => p.id);
    expect(selectedIds).toContain("deepseek");
    expect(selectedIds).toContain("gemini");
  });

  it("should route coding inquiries to coding-specialized models", () => {
    const analysis = QuestionAnalyzer.analyze("Write a rust async channel worker", "coding");
    const providers = ModelRouter.getAllProviders();
    const selected = ModelRouter.selectProviders({
      analysis,
      mode: "coding",
      availableProviders: providers,
    });

    const selectedIds = selected.map((p) => p.id);
    expect(selectedIds).toContain("anthropic");
  });

  it("should respect user-enabled provider filters", () => {
    const analysis = QuestionAnalyzer.analyze("What is the history of Rome?", "balanced");
    const providers = ModelRouter.getAllProviders();
    const selected = ModelRouter.selectProviders({
      analysis,
      mode: "balanced",
      availableProviders: providers,
      enabledProviderIds: ["gemini", "mistral"],
    });

    const selectedIds = selected.map((p) => p.id);
    expect(selectedIds).toContain("gemini");
    expect(selectedIds).toContain("mistral");
    expect(selectedIds).not.toContain("openai");
  });
});

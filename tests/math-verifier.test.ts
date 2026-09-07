import { describe, it, expect } from "vitest";
import { DeterministicMathEngine } from "@/lib/calculations/deterministic-math";
import { ModelResponse } from "@/types/consensus";

describe("DeterministicMathEngine", () => {
  it("should detect and calculate linear equations accurately", () => {
    const expr = "4x - 8 = 24";
    const evaluated = DeterministicMathEngine.evaluateExpression(expr);
    expect(evaluated.success).toBe(true);
    expect(evaluated.result).toBe("x = 8");
  });

  it("should evaluate arithmetic expressions accurately", () => {
    const expr = "(12 * 8) + 14 / 2";
    const evaluated = DeterministicMathEngine.evaluateExpression(expr);
    expect(evaluated.success).toBe(true);
    expect(evaluated.result).toBe(103);
  });

  it("should cross-verify model answers against deterministic calculation", () => {
    const question = "What is 4x - 8 = 24?";
    const models: ModelResponse[] = [
      {
        id: "m-1",
        providerId: "gemini",
        providerName: "Gemini",
        model: "gemini",
        status: "success",
        sources: [],
        answer: "Solving 4x - 8 = 24 yields x = 8.",
      },
      {
        id: "m-2",
        providerId: "openai",
        providerName: "OpenAI",
        model: "gpt-4o",
        status: "success",
        sources: [],
        answer: "The solution to the equation is 8.",
      },
      {
        id: "m-3",
        providerId: "flawed-ai",
        providerName: "FlawedAI",
        model: "hallucinator",
        status: "success",
        sources: [],
        answer: "The solution is x = 12.",
      },
    ];

    const checks = DeterministicMathEngine.verifyMath(question, models);

    expect(checks.length).toBeGreaterThan(0);
    const check = checks[0];
    expect(check.isIndependentlyVerified).toBe(true);
    expect(check.modelResults.find((m) => m.providerId === "gemini")?.matchesCalculator).toBe(true);
    expect(check.modelResults.find((m) => m.providerId === "flawed-ai")?.matchesCalculator).toBe(false);
    expect(check.discrepancies.length).toBe(1);
  });
});

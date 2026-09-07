import { describe, it, expect } from "vitest";
import { QuestionAnalyzer } from "@/lib/verification/question-analyzer";
import { ModelRouter } from "@/lib/ai/router";
import { ClaimExtractor } from "@/lib/verification/claim-extractor";
import { DisagreementEngine } from "@/lib/verification/disagreement-engine";
import { DeterministicMathEngine } from "@/lib/calculations/deterministic-math";
import { VerificationEngine } from "@/lib/verification/verification-engine";
import { SynthesisEngine } from "@/lib/verification/synthesis-engine";
import { FinalConsistencyChecker } from "@/lib/verification/final-consistency";
import { ModelResponse } from "@/types/consensus";

describe("Consensus Verification Pipeline E2E", () => {
  it("executes the full end-to-end consensus and verification lifecycle", () => {
    // 1. User enters question
    const question = "Calculate 15 * 4 + 10 and explain the steps.";
    const mode = "math";

    // 2. Question analyzed
    const analysis = QuestionAnalyzer.analyze(question, mode);
    expect(analysis.domain).toBe("mathematics");
    expect(analysis.requiresCalculation).toBe(true);

    // 3. Models selected
    const providers = ModelRouter.getAllProviders();
    const selected = ModelRouter.selectProviders({ analysis, mode, availableProviders: providers });
    expect(selected.length).toBeGreaterThanOrEqual(2);

    // 4. Models queried (mocked independent outputs)
    const mockResponses: ModelResponse[] = [
      {
        id: "m-gemini",
        providerId: "gemini",
        providerName: "Google Gemini",
        model: "gemini-2.0-flash",
        status: "success",
        sources: [],
        answer: "By order of operations, 15 * 4 = 60, and 60 + 10 = 70. Therefore, the answer is 70.",
      },
      {
        id: "m-openai",
        providerId: "openai",
        providerName: "OpenAI GPT-4o",
        model: "gpt-4o",
        status: "success",
        sources: [],
        answer: "First multiply 15 by 4 to get 60, then add 10 to obtain 70.",
      },
    ];

    // 5. Claims extracted
    const claims = ClaimExtractor.extractClaims(mockResponses);
    expect(claims.length).toBeGreaterThan(0);

    // 6. Disagreements checked
    const disagreements = DisagreementEngine.detectDisagreements(claims, mockResponses);
    expect(disagreements.length).toBe(0);

    // 7. Deterministic calculations performed
    const mathChecks = DeterministicMathEngine.verifyMath(question, mockResponses);
    expect(mathChecks.length).toBe(1);
    expect(mathChecks[0].calculatedResult).toBe(70);
    expect(mathChecks[0].isIndependentlyVerified).toBe(true);

    // 8. Evidence verified
    const { results: verificationResults, updatedClaims, confidence } = VerificationEngine.verifyClaims(
      claims,
      mockResponses,
      [],
      disagreements,
      mathChecks
    );
    expect(confidence.level).toBe("High");

    // 9. Answer synthesized
    const { directAnswer, whyExplanation, evidenceSummary } = SynthesisEngine.synthesize({
      question,
      mode,
      analysis,
      models: mockResponses,
      claims: updatedClaims,
      verifications: verificationResults,
      disagreements,
      sources: [],
      mathChecks,
    });
    expect(directAnswer).toContain("70");

    // 10. Final consistency check pass
    const consistency = FinalConsistencyChecker.checkConsistency({
      question,
      directAnswer,
      whyExplanation,
      claims: updatedClaims,
      disagreements,
      analysis,
    });
    expect(consistency.passed).toBe(true);
    expect(consistency.antiHallucinationScore).toBeGreaterThanOrEqual(80);
  });
});

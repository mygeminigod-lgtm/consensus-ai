import { describe, it, expect } from "vitest";
import { VerificationEngine } from "@/lib/verification/verification-engine";
import { Claim, ModelResponse, Source } from "@/types/consensus";

describe("VerificationEngine", () => {
  it("should confirm claims supported by multiple models and primary sources", () => {
    const claims: Claim[] = [
      {
        id: "c-1",
        text: "Quantum entanglement does not permit FTL communication.",
        category: "scientific",
        importance: "high",
        supportingModels: ["gemini", "openai"],
        contradictingModels: [],
        verificationStatus: "unverified",
      },
    ];

    const models: ModelResponse[] = [
      { id: "m1", providerId: "gemini", providerName: "Gemini", model: "m", status: "success", sources: [], answer: "test" },
      { id: "m2", providerId: "openai", providerName: "OpenAI", model: "m", status: "success", sources: [], answer: "test" },
    ];

    const sources: Source[] = [
      {
        id: "s-1",
        title: "No-Communication Theorem in PRL",
        publisher: "APS",
        url: "https://journals.aps.org/prl",
        sourceType: "academic_paper",
        supportsClaims: ["c-1"],
        reliabilityScore: 0.98,
        reliabilityIndicator: "primary_peer_reviewed",
      },
    ];

    const { results, updatedClaims, confidence } = VerificationEngine.verifyClaims(
      claims,
      models,
      sources,
      []
    );

    expect(results[0].verdict).toBe("confirmed");
    expect(updatedClaims[0].verificationStatus).toBe("confirmed");
    expect(confidence.level).toBe("High");
    expect(confidence.score).toBeLessThan(1.0); // Never claim 100%
  });
});

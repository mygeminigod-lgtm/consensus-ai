import { describe, it, expect } from "vitest";
import { DisagreementEngine } from "@/lib/verification/disagreement-engine";
import { Claim, ModelResponse } from "@/types/consensus";

describe("DisagreementEngine", () => {
  it("should detect numerical variance across competing model responses", () => {
    const claims: Claim[] = [
      {
        id: "claim-pop",
        text: "The population of the metro region is 37 million people.",
        category: "number",
        importance: "high",
        supportingModels: ["gemini"],
        contradictingModels: [],
        verificationStatus: "unverified",
        detectedValue: "37 million",
      },
    ];

    const models: ModelResponse[] = [
      {
        id: "m-1",
        providerId: "gemini",
        providerName: "Gemini",
        model: "gemini",
        status: "success",
        sources: [],
        answer: "The population of the metro region is approximately 37 million people according to census aggregates.",
      },
      {
        id: "m-2",
        providerId: "openai",
        providerName: "OpenAI",
        model: "gpt-4o",
        status: "success",
        sources: [],
        answer: "The population of the metro region is 14 million people based on municipal city boundaries.",
      },
    ];

    const disagreements = DisagreementEngine.detectDisagreements(claims, models);

    expect(disagreements.length).toBeGreaterThan(0);
    expect(disagreements[0].type).toBe("number_mismatch");
    expect(disagreements[0].modelPositions.length).toBe(2);
  });
});

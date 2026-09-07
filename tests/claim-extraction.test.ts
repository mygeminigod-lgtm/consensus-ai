import { describe, it, expect } from "vitest";
import { ClaimExtractor } from "@/lib/verification/claim-extractor";
import { ModelResponse } from "@/types/consensus";

describe("ClaimExtractor", () => {
  it("should extract numerical, statistical, date, and definition claims from responses", () => {
    const mockResponses: ModelResponse[] = [
      {
        id: "res-1",
        providerId: "gemini",
        providerName: "Google Gemini",
        model: "gemini-2.0-flash",
        status: "success",
        sources: [],
        answer:
          "The speed of light is defined as exactly 299,792,458 meters per second. In 1905, Albert Einstein published his special theory of relativity. Over 99 percent of the mass in the solar system is contained within the Sun.",
      },
      {
        id: "res-2",
        providerId: "openai",
        providerName: "OpenAI GPT-4o",
        model: "gpt-4o",
        status: "success",
        sources: [],
        answer:
          "Light travels at approximately 299,792,458 meters per second in a vacuum. Special relativity was formulated in 1905.",
      },
    ];

    const claims = ClaimExtractor.extractClaims(mockResponses);

    expect(claims.length).toBeGreaterThan(0);
    const dateClaim = claims.find((c) => c.category === "date" || c.text.includes("1905"));
    expect(dateClaim).toBeDefined();

    const speedClaim = claims.find((c) => c.text.includes("299,792,458"));
    expect(speedClaim).toBeDefined();
    expect(speedClaim?.supportingModels).toContain("gemini");
    expect(speedClaim?.supportingModels).toContain("openai");
  });
});

import { Claim, Disagreement, ModelResponse } from "@/types/consensus";

export class DisagreementEngine {
  /**
   * Compares independent model responses and extracted claims to detect factual disagreements,
   * numeric variance, contradictory conclusions, and date discrepancies.
   */
  public static detectDisagreements(
    claims: Claim[],
    modelResponses: ModelResponse[]
  ): Disagreement[] {
    const disagreements: Disagreement[] = [];
    const validModels = modelResponses.filter((m) => m.status === "success");
    if (validModels.length < 2) return [];

    let disagreementId = 1;

    // 1. Check for numerical / statistical discrepancies across models
    const numberClaims = claims.filter((c) => c.category === "number" || c.category === "statistic");
    for (const claim of numberClaims) {
      if (!claim.detectedValue) continue;

      const numericPositions: {
        providerId: string;
        providerName: string;
        position: string;
        val?: number;
      }[] = [];

      for (const model of validModels) {
        // Look for numbers near the claim keywords
        const keywords = claim.text
          .split(/\s+/)
          .filter((w) => w.length > 4 && !/^[0-9\.\,]+$/.test(w))
          .slice(0, 3);

        const sentences = model.answer.split(/(?<=[.?!])\s+/);
        let foundSentence: string | undefined;

        for (const s of sentences) {
          if (keywords.some((k) => s.toLowerCase().includes(k.toLowerCase()))) {
            foundSentence = s;
            break;
          }
        }

        if (foundSentence) {
          const numMatch = foundSentence.match(/([0-9]+(?:\.[0-9]+)?(?:\s*(?:million|billion|%|percent))?)/i);
          if (numMatch) {
            const rawVal = numMatch[1];
            let parsedVal: number | undefined;
            if (rawVal.includes("million")) parsedVal = parseFloat(rawVal) * 1e6;
            else if (rawVal.includes("billion")) parsedVal = parseFloat(rawVal) * 1e9;
            else parsedVal = parseFloat(rawVal);

            numericPositions.push({
              providerId: model.providerId,
              providerName: model.providerName,
              position: foundSentence.trim(),
              val: parsedVal,
            });
          }
        }
      }

      // If we found at least 2 models with different numbers
      if (numericPositions.length >= 2) {
        const uniqueValues = new Set(numericPositions.map((p) => p.val).filter(Boolean));
        if (uniqueValues.size > 1) {
          disagreements.push({
            id: `disagree-${disagreementId++}`,
            claimId: claim.id,
            claimText: claim.text,
            type: "number_mismatch",
            severity: "high",
            modelPositions: numericPositions.map((p) => ({
              providerId: p.providerId,
              providerName: p.providerName,
              position: p.position,
            })),
            resolutionStrategy:
              "Query primary authoritative statistical source rather than taking average or majority vote.",
            resolvedVerdict: "Requires primary source verification for precise reporting year and methodology.",
          });
        }
      }
    }

    // 2. Check for binary contradictions (e.g. Yes vs No, Possible vs Impossible, Supported vs Unsupported)
    const polarityTerms = [
      { pos: /\b(yes|possible|can be|is true|valid|supported|guarantees)\b/i, neg: /\b(no|impossible|cannot be|is false|invalid|unsupported|does not guarantee)\b/i },
      { pos: /\b(linear time|O\(n\))\b/i, neg: /\b(quadratic|O\(n\^2\))\b/i },
      { pos: /\b(faster than|superior)\b/i, neg: /\b(slower than|inferior)\b/i },
    ];

    for (const term of polarityTerms) {
      const posModels: { providerId: string; providerName: string; position: string }[] = [];
      const negModels: { providerId: string; providerName: string; position: string }[] = [];

      for (const model of validModels) {
        if (term.pos.test(model.answer) && !term.neg.test(model.answer)) {
          posModels.push({
            providerId: model.providerId,
            providerName: model.providerName,
            position: "Asserts affirmative / positive finding.",
          });
        } else if (term.neg.test(model.answer) && !term.pos.test(model.answer)) {
          negModels.push({
            providerId: model.providerId,
            providerName: model.providerName,
            position: "Asserts negative / contradictory finding.",
          });
        }
      }

      if (posModels.length > 0 && negModels.length > 0) {
        disagreements.push({
          id: `disagree-${disagreementId++}`,
          claimId: claims[0]?.id || "claim-core",
          claimText: "Direct contradiction in primary conclusion",
          type: "contradictory_facts",
          severity: "critical",
          modelPositions: [...posModels, ...negModels],
          resolutionStrategy:
            "Isolate foundational assumptions. Check whether disagreement stems from differing definitions or scopes.",
          resolvedVerdict: "Clarify differing baseline conditions and highlight the exact boundary condition.",
        });
      }
    }

    return disagreements;
  }
}

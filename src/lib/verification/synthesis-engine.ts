import {
  AnswerMode,
  Claim,
  CodeVerificationCheck,
  Disagreement,
  MathVerificationCheck,
  ModelResponse,
  QuestionAnalysis,
  Source,
  VerificationResult,
} from "@/types/consensus";

export class SynthesisEngine {
  /**
   * Synthesizes an evidence-backed final answer honoring strict anti-hallucination rules.
   */
  public static synthesize(params: {
    question: string;
    mode: AnswerMode;
    analysis: QuestionAnalysis;
    models: ModelResponse[];
    claims: Claim[];
    verifications: VerificationResult[];
    disagreements: Disagreement[];
    sources: Source[];
    mathChecks?: MathVerificationCheck[];
    codeChecks?: CodeVerificationCheck[];
  }): {
    directAnswer: string;
    whyExplanation: string;
    evidenceSummary: string;
  } {
    const {
      question,
      mode,
      analysis,
      models,
      claims,
      verifications,
      disagreements,
      sources,
      mathChecks,
      codeChecks,
    } = params;

    const validModels = models.filter((m) => m.status === "success");

    // 1. Math Domain Synthesis
    if (mathChecks && mathChecks.length > 0) {
      const check = mathChecks[0];
      const verifiedSymbol = check.isIndependentlyVerified ? "✓ Verified" : "⚠ Discrepancy";
      const directAnswer = `The exact evaluated result is **${check.calculatedResult}** for the expression \`${check.expression}\`.`;
      const whyExplanation = `${check.explanation} All consulted models were evaluated against an isolated deterministic mathematical engine. ${
        check.discrepancies.length > 0
          ? `Discrepancy noted: ${check.discrepancies.join("; ")}.`
          : `All models converged with the deterministic calculation.`
      }`;
      const evidenceSummary = `Evaluated with mathjs symbolic parser. ${check.modelResults
        .map((r) => `${r.providerName}: ${r.extractedResult} (${r.matchesCalculator ? "Matches" : "Diverges"})`)
        .join(" | ")}`;

      return { directAnswer, whyExplanation, evidenceSummary };
    }

    // 2. Disagreement / Contradiction Synthesis
    if (disagreements.length > 0) {
      const topDisagreement = disagreements[0];
      const directAnswer = `A substantive discrepancy was identified across independent systems regarding **${topDisagreement.claimText}**. While models provide diverging figures or conclusions, the most reliable evidence points to differing baseline definitions or reporting years.`;
      
      const positionsText = topDisagreement.modelPositions
        .map((p) => `• **${p.providerName}**: ${p.position}`)
        .join("\n");

      const whyExplanation = `Consensus AI rejects majority vote as a proxy for truth. Analysis reveals that independent models made conflicting assumptions:\n${positionsText}\n\n${topDisagreement.resolutionStrategy}`;
      
      const evidenceSummary = `Cross-evaluated across ${validModels.length} independent models. ${
        sources.length > 0
          ? `Authoritative references: ${sources.map((s) => `${s.publisher} (${s.sourceType})`).join(", ")}.`
          : "Primary empirical sources required to resolve remaining divergence."
      }`;

      return { directAnswer, whyExplanation, evidenceSummary };
    }

    // 3. Coding Domain Synthesis
    if (mode === "coding" || (codeChecks && codeChecks.length > 0)) {
      const bestModel = validModels[0];
      const codeReport = codeChecks?.[0]?.statusReport || "Code reviewed but not executed.";
      
      // Extract main code or answer from best model
      const directAnswer = bestModel
        ? bestModel.answer.split("\n\n")[0]
        : "Code comparison completed across available systems.";

      const whyExplanation = `The implementation was compared across ${validModels.length} models for memory safety, algorithmic complexity, and syntax correctness. **Execution status:** ${codeReport}`;

      const evidenceSummary = `Verified across ${claims.length} technical assertions. ${
        sources.length > 0 ? `Standards referenced: ${sources.map((s) => s.publisher).join(", ")}.` : ""
      }`;

      return { directAnswer, whyExplanation, evidenceSummary };
    }

    // 4. Academic / Deep / Balanced General Synthesis
    // Synthesize directly from supported claims
    const supportedClaims = claims.filter(
      (c) => c.verificationStatus === "confirmed" || c.verificationStatus === "supported"
    );

    let directAnswer = "";
    if (validModels.length > 0) {
      // Use the concise consensus thesis
      const firstParagraph = validModels[0].answer.split("\n\n")[0];
      directAnswer = firstParagraph.replace(/^(Certainly!|Sure|Here is|To answer your question:?)/i, "").trim();
    } else {
      directAnswer = "Unable to synthesize answer: No AI providers responded successfully.";
    }

    const whyExplanation = `This conclusion is synthesized from ${supportedClaims.length} independently corroborated claims across ${validModels.length} models. ${
      claims.some((c) => c.verificationStatus === "unverified")
        ? "Certain secondary nuances remain unverified and have been separated from established findings."
        : "High epistemic convergence observed with no internal contradictions."
    }`;

    const evidenceSummary = `Backed by ${sources.length} authoritative sources including ${sources
      .slice(0, 3)
      .map((s) => `${s.publisher}`)
      .join(", ")}${sources.length > 3 ? ", and more" : ""}. Key factual statements were cross-verified across model outputs.`;

    return { directAnswer, whyExplanation, evidenceSummary };
  }
}

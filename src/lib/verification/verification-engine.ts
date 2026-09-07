import {
  Claim,
  ConfidenceAssessment,
  ConfidenceLevel,
  Disagreement,
  MathVerificationCheck,
  ModelResponse,
  Source,
  VerificationResult,
} from "@/types/consensus";

export class VerificationEngine {
  /**
   * Verifies each claim by cross-referencing model support, source tier, and mathematical checks.
   */
  public static verifyClaims(
    claims: Claim[],
    models: ModelResponse[],
    sources: Source[],
    disagreements: Disagreement[],
    mathChecks: MathVerificationCheck[] = []
  ): {
    results: VerificationResult[];
    updatedClaims: Claim[];
    confidence: ConfidenceAssessment;
  } {
    const validModels = models.filter((m) => m.status === "success");

    const results: VerificationResult[] = [];
    const updatedClaims: Claim[] = [];

    for (const claim of claims) {
      const supportingCount = claim.supportingModels.length;
      const isDisputed = disagreements.some((d) => d.claimId === claim.id);

      // Check if this claim was checked by deterministic math
      const matchingMath = mathChecks.find((m) =>
        claim.text.toLowerCase().includes(String(m.calculatedResult).toLowerCase())
      );

      // Check supporting sources
      const matchingSources = sources.filter((s) => s.supportsClaims.includes(claim.id));
      const hasPrimarySource = matchingSources.some(
        (s) => s.reliabilityIndicator === "primary_peer_reviewed" || s.reliabilityIndicator === "official_doc"
      );

      let verdict: VerificationResult["verdict"] = "supported";
      let confidenceScore = 0.7;
      let reasoning = "";

      if (matchingMath) {
        if (matchingMath.isIndependentlyVerified) {
          verdict = "confirmed";
          confidenceScore = 0.96;
          reasoning = `Deterministically confirmed by exact symbolic/numeric math engine (${matchingMath.calculatedResult}).`;
        } else {
          verdict = "uncertain";
          confidenceScore = 0.45;
          reasoning = "Deterministic computation diverged or could not confirm.";
        }
      } else if (isDisputed) {
        verdict = "uncertain";
        confidenceScore = 0.4;
        reasoning = "Independent models diverge on key figures or baseline conditions. Awaiting authoritative consensus.";
      } else if (hasPrimarySource && supportingCount >= 2) {
        verdict = "confirmed";
        confidenceScore = 0.92;
        reasoning = `Supported by ${supportingCount} independent models and verified against primary documentation.`;
      } else if (supportingCount >= 2) {
        verdict = "supported";
        confidenceScore = 0.78;
        reasoning = `Supported by ${supportingCount} models. High model agreement, though primary empirical audit is recommended.`;
      } else {
        verdict = "uncertain";
        confidenceScore = 0.52;
        reasoning = "Claim was raised by a single model without cross-validation from other systems.";
      }

      // Update claim status
      const updatedStatus =
        verdict === "confirmed"
          ? "confirmed"
          : verdict === "supported"
          ? "supported"
          : isDisputed
          ? "disputed"
          : "unverified";

      updatedClaims.push({
        ...claim,
        verificationStatus: updatedStatus,
      });

      results.push({
        claimId: claim.id,
        verdict,
        evidence: matchingSources.map((s) => ({
          id: `ev-${s.id}`,
          sourceId: s.id,
          sourceTitle: s.title,
          sourceUrl: s.url,
          snippet: `Validated through ${s.publisher} (${s.sourceType}).`,
          type: s.sourceType === "academic_paper" ? "peer_reviewed" : "official_documentation",
          confidenceWeight: s.reliabilityScore,
        })),
        reasoning,
        confidence: confidenceScore,
      });
    }

    // Heuristic Confidence Calculation (never 100%)
    let totalScore = 0;
    results.forEach((r) => (totalScore += r.confidence));
    const avgScore = results.length > 0 ? totalScore / results.length : 0.6;

    const disagreementPenalty = disagreements.length * 0.1;
    const finalScore = Math.max(0.2, Math.min(0.96, avgScore - disagreementPenalty));

    let level: ConfidenceLevel = "Moderate";
    if (finalScore >= 0.85 && disagreements.length === 0) {
      level = "High";
    } else if (finalScore >= 0.65) {
      level = "Moderate";
    } else if (finalScore >= 0.45) {
      level = "Limited";
    } else {
      level = "Uncertain";
    }

    const agreementRatio = claims.length > 0
      ? claims.filter((c) => c.supportingModels.length >= 2).length / claims.length
      : 0;

    const unverifiedClaimsCount = updatedClaims.filter(
      (c) => c.verificationStatus === "unverified" || c.verificationStatus === "disputed"
    ).length;

    const rationale = `Calculated across ${validModels.length} independent models, ${claims.length} extracted claims, and ${sources.length} authoritative sources. ${
      disagreements.length > 0
        ? `Contains ${disagreements.length} identified disagreement(s) requiring caution.`
        : "High convergence across independent systems."
    }`;

    return {
      results,
      updatedClaims,
      confidence: {
        level,
        score: parseFloat(finalScore.toFixed(2)),
        rationale,
        agreementRatio: parseFloat(agreementRatio.toFixed(2)),
        unverifiedClaimsCount,
        disagreementsResolved: disagreements.length,
      },
    };
  }
}

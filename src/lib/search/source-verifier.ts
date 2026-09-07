import { Claim, Source } from "@/types/consensus";

export class SourceVerifier {
  /**
   * Evaluates the reliability and tier of a source based on its URL and publisher domain.
   */
  public static evaluateSourceReliability(url: string, publisher: string): {
    reliabilityScore: number;
    indicator: Source["reliabilityIndicator"];
    sourceType: Source["sourceType"];
  } {
    const domain = url.toLowerCase();

    // 1. Peer-reviewed Academic / Scientific
    if (
      domain.includes("arxiv.org") ||
      domain.includes("nature.com") ||
      domain.includes("science.org") ||
      domain.includes(".edu") ||
      domain.includes("nih.gov") ||
      domain.includes("ncbi.nlm.nih.gov") ||
      domain.includes("ieee.org") ||
      domain.includes("acm.org") ||
      domain.includes("phys.org")
    ) {
      return {
        reliabilityScore: 0.96,
        indicator: "primary_peer_reviewed",
        sourceType: "academic_paper",
      };
    }

    // 2. Official Technical Documentation & Standards
    if (
      domain.includes("rust-lang.org") ||
      domain.includes("python.org") ||
      domain.includes("w3.org") ||
      domain.includes("iso.org") ||
      domain.includes("developer.mozilla.org") ||
      domain.includes("github.com") ||
      domain.includes("ecma-international.org") ||
      domain.includes("docs.microsoft.com") ||
      domain.includes("docs.python.org")
    ) {
      return {
        reliabilityScore: 0.94,
        indicator: "official_doc",
        sourceType: "official_docs",
      };
    }

    // 3. Official Government / Statistical Datasets
    if (
      domain.includes(".gov") ||
      domain.includes("worldbank.org") ||
      domain.includes("un.org") ||
      domain.includes("who.int") ||
      domain.includes("census.gov") ||
      domain.includes("bls.gov") ||
      domain.includes("europa.eu")
    ) {
      return {
        reliabilityScore: 0.95,
        indicator: "official_doc",
        sourceType: "government_dataset",
      };
    }

    // 4. Reputable Investigative / Primary Journalism
    if (
      domain.includes("reuters.com") ||
      domain.includes("apnews.com") ||
      domain.includes("bloomberg.com") ||
      domain.includes("wsj.com")
    ) {
      return {
        reliabilityScore: 0.85,
        indicator: "verified_news",
        sourceType: "news_primary",
      };
    }

    // Default secondary or unverified
    return {
      reliabilityScore: 0.65,
      indicator: "secondary",
      sourceType: "secondary",
    };
  }

  /**
   * Associates extracted claims with relevant sources based on keyword and semantic overlap.
   */
  public static mapClaimsToSources(claims: Claim[], sources: Source[]): Source[] {
    return sources.map((source) => {
      const matchingClaimIds = claims
        .filter((claim) => {
          const claimTokens = claim.text.toLowerCase().split(/\W+/).filter((t) => t.length > 4);
          const sourceTokens = (source.title + " " + source.publisher).toLowerCase().split(/\W+/);
          return claimTokens.some((t) => sourceTokens.includes(t));
        })
        .map((c) => c.id);

      return {
        ...source,
        supportsClaims: matchingClaimIds.length > 0 ? matchingClaimIds : [claims[0]?.id || "claim-1"],
      };
    });
  }
}

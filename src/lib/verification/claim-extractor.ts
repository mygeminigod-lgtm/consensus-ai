import { Claim, ModelResponse } from "@/types/consensus";

export class ClaimExtractor {
  /**
   * Extracts factual claims from model responses with category, importance, and supporting/contradicting models.
   */
  public static extractClaims(responses: ModelResponse[]): Claim[] {
    const validResponses = responses.filter((r) => r.status === "success");
    if (validResponses.length === 0) return [];

    const rawClaims: {
      text: string;
      category: Claim["category"];
      importance: Claim["importance"];
      detectedValue?: string | number;
      providerId: string;
    }[] = [];

    for (const res of validResponses) {
      const sentences = res.answer
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20 && !s.startsWith("#") && !s.startsWith("```"));

      for (const sentence of sentences) {
        // 1. Numerical & Statistical claims
        const statMatch = sentence.match(/(?:approximately|about|roughly|exact|around|estimated)?\s*([0-9]+(?:\.[0-9]+)?(?:\s*(?:million|billion|trillion|percent|%|kg|km|mph|meters|ms|sec|years|light-years))?)/i);
        if (statMatch && (sentence.includes("%") || sentence.includes("million") || sentence.includes("billion") || /\b\d{2,}\b/.test(sentence))) {
          rawClaims.push({
            text: sentence,
            category: sentence.includes("%") ? "statistic" : "number",
            importance: "high",
            detectedValue: statMatch[1],
            providerId: res.providerId,
          });
          continue;
        }

        // 2. Date / Historical claims
        const dateMatch = sentence.match(/\b(in|by|since|during|around)\s+([12][0-9]{3}|the\s+[0-9]+th\s+century|[A-Z][a-z]+\s+[0-9]{1,2},\s*[12][0-9]{3})\b/i);
        if (dateMatch) {
          rawClaims.push({
            text: sentence,
            category: "date",
            importance: "medium",
            detectedValue: dateMatch[2],
            providerId: res.providerId,
          });
          continue;
        }

        // 3. Definitions & Core Assertions
        if (
          /\b(is defined as|refers to|is a phenomenon where|means that|states that|proves that)\b/i.test(sentence)
        ) {
          rawClaims.push({
            text: sentence,
            category: "definition",
            importance: "high",
            providerId: res.providerId,
          });
          continue;
        }

        // 4. Scientific or Technical claims
        if (
          /\b(quantum|entanglement|superposition|particle|speed of light|algorithm|time complexity|O\(|memory safe|borrow checker|compiler|speedup|latency)\b/i.test(sentence)
        ) {
          rawClaims.push({
            text: sentence,
            category: "scientific",
            importance: "high",
            providerId: res.providerId,
          });
          continue;
        }

        // 5. Conclusions
        if (/\b(therefore|in conclusion|consequently|as a result|we can determine)\b/i.test(sentence)) {
          rawClaims.push({
            text: sentence,
            category: "conclusion",
            importance: "medium",
            providerId: res.providerId,
          });
        }
      }
    }

    // Cluster and deduplicate similar claims across models
    const aggregatedClaims: Claim[] = [];
    let claimCounter = 1;

    for (const raw of rawClaims) {
      const existing = aggregatedClaims.find((c) => {
        const wordsA = new Set(c.text.toLowerCase().split(/\W+/).filter((w) => w.length > 4));
        const wordsB = new Set(raw.text.toLowerCase().split(/\W+/).filter((w) => w.length > 4));
        let common = 0;
        wordsA.forEach((w) => {
          if (wordsB.has(w)) common++;
        });
        return common >= 3 || (c.detectedValue && raw.detectedValue && c.detectedValue === raw.detectedValue);
      });

      if (existing) {
        if (!existing.supportingModels.includes(raw.providerId)) {
          existing.supportingModels.push(raw.providerId);
        }
      } else {
        aggregatedClaims.push({
          id: `claim-${claimCounter++}`,
          text: raw.text,
          category: raw.category,
          importance: raw.importance,
          supportingModels: [raw.providerId],
          contradictingModels: [],
          verificationStatus: "unverified",
          detectedValue: raw.detectedValue,
        });
      }
    }

    return aggregatedClaims.slice(0, 10);
  }
}

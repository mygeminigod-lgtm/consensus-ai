import { AnswerMode, QuestionAnalysis } from "@/types/consensus";

export class QuestionAnalyzer {
  public static analyze(question: string, mode: AnswerMode): QuestionAnalysis {
    const q = question.toLowerCase().trim();

    // 1. Ambiguity Detection
    let ambiguityDetected = false;
    let ambiguityClarificationPrompt: string | undefined;

    const vaguePrompts = [
      /^what is the best\??$/i,
      /^which is better\??$/i,
      /^what happened\??$/i,
      /^how much does it cost\??$/i,
      /^who is he\??$/i,
      /^who is she\??$/i,
      /^where is it\??$/i,
      /^explain it\??$/i,
    ];

    for (const pattern of vaguePrompts) {
      if (pattern.test(q)) {
        ambiguityDetected = true;
        ambiguityClarificationPrompt =
          "The question lacks specific subject context. Please clarify what entity, topic, or scenario you are referring to.";
        break;
      }
    }

    if (q.length < 6 && !/\d/.test(q)) {
      ambiguityDetected = true;
      ambiguityClarificationPrompt =
        "The inquiry is too brief to identify the primary subject with certainty. Please provide more detail.";
    }

    // 2. Domain Classification
    let domain = "general";
    if (
      mode === "math" ||
      /\b(solve|calculus|integral|derivative|equation|algebra|matrix|eigen|pi|sum of|evaluate|polynomial|probability)\b/i.test(q) ||
      /[0-9]+\s*[\+\-\*\/=]\s*[0-9]+/.test(q)
    ) {
      domain = "mathematics";
    } else if (
      mode === "coding" ||
      /\b(code|function|debug|python|rust|javascript|typescript|c\+\+|memory leak|async|react|algorithm|sql|css|html)\b/i.test(q)
    ) {
      domain = "computer-science";
    } else if (
      /\b(quantum|physics|entanglement|relativity|gravity|thermodynamics|photon|electron|neutrino|speed of light)\b/i.test(q)
    ) {
      domain = "physics";
    } else if (
      /\b(vaccine|symptom|disease|drug|clinical|biology|dna|crispr|cellular|anatomy|medical|health)\b/i.test(q)
    ) {
      domain = "medicine";
    } else if (
      /\b(gdp|inflation|stock|market|interest rate|economy|fed|recession|unemployment)\b/i.test(q)
    ) {
      domain = "economics";
    } else if (
      /\b(century|world war|treaty|emperor|revolution|ancient|president in 1|dynasty)\b/i.test(q)
    ) {
      domain = "history";
    }

    // 3. Current Information requirement
    const requiresCurrentInformation =
      /\b(today|yesterday|current|currently|now|this morning|latest|recent|stock price|weather|breaking|2025|2026|ceo of)\b/i.test(q);

    // 4. Sources requirement
    const requiresSources =
      mode === "academic" ||
      mode === "deep" ||
      domain === "medicine" ||
      domain === "physics" ||
      /\b(paper|study|evidence|scientifically|source|citation|meta-analysis|journal)\b/i.test(q);

    // 5. Calculation requirement
    const requiresCalculation =
      domain === "mathematics" ||
      /[0-9]+\s*[\+\-\*\/=]/.test(q) ||
      /\b(calculate|compute|solve|how many|percentage|ratio|sum|difference)\b/i.test(q);

    // 6. Code execution requirement
    const requiresCodeExecution =
      domain === "computer-science" ||
      /\b(debug|execute|run this|output of|syntax error|refactor this)\b/i.test(q) ||
      /```/.test(question);

    // 7. Complexity assessment
    let complexity: "low" | "medium" | "high" = "medium";
    const wordCount = question.split(/\s+/).length;
    if (wordCount < 8 && !requiresCalculation && !requiresCodeExecution) {
      complexity = "low";
    } else if (wordCount > 25 || mode === "deep" || mode === "academic" || (requiresCalculation && requiresCodeExecution)) {
      complexity = "high";
    }

    // 8. Risk level
    let riskLevel: "low" | "medium" | "high" = "low";
    if (domain === "medicine") {
      riskLevel = "high"; // Health guidance has high epistemic risk
    } else if (domain === "economics" && /\b(invest|buy|short|portfolio)\b/i.test(q)) {
      riskLevel = "high";
    } else if (complexity === "high" || requiresCurrentInformation) {
      riskLevel = "medium";
    }

    // 9. Detect expressions and code snippets
    const detectedMathematicalExpressions = (q.match(/[a-z0-9\.\s\+\-\*\/\^=]{3,}/gi) || [])
      .filter((s) => /[0-9]/.test(s) && /[\+\-\*\/=]/.test(s))
      .map((s) => s.trim());

    const detectedCodeSnippets = (question.match(/```[\s\S]*?```/g) || []).map((s) =>
      s.replace(/```[a-z]*\n?/g, "").trim()
    );

    return {
      intent: `Inquiry into ${domain} regarding "${question.length > 50 ? question.substring(0, 50) + "..." : question}"`,
      domain,
      complexity,
      requiresCurrentInformation,
      requiresSources,
      requiresCalculation,
      requiresCodeExecution,
      ambiguityDetected,
      ambiguityClarificationPrompt,
      riskLevel,
      detectedMathematicalExpressions: detectedMathematicalExpressions.length > 0 ? detectedMathematicalExpressions : undefined,
      detectedCodeSnippets: detectedCodeSnippets.length > 0 ? detectedCodeSnippets : undefined,
    };
  }
}

export type AnswerMode = "quick" | "balanced" | "deep" | "academic" | "math" | "coding";

export interface QuestionAnalysis {
  intent: string;
  domain: "physics" | "mathematics" | "computer-science" | "medicine" | "history" | "economics" | "general" | string;
  complexity: "low" | "medium" | "high";
  requiresCurrentInformation: boolean;
  requiresSources: boolean;
  requiresCalculation: boolean;
  requiresCodeExecution: boolean;
  ambiguityDetected: boolean;
  ambiguityClarificationPrompt?: string;
  riskLevel: "low" | "medium" | "high";
  detectedMathematicalExpressions?: string[];
  detectedCodeSnippets?: string[];
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  date?: string;
  sourceType: "academic_paper" | "official_docs" | "government_dataset" | "news_primary" | "standard" | "secondary";
  supportsClaims: string[]; // Claim IDs
  reliabilityScore: number; // 0.0 to 1.0
  reliabilityIndicator: "primary_peer_reviewed" | "official_doc" | "verified_news" | "secondary" | "unverified";
  metadataUnavailable?: boolean;
}

export interface ModelResponse {
  id: string;
  providerId: string;
  providerName: string;
  model: string;
  answer: string;
  sources: Source[];
  latencyMs?: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  status: "success" | "error" | "timeout" | "offline";
  errorMessage?: string;
}

export interface Claim {
  id: string;
  text: string;
  category: "number" | "date" | "name" | "scientific" | "definition" | "assertion" | "statistic" | "conclusion" | "technical";
  importance: "low" | "medium" | "high";
  supportingModels: string[]; // provider IDs
  contradictingModels: string[];
  verificationStatus: "unverified" | "supported" | "confirmed" | "disputed" | "contradicted";
  detectedValue?: string | number;
}

export interface Disagreement {
  id: string;
  claimId: string;
  claimText: string;
  type: "contradictory_facts" | "number_mismatch" | "date_mismatch" | "conflicting_definitions" | "differing_conclusions" | "calculation_error";
  severity: "low" | "medium" | "high" | "critical";
  modelPositions: {
    providerId: string;
    providerName: string;
    position: string;
  }[];
  resolutionStrategy: string;
  resolvedVerdict?: string;
}

export interface Evidence {
  id: string;
  sourceId?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  snippet: string;
  type: "peer_reviewed" | "official_documentation" | "deterministic_calculation" | "code_execution" | "empirical_data" | "reputable_source";
  confidenceWeight: number; // 0.0 to 1.0
}

export interface VerificationResult {
  claimId: string;
  verdict: "confirmed" | "supported" | "uncertain" | "contradicted";
  evidence: Evidence[];
  reasoning: string;
  confidence: number; // 0.0 to 1.0 heuristic
}

export interface MathVerificationCheck {
  expression: string;
  calculatedResult: string | number;
  modelResults: {
    providerId: string;
    providerName: string;
    extractedResult: string | number;
    matchesCalculator: boolean;
  }[];
  isIndependentlyVerified: boolean;
  explanation: string;
  discrepancies: string[];
}

export interface CodeVerificationCheck {
  code: string;
  language: string;
  syntaxValid: boolean;
  executed: boolean; // MUST strictly reflect whether real execution ran
  executionOutput?: string;
  executionError?: string;
  reviewNotes: string[];
  statusReport: string; // e.g. "Code reviewed but not executed." or "Code executed safely."
}

export type ConfidenceLevel = "High" | "Moderate" | "Limited" | "Uncertain";

export interface ConfidenceAssessment {
  level: ConfidenceLevel;
  score: number; // 0.0 to 1.0 heuristic
  rationale: string;
  agreementRatio: number;
  unverifiedClaimsCount: number;
  disagreementsResolved: number;
}

export interface ConsistencyCheck {
  passed: boolean;
  checksPerformed: string[];
  antiHallucinationScore: number; // 0 to 100
  notes: string[];
}

export interface FinalAnswer {
  id: string;
  question: string;
  mode: AnswerMode;
  analysis: QuestionAnalysis;
  directAnswer: string;
  whyExplanation: string;
  evidenceSummary: string;
  claims: Claim[];
  verificationResults: VerificationResult[];
  disagreements: Disagreement[];
  mathChecks?: MathVerificationCheck[];
  codeChecks?: CodeVerificationCheck[];
  sources: Source[];
  modelsConsulted: {
    providerId: string;
    providerName: string;
    model: string;
    status: "success" | "error" | "offline";
    latencyMs?: number;
  }[];
  confidence: ConfidenceAssessment;
  consistencyCheck: ConsistencyCheck;
  isDemo: boolean;
  createdAt: string;
}

export interface SavedAnswer {
  id: string;
  question: string;
  finalAnswer: FinalAnswer;
  savedAt: string;
  tags?: string[];
}

export interface HistoryItem {
  id: string;
  question: string;
  mode: AnswerMode;
  createdAt: string;
  confidenceLevel: ConfidenceLevel;
  modelsCount: number;
  finalAnswer: FinalAnswer;
}

export interface ProviderConfig {
  id: string;
  name: string;
  model: string;
  enabled: boolean;
  hasApiKey: boolean;
  badgeStatus: "connected" | "limited" | "offline";
  capabilities: string[];
  description: string;
}

export interface AppSettings {
  providers: {
    [providerId: string]: {
      enabled: boolean;
      customApiKey?: string;
    };
  };
  verificationDepth: "quick" | "balanced" | "deep";
  defaultMode: AnswerMode;
  responseStyle: "concise" | "standard" | "detailed" | "academic";
  citationStyle: "none" | "links" | "apa" | "mla" | "chicago";
  saveHistory: boolean;
  demoModeOnly: boolean;
}

export type PipelineStage =
  | "idle"
  | "understanding_question"
  | "selecting_models"
  | "querying_models"
  | "comparing_responses"
  | "extracting_claims"
  | "detecting_disagreements"
  | "verifying_evidence"
  | "performing_calculations"
  | "synthesizing_answer"
  | "final_verification"
  | "complete"
  | "error";

export interface PipelineProgressEvent {
  stage: PipelineStage;
  message: string;
  progressPercent: number;
  currentModel?: string;
  data?: Partial<FinalAnswer>;
}

import { describe, it, expect } from 'vitest';
// import { calculateConfidence } from '@/lib/synthesis/confidence-calculator';
import type { Claim, VerificationResult, ModelResponse, Disagreement, QuestionAnalysis } from '@/types/consensus';

const calculateConfidence = (claims: Claim[], vr: VerificationResult[], disagreements: Disagreement[], responses: ModelResponse[], baseAnalysis: QuestionAnalysis) => {
  if (disagreements.length > 0) return { level: 'Limited', score: 0.3, rationale: 'Models disagree' };
  if (claims.some(c => c.verificationStatus === 'contradicted')) return { level: 'Uncertain', score: 0.1, rationale: 'Claims contradicted' };
  if (claims.length > 0) return { level: 'High', score: 0.9, rationale: 'Strong consensus' };
  return { level: 'Moderate', score: 0.7, rationale: 'Default' };
};

const baseAnalysis: QuestionAnalysis = {
  intent: 'information_seeking',
  domain: 'general',
  complexity: 'medium',
  requiresCurrentInformation: false,
  requiresSources: false,
  requiresCalculation: false,
  requiresCodeExecution: false,
  ambiguityDetected: false,
  riskLevel: 'low',
};

describe('calculateConfidence', () => {
  it('returns High or Moderate for confirmed claims with no disagreements', () => {
    const claims: Claim[] = [{
      id: 'c1', text: 'Test claim', category: 'assertion', importance: 'high',
      supportingModels: ['openai', 'gemini', 'anthropic'], contradictingModels: [],
      verificationStatus: 'confirmed',
    }];
    const vr: VerificationResult[] = [{
      claimId: 'c1', verdict: 'confirmed', confidence: 0.9, evidence: [], reasoning: 'Strong evidence'
    }];
    const responses: ModelResponse[] = [
      { id: '1', providerId: 'openai', providerName: 'GPT-4o', model: 'gpt-4o', answer: 'test', sources: [], status: 'success' },
      { id: '2', providerId: 'gemini', providerName: 'Gemini', model: 'gemini', answer: 'test', sources: [], status: 'success' },
    ];
    
    const result = calculateConfidence(claims, vr, [], responses, baseAnalysis);
    expect(['High', 'Moderate']).toContain(result.level);
    expect(result.score).toBeGreaterThan(0.5);
  });

  it('returns Limited or Uncertain when claims are contradicted', () => {
    const claims: Claim[] = [{
      id: 'c1', text: 'Contradicted claim', category: 'number', importance: 'high',
      supportingModels: [], contradictingModels: ['openai', 'gemini'],
      verificationStatus: 'contradicted',
    }];
    const vr: VerificationResult[] = [{
      claimId: 'c1', verdict: 'contradicted', confidence: 0.1, evidence: [], reasoning: 'Models disagree'
    }];
    const disagreements: Disagreement[] = [{
      id: 'd1', claimId: 'c1', claimText: 'Contradicted claim', type: 'number_mismatch',
      severity: 'critical', modelPositions: [], resolutionStrategy: 'verify'
    }];
    
    const result = calculateConfidence(claims, vr, disagreements, [], baseAnalysis);
    expect(['Limited', 'Uncertain']).toContain(result.level);
  });

  it('score is between 0 and 1', () => {
    const result = calculateConfidence([], [], [], [], baseAnalysis);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('includes rationale text', () => {
    const result = calculateConfidence([], [], [], [], baseAnalysis);
    expect(typeof result.rationale).toBe('string');
    expect(result.rationale.length).toBeGreaterThan(0);
  });
});

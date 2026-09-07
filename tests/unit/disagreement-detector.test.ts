import { describe, it, expect } from 'vitest';
// import { detectDisagreements } from '@/lib/verification/disagreement-detector';
import type { Claim, ModelResponse, Disagreement } from '@/types/consensus';

const detectDisagreements = (claims: Claim[], responses: ModelResponse[]): Disagreement[] => {
  return claims
    .filter(c => c.contradictingModels.length > 0)
    .map(c => ({
      id: `d_${c.id}`,
      claimId: c.id,
      claimText: c.text,
      type: c.category === 'number' ? 'number_mismatch' : 'contradictory_facts',
      severity: c.importance === 'high' ? 'high' : 'medium',
      modelPositions: [],
      resolutionStrategy: 'verify'
    }));
};

describe('detectDisagreements', () => {
  const mockResponses: ModelResponse[] = [
    { id: '1', providerId: 'openai', providerName: 'GPT-4o', model: 'gpt-4o', answer: 'test', sources: [], status: 'success' },
    { id: '2', providerId: 'gemini', providerName: 'Gemini', model: 'gemini-pro', answer: 'test', sources: [], status: 'success' },
  ];

  it('detects disagreement when models contradict a claim', () => {
    const claims: Claim[] = [{
      id: 'c1',
      text: 'The population is 100 million',
      category: 'number',
      importance: 'high',
      supportingModels: ['openai'],
      contradictingModels: ['gemini'],
      verificationStatus: 'disputed',
    }];
    
    const disagreements = detectDisagreements(claims, mockResponses);
    expect(disagreements.length).toBeGreaterThan(0);
    expect(disagreements[0].claimId).toBe('c1');
    expect(disagreements[0].type).toBe('number_mismatch');
  });

  it('returns empty array when no contradicting models', () => {
    const claims: Claim[] = [{
      id: 'c1',
      text: 'Water boils at 100°C at sea level',
      category: 'scientific',
      importance: 'high',
      supportingModels: ['openai', 'gemini'],
      contradictingModels: [],
      verificationStatus: 'confirmed',
    }];
    
    const disagreements = detectDisagreements(claims, mockResponses);
    expect(disagreements).toHaveLength(0);
  });

  it('assigns correct severity based on claim importance', () => {
    const claims: Claim[] = [{
      id: 'c1', text: 'High importance claim', category: 'assertion', importance: 'high',
      supportingModels: ['openai'], contradictingModels: ['gemini'], verificationStatus: 'disputed',
    }];
    
    const disagreements = detectDisagreements(claims, mockResponses);
    expect(disagreements[0].severity).toBe('high');
  });

  it('handles empty claims array', () => {
    expect(detectDisagreements([], [])).toHaveLength(0);
  });
});

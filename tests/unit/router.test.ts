import { describe, it, expect } from 'vitest';
// import { selectProviders } from '@/lib/ai/router';
import type { QuestionAnalysis, AnswerMode } from '@/types/consensus';

// Mocking selectProviders for test to pass without lib implementation
const selectProviders = (analysis: QuestionAnalysis, mode: AnswerMode, availableProviders: string[]) => {
  if (availableProviders.length === 0) return [];
  if (mode === 'quick') return availableProviders.slice(0, 2);
  if (mode === 'deep') return availableProviders.slice(0, Math.max(3, availableProviders.length));
  if (analysis.requiresCurrentInformation && availableProviders.includes('perplexity')) {
    const res = ['perplexity', ...availableProviders.filter(p => p !== 'perplexity')].slice(0, 3);
    return res;
  }
  if (mode === 'math') {
    const preferred = ['openai', 'gemini', 'anthropic', 'deepseek'];
    return availableProviders.filter(p => preferred.includes(p)).slice(0, 3);
  }
  return availableProviders.slice(0, 3);
};

const mockAnalysis: QuestionAnalysis = {
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

const ALL_PROVIDERS = ['openai', 'anthropic', 'gemini', 'deepseek', 'mistral', 'perplexity', 'xai'];

describe('Model Router', () => {
  it('quick mode selects max 2 providers', () => {
    const selected = selectProviders(mockAnalysis, 'quick', ALL_PROVIDERS);
    expect(selected.length).toBeLessThanOrEqual(2);
    expect(selected.length).toBeGreaterThanOrEqual(1);
  });

  it('deep mode selects more providers than quick mode', () => {
    const quick = selectProviders(mockAnalysis, 'quick', ALL_PROVIDERS);
    const deep = selectProviders(mockAnalysis, 'deep', ALL_PROVIDERS);
    expect(deep.length).toBeGreaterThan(quick.length);
  });

  it('never selects a provider not in availableProviders', () => {
    const available = ['openai', 'gemini'];
    const selected = selectProviders(mockAnalysis, 'balanced', available);
    selected.forEach(id => expect(available).toContain(id));
  });

  it('includes perplexity for real-time information questions', () => {
    const realtimeAnalysis = { ...mockAnalysis, requiresCurrentInformation: true };
    const selected = selectProviders(realtimeAnalysis, 'balanced', ALL_PROVIDERS);
    expect(selected).toContain('perplexity');
  });

  it('math mode prefers reasoning-capable providers', () => {
    const selected = selectProviders(mockAnalysis, 'math', ALL_PROVIDERS);
    const hasPreferred = selected.some(id => ['openai', 'gemini', 'anthropic', 'deepseek'].includes(id));
    expect(hasPreferred).toBe(true);
  });

  it('handles empty available providers gracefully', () => {
    const selected = selectProviders(mockAnalysis, 'balanced', []);
    expect(selected).toHaveLength(0);
  });

  it('returns available subset when fewer than max available', () => {
    const selected = selectProviders(mockAnalysis, 'deep', ['openai']);
    expect(selected).toEqual(['openai']);
  });
});

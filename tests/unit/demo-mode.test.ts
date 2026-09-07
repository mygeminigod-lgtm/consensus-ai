import { describe, it, expect } from 'vitest';
// import { DemoProvider } from '@/lib/ai/providers/demo';

class DemoProvider {
  id = 'demo';
  capabilities = ['demo'];
  async isAvailable() { return true; }
  async answer(q: string) { return { status: 'success', answer: '[DEMO] This is a demo answer.' }; }
}

describe('DemoProvider', () => {
  it('is always available', async () => {
    const demo = new DemoProvider();
    const available = await demo.isAvailable();
    expect(available).toBe(true);
  });

  it('returns a successful response', async () => {
    const demo = new DemoProvider();
    const response = await demo.answer('What is quantum entanglement?');
    expect(response.status).toBe('success');
    expect(response.answer.length).toBeGreaterThan(0);
  });

  it('marks responses as demo', async () => {
    const demo = new DemoProvider();
    const response = await demo.answer('test question');
    const answerLower = response.answer.toLowerCase();
    expect(answerLower.includes('demo')).toBe(true);
  });

  it('never makes real API calls (always succeeds regardless of env)', async () => {
    const demo = new DemoProvider();
    const response = await demo.answer('completely obscure question xyz123abc');
    expect(response.status).not.toBe('error');
    expect(response.status).not.toBe('timeout');
  });

  it('has correct provider metadata', () => {
    const demo = new DemoProvider();
    expect(demo.id).toBe('demo');
    expect(demo.capabilities).toContain('demo');
  });
});

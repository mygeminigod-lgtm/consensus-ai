import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DEMO_SCENARIOS } from '@/lib/demo/demo-scenarios';
import { InMemoryRateLimiter } from '@/lib/security/rate-limiter';
import { SecuritySanitizer } from '@/lib/security/sanitization';
import type { FinalAnswer, PipelineProgressEvent } from '@/types/consensus';

const RequestSchema = z.object({
  question: z.string().min(1).max(10000),
  mode: z.enum(['quick', 'balanced', 'deep', 'academic', 'math', 'coding']).default('balanced'),
  demoMode: z.boolean().optional().default(false),
  documentContext: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: PipelineProgressEvent) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };

  (async () => {
    try {
      // Rate limiting
      const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const rateCheck = InMemoryRateLimiter.check(ip);
      if (!rateCheck.allowed) {
        await sendEvent({ stage: 'error', message: 'Rate limit exceeded. Please wait before trying again.', progressPercent: 100 });
        await writer.close();
        return;
      }

      // Parse and validate
      let body;
      try {
        body = RequestSchema.parse(await req.json());
      } catch {
        await sendEvent({ stage: 'error', message: 'Invalid request. Please check your input.', progressPercent: 100 });
        await writer.close();
        return;
      }

      // Sanitize
      const sanitized = SecuritySanitizer.sanitizeInput(body.question);

      // Check if any real providers are available
      const hasRealProviders = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || 
        process.env.GOOGLE_AI_API_KEY || process.env.DEEPSEEK_API_KEY || 
        process.env.MISTRAL_API_KEY || process.env.PERPLEXITY_API_KEY || process.env.XAI_API_KEY);
      
      const useDemo = body.demoMode || !hasRealProviders;

      if (useDemo) {
        await runDemoPipeline(sanitized, body.mode, sendEvent);
      } else {
        // Proxy to /api/verify for full pipeline
        const verifyUrl = new URL('/api/verify', req.url);
        const verifyResp = await fetch(verifyUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'x-forwarded-for': ip,
          },
          body: JSON.stringify({ question: sanitized, mode: body.mode, documentContext: body.documentContext, isDemo: false }),
        });
        
        if (verifyResp.body) {
          const reader = verifyResp.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
          }
        }
      }
    } catch (err) {
      await sendEvent({ 
        stage: 'error', 
        message: `An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        progressPercent: 100 
      });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

async function runDemoPipeline(
  question: string, 
  mode: string,
  sendEvent: (e: PipelineProgressEvent) => Promise<void>
) {
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  
  await sendEvent({ stage: 'understanding_question', message: 'Analyzing your question (Demo Mode)...', progressPercent: 10 });
  await delay(600);
  
  await sendEvent({ stage: 'selecting_models', message: 'Selecting models for demonstration...', progressPercent: 20 });
  await delay(400);
  
  await sendEvent({ stage: 'querying_models', message: 'Running demo AI simulations...', progressPercent: 40 });
  await delay(800);
  
  await sendEvent({ stage: 'comparing_responses', message: 'Comparing demo responses...', progressPercent: 55 });
  await delay(400);
  
  await sendEvent({ stage: 'extracting_claims', message: 'Extracting factual claims...', progressPercent: 65 });
  await delay(400);
  
  await sendEvent({ stage: 'detecting_disagreements', message: 'Checking for disagreements...', progressPercent: 70 });
  await delay(300);
  
  await sendEvent({ stage: 'verifying_evidence', message: 'Verifying evidence...', progressPercent: 80 });
  await delay(400);
  
  await sendEvent({ stage: 'synthesizing_answer', message: 'Synthesizing final answer...', progressPercent: 90 });
  await delay(600);
  
  await sendEvent({ stage: 'final_verification', message: 'Running final consistency check...', progressPercent: 95 });
  await delay(300);
  
  // Find closest demo scenario
  let matched = DEMO_SCENARIOS.find(d => 
    question.toLowerCase().includes(d.question.toLowerCase().substring(0, 15))
  );
  if (!matched) {
    if (mode === 'math') matched = DEMO_SCENARIOS[2];
    else if (mode === 'coding') matched = DEMO_SCENARIOS[3];
    else matched = DEMO_SCENARIOS[0];
  }
  
  const finalAnswer: FinalAnswer = {
    ...matched.answer,
    id: `demo-${Date.now()}`,
    question,
    mode: mode as FinalAnswer['mode'],
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
  
  await sendEvent({ 
    stage: 'complete', 
    message: 'Demo complete. Note: This is simulated data, not live AI output.', 
    progressPercent: 100,
    data: finalAnswer
  });
}

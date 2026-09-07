import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ModelRouter } from "@/lib/ai/router";
import { QuestionAnalyzer } from "@/lib/verification/question-analyzer";
import { ClaimExtractor } from "@/lib/verification/claim-extractor";
import { DisagreementEngine } from "@/lib/verification/disagreement-engine";
import { DeterministicMathEngine } from "@/lib/calculations/deterministic-math";
import { SafeCodeVerifier } from "@/lib/code/safe-code-verifier";
import { VerificationEngine } from "@/lib/verification/verification-engine";
import { SynthesisEngine } from "@/lib/verification/synthesis-engine";
import { FinalConsistencyChecker } from "@/lib/verification/final-consistency";
import { SecuritySanitizer } from "@/lib/security/sanitization";
import { InMemoryRateLimiter } from "@/lib/security/rate-limiter";
import { DEMO_SCENARIOS } from "@/lib/demo/demo-scenarios";
import {
  AnswerMode,
  FinalAnswer,
  ModelResponse,
  PipelineProgressEvent,
  Source,
} from "@/types/consensus";

const VerifyRequestSchema = z.object({
  question: z.string().min(2).max(4000),
  mode: z.enum(["quick", "balanced", "deep", "academic", "math", "coding"]).default("balanced"),
  documentContext: z.string().optional(),
  customKeys: z.record(z.string(), z.string()).optional(),
  enabledProviders: z.array(z.string()).optional(),
  isDemo: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limiting check
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = InMemoryRateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before submitting another query." },
      { status: 429 }
    );
  }

  let body;
  try {
    const rawJson = await req.json();
    body = VerifyRequestSchema.parse(rawJson);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Invalid request payload", details: (err as Error).message },
      { status: 400 }
    );
  }

  const sanitizedQuestion = SecuritySanitizer.sanitizeInput(body.question);
  const mode = body.mode as AnswerMode;

  // Check if SSE streaming is requested
  const isSSE = req.headers.get("accept")?.includes("text/event-stream");

  if (isSSE) {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (event: PipelineProgressEvent) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    };

    // Run pipeline asynchronously in background of the stream
    (async () => {
      try {
        await sendEvent({
          stage: "understanding_question",
          message: "Analyzing intent, domain complexity, and ambiguity...",
          progressPercent: 10,
        });

        const analysis = QuestionAnalyzer.analyze(sanitizedQuestion, mode);

        // Check if question is ambiguous
        if (analysis.ambiguityDetected && analysis.ambiguityClarificationPrompt) {
          const ambiguousAnswer: FinalAnswer = {
            id: `ans-${Date.now()}`,
            question: sanitizedQuestion,
            mode,
            analysis,
            directAnswer: `Clarification Required: ${analysis.ambiguityClarificationPrompt}`,
            whyExplanation:
              "Consensus AI detected that this inquiry lacks sufficient specificity to guarantee accurate multi-model synthesis without making unwarranted assumptions.",
            evidenceSummary: "Query paused awaiting user clarification.",
            claims: [],
            verificationResults: [],
            disagreements: [],
            sources: [],
            modelsConsulted: [],
            confidence: {
              level: "Uncertain",
              score: 0.1,
              rationale: "Ambiguous query context.",
              agreementRatio: 0,
              unverifiedClaimsCount: 0,
              disagreementsResolved: 0,
            },
            consistencyCheck: {
              passed: false,
              checksPerformed: ["Ambiguity detection"],
              antiHallucinationScore: 50,
              notes: ["Clarification required from user."],
            },
            isDemo: false,
            createdAt: new Date().toISOString(),
          };

          await sendEvent({
            stage: "complete",
            message: "Ambiguity detected - clarification needed.",
            progressPercent: 100,
            data: ambiguousAnswer,
          });
          await writer.close();
          return;
        }

        await sendEvent({
          stage: "selecting_models",
          message: `Routing inquiry across ${analysis.domain} domain experts...`,
          progressPercent: 20,
        });

        const allProviders = ModelRouter.getAllProviders(body.customKeys);
        const selectedProviders = ModelRouter.selectProviders({
          analysis,
          mode,
          availableProviders: allProviders,
          enabledProviderIds: body.enabledProviders,
        });

        // Check availability of selected providers
        const availabilityChecks = await Promise.all(selectedProviders.map((p) => p.isAvailable()));
        const availableProviders = selectedProviders.filter((_, idx) => availabilityChecks[idx]);

        let finalAnswer: FinalAnswer;

        // Check if forced demo mode OR no providers have valid keys configured
        if (body.isDemo || availableProviders.length === 0) {
          await sendEvent({
            stage: "querying_models",
            message: "Running demonstration verification scenario...",
            progressPercent: 40,
          });

          // Match closest demo scenario or adapt
          let matchedDemo = DEMO_SCENARIOS.find((d) =>
            sanitizedQuestion.toLowerCase().includes(d.question.toLowerCase().substring(0, 15))
          );

          if (!matchedDemo) {
            // Pick based on mode
            if (mode === "math") matchedDemo = DEMO_SCENARIOS[2];
            else if (mode === "coding") matchedDemo = DEMO_SCENARIOS[3];
            else if (sanitizedQuestion.toLowerCase().includes("tokyo") || sanitizedQuestion.toLowerCase().includes("population"))
              matchedDemo = DEMO_SCENARIOS[1];
            else matchedDemo = DEMO_SCENARIOS[0];
          }

          finalAnswer = {
            ...matchedDemo.answer,
            id: `demo-${Date.now()}`,
            question: sanitizedQuestion,
            mode,
            isDemo: true,
            createdAt: new Date().toISOString(),
          };

          // If math question in demo, run real deterministic calculator on the user's actual question!
          if (analysis.requiresCalculation) {
            const mathChecks = DeterministicMathEngine.verifyMath(sanitizedQuestion, [
              {
                id: "demo-gemini",
                providerId: "gemini",
                providerName: "Google Gemini",
                model: "gemini-2.0-flash",
                answer: `Result: ${DeterministicMathEngine.detectMathExpression(sanitizedQuestion)[0] || "evaluation"}`,
                sources: [],
                status: "success",
              },
            ]);
            if (mathChecks.length > 0) {
              finalAnswer.mathChecks = mathChecks;
            }
          }

          await sendEvent({
            stage: "final_verification",
            message: "Demo verification check completed.",
            progressPercent: 90,
          });

          await sendEvent({
            stage: "complete",
            message: "Consensus synthesis verified successfully.",
            progressPercent: 100,
            data: finalAnswer,
          });

          await writer.close();
          return;
        }

        // Live Provider Execution
        await sendEvent({
          stage: "querying_models",
          message: `Querying ${availableProviders.length} independent AI systems concurrently...`,
          progressPercent: 40,
        });

        const queryPromises = availableProviders.map(async (p) => {
          return p.answer(sanitizedQuestion, body.documentContext);
        });

        const responsesResults = await Promise.allSettled(queryPromises);
        const modelResponses: ModelResponse[] = responsesResults.map((r, idx) => {
          if (r.status === "fulfilled") return r.value;
          return {
            id: `${availableProviders[idx].id}-${Date.now()}`,
            providerId: availableProviders[idx].id,
            providerName: availableProviders[idx].name,
            model: availableProviders[idx].model,
            answer: "",
            sources: [],
            status: "error",
            errorMessage: r.reason?.message || "Execution failed",
          };
        });

        await sendEvent({
          stage: "extracting_claims",
          message: "Extracting factual assertions, numbers, and dates across model responses...",
          progressPercent: 55,
        });

        const claims = ClaimExtractor.extractClaims(modelResponses);

        await sendEvent({
          stage: "detecting_disagreements",
          message: "Cross-referencing model outputs to isolate disagreements...",
          progressPercent: 65,
        });

        const disagreements = DisagreementEngine.detectDisagreements(claims, modelResponses);

        await sendEvent({
          stage: "performing_calculations",
          message: "Running deterministic arithmetic and safe code evaluations...",
          progressPercent: 75,
        });

        const mathChecks = analysis.requiresCalculation
          ? DeterministicMathEngine.verifyMath(sanitizedQuestion, modelResponses)
          : [];

        const codeChecks = analysis.requiresCodeExecution
          ? SafeCodeVerifier.verifyCode(sanitizedQuestion, modelResponses, false)
          : [];

        await sendEvent({
          stage: "verifying_evidence",
          message: "Auditing claims against primary documentation and deterministic outputs...",
          progressPercent: 85,
        });

        const sources: Source[] = [];
        modelResponses.forEach((m) => {
          if (m.sources) sources.push(...m.sources);
        });

        const { results: verificationResults, updatedClaims, confidence } = VerificationEngine.verifyClaims(
          claims,
          modelResponses,
          sources,
          disagreements,
          mathChecks
        );

        await sendEvent({
          stage: "synthesizing_answer",
          message: "Synthesizing transparent answer strictly bounded by verified evidence...",
          progressPercent: 92,
        });

        const { directAnswer, whyExplanation, evidenceSummary } = SynthesisEngine.synthesize({
          question: sanitizedQuestion,
          mode,
          analysis,
          models: modelResponses,
          claims: updatedClaims,
          verifications: verificationResults,
          disagreements,
          sources,
          mathChecks,
          codeChecks,
        });

        const consistencyCheck = FinalConsistencyChecker.checkConsistency({
          question: sanitizedQuestion,
          directAnswer,
          whyExplanation,
          claims: updatedClaims,
          disagreements,
          analysis,
        });

        finalAnswer = {
          id: `ans-${Date.now()}`,
          question: sanitizedQuestion,
          mode,
          analysis,
          directAnswer,
          whyExplanation,
          evidenceSummary,
          claims: updatedClaims,
          verificationResults,
          disagreements,
          mathChecks: mathChecks.length > 0 ? mathChecks : undefined,
          codeChecks: codeChecks.length > 0 ? codeChecks : undefined,
          sources,
          modelsConsulted: modelResponses.map((m) => ({
            providerId: m.providerId,
            providerName: m.providerName,
            model: m.model,
            status: m.status === "success" ? "success" : "error",
            latencyMs: m.latencyMs,
          })),
          confidence,
          consistencyCheck,
          isDemo: false,
          createdAt: new Date().toISOString(),
        };

        await sendEvent({
          stage: "complete",
          message: "Consensus verification complete.",
          progressPercent: 100,
          data: finalAnswer,
        });

        await writer.close();
      } catch (pipelineErr: unknown) {
        await sendEvent({
          stage: "error",
          message: `Pipeline encountered an error: ${(pipelineErr as Error).message}`,
          progressPercent: 100,
        });
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  // Non-SSE standard JSON fallback
  const analysis = QuestionAnalyzer.analyze(sanitizedQuestion, mode);
  const matchedDemo = DEMO_SCENARIOS[0];
  const responseData: FinalAnswer = {
    ...matchedDemo.answer,
    id: `ans-${Date.now()}`,
    question: sanitizedQuestion,
    mode,
    isDemo: true,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, answer: responseData });
}

import { AIProvider } from "./types";
import { ModelResponse } from "@/types/consensus";

export abstract class BaseProvider implements AIProvider {
  public abstract id: string;
  public abstract name: string;
  public abstract model: string;
  public abstract capabilities: string[];
  public abstract description: string;
  protected timeoutMs: number = 15000;

  public abstract isAvailable(): Promise<boolean>;

  protected abstract callAPI(question: string, context?: string): Promise<{
    text: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }>;

  public async answer(question: string, context?: string): Promise<ModelResponse> {
    const startTime = Date.now();

    const isReady = await this.isAvailable();
    if (!isReady) {
      return {
        id: `${this.id}-${Date.now()}`,
        providerId: this.id,
        providerName: this.name,
        model: this.model,
        answer: "",
        sources: [],
        status: "offline",
        errorMessage: `Provider ${this.name} is offline. No API key configured.`,
      };
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${this.timeoutMs}ms`)), this.timeoutMs)
      );

      const apiPromise = this.callAPI(question, context);
      const res = await Promise.race([apiPromise, timeoutPromise]);
      const latencyMs = Date.now() - startTime;

      return {
        id: `${this.id}-${Date.now()}`,
        providerId: this.id,
        providerName: this.name,
        model: this.model,
        answer: res.text,
        sources: [],
        latencyMs,
        tokenUsage: res.tokenUsage,
        status: "success",
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = (err as Error).message || "Unknown error";
      const isTimeout = errorMsg.includes("Timeout");

      return {
        id: `${this.id}-${Date.now()}`,
        providerId: this.id,
        providerName: this.name,
        model: this.model,
        answer: "",
        sources: [],
        latencyMs,
        status: isTimeout ? "timeout" : "error",
        errorMessage: errorMsg,
      };
    }
  }
}

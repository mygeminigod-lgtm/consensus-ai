import { BaseProvider } from "../base";

export class OpenAIProvider extends BaseProvider {
  public id = "openai";
  public name = "OpenAI GPT-4o";
  public model = "gpt-4o";
  public capabilities = ["reasoning", "general", "math", "coding", "synthesis"];
  public description = "OpenAI flagship omni model with advanced multi-step reasoning.";

  private apiKey: string | undefined;

  constructor(customKey?: string) {
    super();
    this.apiKey = customKey || process.env.OPENAI_API_KEY;
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  protected async callAPI(question: string, context?: string): Promise<{
    text: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.apiKey) throw new Error("Missing OpenAI API key");

    const messages = [
      {
        role: "system",
        content: "You are an expert scientific and analytical assistant. Provide rigorous, direct, and factual answers without fluff.",
      },
    ];

    if (context) {
      messages.push({ role: "user", content: `Context:\n${context}` });
    }
    messages.push({ role: "user", content: question });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errBody.substring(0, 150)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response generated";

    return {
      text,
      tokenUsage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }
}

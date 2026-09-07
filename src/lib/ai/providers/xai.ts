import { BaseProvider } from "../base";

export class XAIProvider extends BaseProvider {
  public id = "xai";
  public name = "xAI Grok 2";
  public model = "grok-2-1212";
  public capabilities = ["reasoning", "truth_seeking", "current_information", "general"];
  public description = "xAI's frontier model designed for direct, truthful answering.";

  private apiKey: string | undefined;

  constructor(customKey?: string) {
    super();
    this.apiKey = customKey || process.env.XAI_API_KEY;
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  protected async callAPI(question: string, context?: string): Promise<{
    text: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.apiKey) throw new Error("Missing xAI API key");

    const messages = [
      {
        role: "system",
        content: "Provide accurate, objective, and analytically sound responses.",
      },
    ];

    if (context) {
      messages.push({ role: "user", content: `Context:\n${context}` });
    }
    messages.push({ role: "user", content: question });

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`xAI API error (${response.status}): ${errBody.substring(0, 150)}`);
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

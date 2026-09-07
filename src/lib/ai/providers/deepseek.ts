import { BaseProvider } from "../base";

export class DeepSeekProvider extends BaseProvider {
  public id = "deepseek";
  public name = "DeepSeek-V3";
  public model = "deepseek-chat";
  public capabilities = ["reasoning", "math", "coding", "logic"];
  public description = "DeepSeek flagship model optimized for complex reasoning, math, and code.";

  private apiKey: string | undefined;

  constructor(customKey?: string) {
    super();
    this.apiKey = customKey || process.env.DEEPSEEK_API_KEY;
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  protected async callAPI(question: string, context?: string): Promise<{
    text: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.apiKey) throw new Error("Missing DeepSeek API key");

    const messages = [
      {
        role: "system",
        content: "You are an analytical assistant. Provide rigorous, mathematically and technically sound answers.",
      },
    ];

    if (context) {
      messages.push({ role: "user", content: `Context:\n${context}` });
    }
    messages.push({ role: "user", content: question });

    const response = await fetch("https://api.deepseek.com/chat/completions", {
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
      throw new Error(`DeepSeek API error (${response.status}): ${errBody.substring(0, 150)}`);
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

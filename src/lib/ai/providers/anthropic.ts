import { BaseProvider } from "../base";

export class AnthropicProvider extends BaseProvider {
  public id = "anthropic";
  public name = "Anthropic Claude 3.5";
  public model = "claude-3-5-sonnet-20241022";
  public capabilities = ["reasoning", "coding", "academic", "analysis", "nuance"];
  public description = "Anthropic's leading model with deep analytical precision and code reasoning.";

  private apiKey: string | undefined;

  constructor(customKey?: string) {
    super();
    this.apiKey = customKey || process.env.ANTHROPIC_API_KEY;
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  protected async callAPI(question: string, context?: string): Promise<{
    text: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.apiKey) throw new Error("Missing Anthropic API key");

    const userPrompt = context ? `Context: ${context}\n\nQuestion: ${question}` : question;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        temperature: 0.2,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errBody.substring(0, 150)}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "No response generated";

    return {
      text,
      tokenUsage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }
}

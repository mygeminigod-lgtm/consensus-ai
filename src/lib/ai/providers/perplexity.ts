import { BaseProvider } from "../base";

export class PerplexityProvider extends BaseProvider {
  public id = "perplexity";
  public name = "Perplexity Sonar";
  public model = "sonar";
  public capabilities = ["search", "citations", "current_information", "research"];
  public description = "Search-augmented LLM with real-time web discovery and citation groundings.";

  private apiKey: string | undefined;

  constructor(customKey?: string) {
    super();
    this.apiKey = customKey || process.env.PERPLEXITY_API_KEY;
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  protected async callAPI(question: string, context?: string): Promise<{
    text: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.apiKey) throw new Error("Missing Perplexity API key");

    const messages = [
      {
        role: "system",
        content: "Be precise, factual, and cite authoritative sources directly.",
      },
    ];

    if (context) {
      messages.push({ role: "user", content: `Context:\n${context}` });
    }
    messages.push({ role: "user", content: question });

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
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
      throw new Error(`Perplexity API error (${response.status}): ${errBody.substring(0, 150)}`);
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

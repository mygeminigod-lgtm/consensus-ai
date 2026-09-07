import { BaseProvider } from "../base";

export class GeminiProvider extends BaseProvider {
  public id = "gemini";
  public name = "Google Gemini";
  public model = "gemini-2.0-flash";
  public capabilities = ["reasoning", "multimodal", "fast_inference", "academic", "math"];
  public description = "Google's state-of-the-art multimodal reasoning model with fast inference.";

  private apiKey: string | undefined;

  constructor(customKey?: string) {
    super();
    this.apiKey = customKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  }

  public async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  protected async callAPI(question: string, context?: string): Promise<{
    text: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    if (!this.apiKey) throw new Error("Missing Google Gemini API key");

    const promptText = context ? `Context: ${context}\n\nQuestion: ${question}` : question;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errBody.substring(0, 150)}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "No response generated";

    return {
      text,
      tokenUsage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }
}

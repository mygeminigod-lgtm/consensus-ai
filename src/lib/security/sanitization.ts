export class SecuritySanitizer {
  /**
   * Sanitizes user input to prevent prompt injection and control character manipulation.
   */
  public static sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") return "";

    // Trim and normalize whitespace
    let sanitized = input.trim();

    // Strip null bytes and non-printable control characters (except newline, tab, carriage return)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Neutralize prompt injection attempts targeting system delimiters
    // e.g. "System:", "[SYSTEM]", "Ignore previous instructions", "--- BEGIN INSTRUCTIONS ---"
    const injectionPatterns = [
      /(?:ignore|forget|disregard)\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|rules|prompts)/gi,
      /(?:you\s+are\s+now|act\s+as)\s+(?:DAN|unrestricted|jailbroken)/gi,
      /(?:system\s*:\s*|\[system\]|<\|im_start\|>system)/gi,
    ];

    for (const pattern of injectionPatterns) {
      sanitized = sanitized.replace(pattern, "[sanitized-instruction]");
    }

    return sanitized;
  }

  /**
   * Specifically sanitizes uploaded document content.
   * Document instructions are marked explicitly as untrusted data so the LLM does not execute them.
   */
  public static wrapUntrustedDocumentContext(documentText: string, filename: string): string {
    const cleanText = this.sanitizeInput(documentText);
    const maxChars = 25000;
    const truncated = cleanText.length > maxChars ? cleanText.substring(0, maxChars) + "\n...[Document truncated for length]" : cleanText;

    return `\n<UNTRUSTED_USER_DOCUMENT filename="${encodeURIComponent(filename)}">\n${truncated}\n</UNTRUSTED_USER_DOCUMENT>\n`;
  }

  /**
   * Sanitizes URLs to prevent javascript: or data: XSS attacks.
   */
  public static sanitizeUrl(url: string): string {
    if (!url) return "#";
    const trimmed = url.trim();
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
      return trimmed;
    }
    return "#";
  }
}

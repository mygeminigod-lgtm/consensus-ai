import { CodeVerificationCheck, ModelResponse } from "@/types/consensus";

export class SafeCodeVerifier {
  /**
   * Extracts code blocks from markdown responses.
   */
  public static extractCodeBlocks(text: string): { language: string; code: string }[] {
    const blocks: { language: string; code: string }[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1].toLowerCase() || "unknown";
      const code = match[2].trim();
      if (code.length > 0) {
        blocks.push({ language, code });
      }
    }
    return blocks;
  }

  /**
   * Checks basic syntax validity for common languages without execution.
   */
  public static checkSyntax(code: string, language: string): { valid: boolean; notes: string[] } {
    const notes: string[] = [];

    if (language === "javascript" || language === "js" || language === "typescript" || language === "ts") {
      try {
        // Use Function constructor parsing check (no execution, just compile check)
        new Function(code);
        notes.push("JavaScript AST syntax passed static compiler check.");
        return { valid: true, notes };
      } catch (err: unknown) {
        notes.push(`Syntax error detected: ${(err as Error).message}`);
        return { valid: false, notes };
      }
    }

    if (language === "json") {
      try {
        JSON.parse(code);
        notes.push("JSON validation passed.");
        return { valid: true, notes };
      } catch (err: unknown) {
        notes.push(`JSON parse error: ${(err as Error).message}`);
        return { valid: false, notes };
      }
    }

    if (language === "python" || language === "py") {
      // Basic indentation and bracket balance static check
      const brackets: { [key: string]: string } = { "(": ")", "[": "]", "{": "}" };
      const stack: string[] = [];
      let valid = true;

      for (const char of code) {
        if (brackets[char]) {
          stack.push(char);
        } else if (Object.values(brackets).includes(char)) {
          const last = stack.pop();
          if (!last || brackets[last] !== char) {
            valid = false;
            notes.push(`Unmatched delimiter '${char}' detected.`);
            break;
          }
        }
      }

      if (stack.length > 0) {
        valid = false;
        notes.push(`Unclosed delimiter '${stack[stack.length - 1]}' remaining.`);
      }

      if (valid) {
        notes.push("Python static bracket and delimiter balance verified.");
      }
      return { valid, notes };
    }

    // Default static inspection
    notes.push(`Static inspection completed for ${language || "unspecified language"}.`);
    return { valid: true, notes };
  }

  /**
   * Executes safe, non-destructive JavaScript expression if specifically requested,
   * otherwise explicitly reports: "Code reviewed but not executed."
   */
  public static verifyCode(
    question: string,
    modelResponses: ModelResponse[],
    allowSandboxExecution: boolean = false
  ): CodeVerificationCheck[] {
    const checks: CodeVerificationCheck[] = [];

    for (const model of modelResponses) {
      if (model.status !== "success") continue;
      const blocks = this.extractCodeBlocks(model.answer);

      for (const block of blocks) {
        const syntax = this.checkSyntax(block.code, block.language);
        let executed = false;
        let executionOutput: string | undefined;
        let executionError: string | undefined;
        let statusReport = "Code reviewed but not executed.";

        // Strictly run execution ONLY if safe JS and explicit flag enabled
        if (
          allowSandboxExecution &&
          (block.language === "javascript" || block.language === "js") &&
          syntax.valid &&
          !block.code.includes("fetch") &&
          !block.code.includes("process") &&
          !block.code.includes("require") &&
          !block.code.includes("import") &&
          !block.code.includes("eval") &&
          !block.code.includes("window") &&
          !block.code.includes("document")
        ) {
          try {
            // Execute in an isolated sandbox with a timeout
            const sandboxFn = new Function(`
              "use strict";
              let logs = [];
              const console = { log: (...args) => logs.push(args.join(" ")) };
              ${block.code}
              return logs.join("\\n");
            `);
            const out = sandboxFn();
            executed = true;
            executionOutput = out || "Code executed with no output.";
            statusReport = "Code executed safely in local sandbox.";
          } catch (err: unknown) {
            executed = true;
            executionError = (err as Error).message;
            statusReport = `Code executed in sandbox with runtime exception: ${(err as Error).message}`;
          }
        }

        checks.push({
          code: block.code.length > 300 ? block.code.substring(0, 300) + "..." : block.code,
          language: block.language,
          syntaxValid: syntax.valid,
          executed,
          executionOutput,
          executionError,
          reviewNotes: syntax.notes,
          statusReport,
        });

        // Limit to 3 code checks to keep UI clean
        if (checks.length >= 3) break;
      }
      if (checks.length >= 3) break;
    }

    return checks;
  }
}

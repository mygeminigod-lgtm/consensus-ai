import { evaluate, parse } from "mathjs";
import { MathVerificationCheck, ModelResponse } from "@/types/consensus";

export class DeterministicMathEngine {
  /**
   * Safely checks if a question contains mathematical expressions or arithmetic problems.
   */
  public static detectMathExpression(input: string): string[] {
    const expressions: string[] = [];

    // Direct equations: e.g. "3x + 12 = 48" or "4x - 8 = 24"
    const cleaned = input.replace(/^(?:what is|solve for \w+:?|solve|calculate|evaluate|compute)\s+/i, "");
    const equationMatch = cleaned.match(/([0-9a-z\+\-\*\/\^\(\)\s]+=[0-9a-z\+\-\*\/\^\(\)\s]+)/i);
    if (equationMatch && equationMatch[1]) {
      const eq = equationMatch[1].replace(/[?!=]+$/, "").trim();
      expressions.push(eq);
      return expressions;
    }

    // Common arithmetic patterns: "what is 144 / 12", "15 * 4 + 10"
    const arithmeticRegex = /(?:calculate|solve|evaluate|compute|what is)?\s*([0-9\.\s\+\-\*\/\^\(\)]+(?:=|\^|\/|\*|\+|\-)[0-9\.\s\+\-\*\/\^\(\)]+)/gi;
    let match;
    while ((match = arithmeticRegex.exec(cleaned)) !== null) {
      const expr = match[1].replace(/[?!=]+$/, "").trim();
      if (expr.length > 2 && /\d/.test(expr)) {
        expressions.push(expr);
      }
    }

    return Array.from(new Set(expressions));
  }

  /**
   * Evaluates a mathematical expression deterministically using mathjs.
   * Handles equations like "3x + 12 = 48" by rearranging or solving symbolically/numerically.
   */
  public static evaluateExpression(rawExpression: string): {
    success: boolean;
    result: number | string;
    normalizedExpression: string;
    explanation: string;
  } {
    try {
      let expr = rawExpression.trim();

      // Clean trailing punctuation and conversational prefixes
      expr = expr.replace(/^(?:what is|solve for \w+:?|solve|calculate|evaluate|compute)\s+/i, "");
      expr = expr.replace(/[?!=]+$/, "").trim();

      // Check for simple single-variable linear equation: e.g. "3x + 12 = 48" or "4x - 8 = 24"
      const linearEqMatch = expr.match(/(?:^|\s)([0-9.]*)\s*([a-zA-Z])\s*([+\-])\s*([0-9.]+)\s*=\s*([0-9.]+)(?:\s|$)/);
      if (linearEqMatch) {
        const coeffStr = linearEqMatch[1];
        const coeff = coeffStr === "" ? 1 : parseFloat(coeffStr);
        const variable = linearEqMatch[2];
        const op = linearEqMatch[3];
        const constant = parseFloat(linearEqMatch[4]);
        const rightSide = parseFloat(linearEqMatch[5]);

        const adjustedRight = op === "+" ? rightSide - constant : rightSide + constant;
        const solution = adjustedRight / coeff;

        return {
          success: true,
          result: `${variable} = ${solution}`,
          normalizedExpression: `${coeffStr}${variable} ${op} ${constant} = ${rightSide}`,
          explanation: `Solved linearly: ${coeff}${variable} = ${adjustedRight} ➔ ${variable} = ${solution}`,
        };
      }

      // Check if expression is an equality "expr1 = expr2"
      if (expr.includes("=")) {
        const [left, right] = expr.split("=").map((s) => s.trim());
        const leftVal = evaluate(left);
        const rightVal = evaluate(right);
        const isEqual = Math.abs(Number(leftVal) - Number(rightVal)) < 1e-9;
        return {
          success: true,
          result: isEqual ? "True" : "False",
          normalizedExpression: `${left} == ${right}`,
          explanation: `Calculated Left: ${leftVal}, Right: ${rightVal}. Equality test: ${isEqual}`,
        };
      }

      // Pure numeric / algebraic evaluation
      const res = evaluate(expr);
      const formatted = typeof res === "number" ? (Number.isInteger(res) ? res : parseFloat(res.toFixed(6))) : String(res);

      return {
        success: true,
        result: formatted,
        normalizedExpression: expr,
        explanation: `Deterministic mathjs parser calculated: ${formatted}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        result: "Evaluation failed",
        normalizedExpression: rawExpression,
        explanation: `Deterministic calculation could not parse expression: ${(err as Error).message}`,
      };
    }
  }

  /**
   * Extracts numerical or mathematical answers from model responses.
   */
  public static extractModelNumericAnswer(text: string, targetVariable?: string): string | number {
    // Check for target variable, e.g. "x = 12"
    if (targetVariable) {
      const varRegex = new RegExp(`${targetVariable}\\s*=\\s*([-0-9.]+)`, "i");
      const varMatch = text.match(varRegex);
      if (varMatch && varMatch[1]) {
        return parseFloat(varMatch[1]);
      }
    }

    // Check for "answer is 12" or "result is 12" or "equals 12" or "therefore, 12"
    const ansMatch = text.match(/(?:answer|result|equals|solution|therefore|value is|is)\s*(?:is)?\s*[:=]?\s*([-0-9.]+)/i);
    if (ansMatch && ansMatch[1]) {
      return parseFloat(ansMatch[1]);
    }

    // Check for standalone numbers in boxed or bold notation: \boxed{12} or **12**
    const boxedMatch = text.match(/(?:\\boxed\{|\*\*)([-0-9.]+)(?:\}|\*\*)/);
    if (boxedMatch && boxedMatch[1]) {
      return parseFloat(boxedMatch[1]);
    }

    return "No distinct numeric answer found";
  }

  /**
   * Performs end-to-end math verification comparing model outputs to deterministic calculation.
   */
  public static verifyMath(
    question: string,
    modelResponses: ModelResponse[]
  ): MathVerificationCheck[] {
    const expressions = this.detectMathExpression(question);
    if (expressions.length === 0) {
      return [];
    }

    const checks: MathVerificationCheck[] = [];

    for (const expr of expressions) {
      const evalResult = this.evaluateExpression(expr);
      if (!evalResult.success) continue;

      const calcValue = evalResult.result;
      const targetVarMatch = String(calcValue).match(/^([a-zA-Z])\s*=\s*/);
      const targetVar = targetVarMatch ? targetVarMatch[1] : undefined;

      const modelResults = modelResponses
        .filter((m) => m.status === "success")
        .map((model) => {
          const extracted = this.extractModelNumericAnswer(model.answer, targetVar);
          let matches = false;

          const calcNumber = typeof calcValue === "number" ? calcValue : parseFloat(String(calcValue).replace(/^[a-zA-Z]\s*=\s*/, ""));
          if (!isNaN(calcNumber) && typeof extracted === "number") {
            matches = Math.abs(calcNumber - extracted) < 0.001;
          } else {
            matches = String(calcValue).toLowerCase() === String(extracted).toLowerCase() ||
                      String(model.answer).toLowerCase().includes(String(calcValue).toLowerCase());
          }

          return {
            providerId: model.providerId,
            providerName: model.providerName,
            extractedResult: extracted,
            matchesCalculator: matches,
          };
        });

      const discrepancies = modelResults
        .filter((m) => !m.matchesCalculator)
        .map(
          (m) =>
            `${m.providerName} produced '${m.extractedResult}', which diverges from deterministic calculation '${calcValue}'`
        );

      checks.push({
        expression: evalResult.normalizedExpression,
        calculatedResult: calcValue,
        modelResults,
        isIndependentlyVerified: evalResult.success,
        explanation: evalResult.explanation,
        discrepancies,
      });
    }

    return checks;
  }
}

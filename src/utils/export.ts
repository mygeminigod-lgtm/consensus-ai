import type { FinalAnswer } from '@/types/consensus';

export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}

export function exportAsMarkdown(answer: FinalAnswer): string {
  let md = `# ${answer.question}\n\n`;
  
  if (answer.isDemo) {
    md += `> **DEMO MODE**: This is a simulated response.\n\n`;
  }
  
  md += `## Direct Answer\n\n${answer.directAnswer}\n\n`;
  md += `## Why\n\n${answer.whyExplanation}\n\n`;
  md += `## Evidence Summary\n\n${answer.evidenceSummary}\n\n`;
  
  md += `## Confidence: ${answer.confidence.level}\n`;
  md += `Score: ${(answer.confidence.score * 100).toFixed(0)}%\n`;
  md += `${answer.confidence.rationale}\n\n`;
  
  if (answer.claims && answer.claims.length > 0) {
    md += `## Claims & Evidence\n\n`;
    answer.claims.forEach(claim => {
      md += `### ${claim.text}\n`;
      md += `- Status: ${claim.verificationStatus}\n`;
      md += `- Category: ${claim.category}\n`;
      if (claim.supportingModels.length > 0) {
        md += `- Supported by: ${claim.supportingModels.join(', ')}\n`;
      }
      if (claim.contradictingModels.length > 0) {
        md += `- Contradicted by: ${claim.contradictingModels.join(', ')}\n`;
      }
      md += `\n`;
    });
  }
  
  if (answer.sources && answer.sources.length > 0) {
    md += `## Sources\n\n`;
    answer.sources.forEach((source, index) => {
      md += `${index + 1}. [${source.title}](${source.url}) - ${source.publisher} (${source.date || 'No date'})\n`;
    });
    md += `\n`;
  }
  
  if (answer.modelsConsulted && answer.modelsConsulted.length > 0) {
    md += `## Models Consulted\n\n`;
    answer.modelsConsulted.forEach((res: any) => {
      md += `- **${res.providerName}** (${res.model})\n`;
    });
  }
  
  return md;
}

export function exportAsPlainText(answer: FinalAnswer): string {
  let text = `Question: ${answer.question}\n\n`;
  if (answer.isDemo) {
    text += `[DEMO MODE]\n\n`;
  }
  text += `Answer:\n${answer.directAnswer}\n\n`;
  text += `Why:\n${answer.whyExplanation}\n\n`;
  text += `Confidence: ${answer.confidence.level} (${(answer.confidence.score * 100).toFixed(0)}%)\n`;
  text += `${answer.confidence.rationale}\n`;
  return text;
}

import { ModelResponse } from '@/types/consensus';

export interface AIProvider {
  id: string;
  name: string;
  model: string;
  capabilities: string[];
  description?: string;
  isAvailable(): Promise<boolean>;
  answer(question: string, context?: string, systemPrompt?: string): Promise<ModelResponse>;
}

import { NextResponse } from 'next/server';
import type { ProviderConfig } from '@/types/consensus';

export async function GET() {
  const providers: ProviderConfig[] = [
    {
      id: 'openai',
      name: 'GPT-4o',
      model: 'gpt-4o',
      enabled: true,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      badgeStatus: process.env.OPENAI_API_KEY ? 'connected' : 'offline',
      capabilities: ['reasoning', 'coding', 'math', 'writing', 'analysis'],
      description: 'OpenAI GPT-4o — strong general reasoning and coding',
    },
    {
      id: 'anthropic',
      name: 'Claude 3.5 Sonnet',
      model: 'claude-3-5-sonnet-20241022',
      enabled: true,
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      badgeStatus: process.env.ANTHROPIC_API_KEY ? 'connected' : 'offline',
      capabilities: ['reasoning', 'analysis', 'coding', 'writing'],
      description: 'Anthropic Claude 3.5 Sonnet — excellent reasoning and safety',
    },
    {
      id: 'gemini',
      name: 'Gemini 1.5 Pro',
      model: 'gemini-1.5-pro-latest',
      enabled: true,
      hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
      badgeStatus: process.env.GOOGLE_AI_API_KEY ? 'connected' : 'offline',
      capabilities: ['reasoning', 'multimodal', 'coding', 'analysis'],
      description: 'Google Gemini 1.5 Pro — multimodal reasoning',
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      model: 'deepseek-chat',
      enabled: true,
      hasApiKey: !!process.env.DEEPSEEK_API_KEY,
      badgeStatus: process.env.DEEPSEEK_API_KEY ? 'connected' : 'offline',
      capabilities: ['reasoning', 'coding', 'math'],
      description: 'DeepSeek — strong on math and coding',
    },
    {
      id: 'mistral',
      name: 'Mistral Large',
      model: 'mistral-large-latest',
      enabled: true,
      hasApiKey: !!process.env.MISTRAL_API_KEY,
      badgeStatus: process.env.MISTRAL_API_KEY ? 'connected' : 'offline',
      capabilities: ['reasoning', 'multilingual', 'coding'],
      description: 'Mistral Large — multilingual reasoning',
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      model: 'llama-3.1-sonar-large-128k-online',
      enabled: true,
      hasApiKey: !!process.env.PERPLEXITY_API_KEY,
      badgeStatus: process.env.PERPLEXITY_API_KEY ? 'connected' : 'offline',
      capabilities: ['web_search', 'realtime_info', 'citations'],
      description: 'Perplexity — real-time web search and citations',
    },
    {
      id: 'xai',
      name: 'Grok',
      model: 'grok-beta',
      enabled: true,
      hasApiKey: !!process.env.XAI_API_KEY,
      badgeStatus: process.env.XAI_API_KEY ? 'connected' : 'offline',
      capabilities: ['reasoning', 'analysis', 'writing'],
      description: 'xAI Grok — general reasoning',
    },
    {
      id: 'demo',
      name: 'Demo Mode',
      model: 'demo-static-v1',
      enabled: true,
      hasApiKey: true,
      badgeStatus: 'connected',
      capabilities: ['demo'],
      description: 'Static demonstration data — no API keys required',
    },
  ];

  return NextResponse.json(providers);
}

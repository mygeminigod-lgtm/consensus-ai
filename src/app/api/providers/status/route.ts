import { NextResponse } from "next/server";
import { ModelRouter } from "@/lib/ai/router";
import { ProviderConfig } from "@/types/consensus";

export async function GET() {
  const providers = ModelRouter.getAllProviders();
  const statuses: ProviderConfig[] = [];

  for (const provider of providers) {
    const isReady = await provider.isAvailable();
    statuses.push({
      id: provider.id,
      name: provider.name,
      model: provider.model,
      enabled: true,
      hasApiKey: isReady,
      badgeStatus: isReady ? "connected" : "offline",
      capabilities: provider.capabilities,
      description: "",
    });
  }

  return NextResponse.json({ providers: statuses });
}

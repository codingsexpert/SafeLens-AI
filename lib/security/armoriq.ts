export type PolicyDecision = {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
  mode: "demo" | "armoriq-live";
  tokenIssued: boolean;
};

type PolicyInput = {
  actor: string;
  action: string;
  target: string;
};

export async function evaluateArmorIQPolicy(
  input: PolicyInput,
): Promise<PolicyDecision> {
  const { getSecurityConfig, hasArmorIQLiveConfig } = await import(
    "@/lib/security/config"
  );
  const config = getSecurityConfig();

  if (!hasArmorIQLiveConfig(config)) {
    return {
      allowed: true,
      requiresApproval: false,
      reason:
        "Demo mode active because ArmorIQ environment variables are not configured yet.",
      mode: "demo",
      tokenIssued: false,
    };
  }

  try {
    const sdk = (await import("@armoriq/sdk")) as {
      ArmorIQClient?: new (options: Record<string, unknown>) => {
        capturePlan?: (
          llm: string,
          prompt: string,
          plan: Record<string, unknown>,
        ) => Promise<unknown> | unknown;
        getIntentToken?: (
          capturedPlan: unknown,
          policy?: Record<string, unknown>,
          validitySeconds?: number,
        ) => Promise<unknown>;
        invoke?: (
          mcp: string,
          action: string,
          intentToken: unknown,
          params?: Record<string, unknown>,
        ) => Promise<unknown>;
      };
    };

    if (!sdk.ArmorIQClient) {
      throw new Error("ArmorIQClient export was not found.");
    }

    const client = new sdk.ArmorIQClient({
      apiKey: config.armoriqApiKey,
      userId: config.armoriqUserId ?? "demo-user",
      agentId: config.armoriqAgentId ?? "kill-switch-agent",
      iapEndpoint: config.iapEndpoint,
      proxyEndpoint: config.proxyEndpoint,
      backendEndpoint: config.backendEndpoint,
      timeout: config.armoriqTimeoutMs,
      maxRetries: config.armoriqMaxRetries,
    });

    const plan = {
      goal: "Analyze suspicious content and explain the result safely.",
      steps: [
        {
          action: input.action,
          mcp: config.armoriqTriageMcp,
          tool: config.armoriqScanAction,
          params: {
            actor: input.actor,
            target: input.target,
          },
          inputs: {
            actor: input.actor,
            target: input.target,
          },
        },
      ],
    };

    const capturedPlan = await client.capturePlan?.(
      "gpt-4o-mini",
      input.target,
      plan,
    );

    if (!capturedPlan) {
      throw new Error("ArmorIQ could not capture the plan.");
    }

    const intentToken = await client.getIntentToken?.(
      capturedPlan,
      {
        allow: [`${config.armoriqTriageMcp}:${input.action}`],
        deny: [],
      },
      300,
    );

    return {
      allowed: true,
      requiresApproval: false,
      reason:
        intentToken
          ? "ArmorIQ captured the plan and issued an intent token for this triage request."
          : "ArmorIQ captured the plan for this triage request.",
      mode: "armoriq-live",
      tokenIssued: Boolean(intentToken),
    };
  } catch (error) {
    return {
      allowed: true,
      requiresApproval: false,
      reason:
        error instanceof Error
          ? `ArmorIQ live call failed, so the app fell back to demo mode: ${error.message}`
          : "ArmorIQ live call failed, so the app fell back to demo mode.",
      mode: "demo",
      tokenIssued: false,
    };
  }
}

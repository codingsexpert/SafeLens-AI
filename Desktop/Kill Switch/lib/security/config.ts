type AppSecurityConfig = {
  armoriqApiKey?: string;
  armoriqUserId?: string;
  armoriqAgentId?: string;
  iapEndpoint?: string;
  proxyEndpoint?: string;
  backendEndpoint?: string;
  armoriqTimeoutMs?: number;
  armoriqMaxRetries?: number;
  armoriqTriageMcp: string;
  armoriqScanAction: string;
  armorclawApiUrl?: string;
  armorclawApiKey?: string;
};

export function getSecurityConfig(): AppSecurityConfig {
  return {
    armoriqApiKey: process.env.ARMORIQ_API_KEY,
    armoriqUserId: process.env.ARMORIQ_USER_ID,
    armoriqAgentId: process.env.ARMORIQ_AGENT_ID,
    iapEndpoint: process.env.IAP_ENDPOINT,
    proxyEndpoint: process.env.PROXY_ENDPOINT,
    backendEndpoint: process.env.BACKEND_ENDPOINT,
    armoriqTimeoutMs: parseInteger(process.env.ARMORIQ_TIMEOUT_MS),
    armoriqMaxRetries: parseInteger(process.env.ARMORIQ_MAX_RETRIES),
    armoriqTriageMcp: process.env.ARMORIQ_TRIAGE_MCP ?? "security-mcp",
    armoriqScanAction: process.env.ARMORIQ_SCAN_ACTION ?? "scan_artifact",
    armorclawApiUrl: process.env.ARMORCLAW_API_URL,
    armorclawApiKey: process.env.ARMORCLAW_API_KEY,
  };
}

export function hasArmorIQLiveConfig(config = getSecurityConfig()): boolean {
  return Boolean(config.armoriqApiKey);
}

export function hasArmorClawLiveConfig(config = getSecurityConfig()): boolean {
  return Boolean(config.armorclawApiUrl);
}

function parseInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

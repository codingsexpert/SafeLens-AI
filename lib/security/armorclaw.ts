export type ScanFinding = {
  severity: "low" | "medium" | "high";
  summary: string;
  evidence: string[];
  mode: "demo" | "armoriq-live";
};

export async function runArmorClawScan(target: string): Promise<ScanFinding> {
  const { getSecurityConfig, hasArmorClawLiveConfig } = await import(
    "@/lib/security/config"
  );
  const config = getSecurityConfig();

  if (!hasArmorClawLiveConfig(config)) {
    return {
      severity: "high",
      summary:
        "Demo ArmorClaw scan found a suspicious redirecting URL and urgency markers.",
      evidence: [
        "Sender language requests immediate financial action.",
        "Embedded link appears to route through a redirect chain.",
        "Message requests sensitive data confirmation outside standard workflow.",
      ],
      mode: "demo",
    };
  }

  try {
    const response = await fetch(config.armorclawApiUrl as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.armorclawApiKey
          ? {
              Authorization: `Bearer ${config.armorclawApiKey}`,
            }
          : {}),
      },
      body: JSON.stringify({
        target,
        kind: "triage-input",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ArmorClaw endpoint returned ${response.status}.`);
    }

    const data = (await response.json()) as Partial<ScanFinding>;

    return {
      severity: data.severity ?? "medium",
      summary: data.summary ?? "ArmorClaw completed a live scan.",
      evidence:
        data.evidence && data.evidence.length > 0
          ? data.evidence
          : ["Live ArmorClaw endpoint responded without detailed evidence."],
      mode: "armoriq-live",
    };
  } catch (error) {
    return {
      severity: "high",
      summary:
        error instanceof Error
          ? `ArmorClaw live scan failed, so demo findings were used: ${error.message}`
          : "ArmorClaw live scan failed, so demo findings were used.",
      evidence: [
        "Live scan endpoint was unreachable or returned an invalid response.",
        "The app stayed safe by switching back to a non-destructive demo result.",
      ],
      mode: "demo",
    };
  }
}

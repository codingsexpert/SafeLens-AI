import { mockAnalysis } from "@/lib/mock-analysis";
import { analyzePromptHeuristics } from "@/lib/security/heuristics";
import { evaluateArmorIQPolicy } from "@/lib/security/armoriq";
import { runArmorClawScan } from "@/lib/security/armorclaw";
import type { AnalysisResponse } from "@/lib/types";

export async function analyzeThreatPrompt(
  prompt: string,
): Promise<AnalysisResponse> {
  const policyDecision = await evaluateArmorIQPolicy({
    actor: "demo-user",
    action: "triage.scan",
    target: prompt,
  });

  const scanFinding = await runArmorClawScan(prompt);
  const heuristic = analyzePromptHeuristics(prompt);
  const mode =
    policyDecision.mode === "armoriq-live" || scanFinding.mode === "armoriq-live"
      ? "armoriq-live"
      : "demo";
  const integrations = [
    {
      label: "ArmorIQ policy gate",
      status: policyDecision.mode === "armoriq-live" ? "live" : "demo",
      detail: policyDecision.reason,
    },
    {
      label: "ArmorClaw scanner",
      status: scanFinding.mode === "armoriq-live" ? "live" : "demo",
      detail: scanFinding.summary,
    },
  ] as const;

  return {
    ...mockAnalysis,
    mode,
    verdict: heuristic.verdict,
    riskScore: heuristic.riskScore,
    summary: `${heuristic.executiveSummary} Policy: ${policyDecision.reason} Scan: ${scanFinding.summary}`,
    policySummary: policyDecision.reason,
    scanSummary: scanFinding.summary,
    executiveSummary:
      mode === "armoriq-live"
        ? `${heuristic.executiveSummary} Live policy and scan integrations were also attempted for this case.`
        : heuristic.executiveSummary,
    evidence: [...heuristic.evidence, ...scanFinding.evidence].slice(0, 5),
    recommendedActions: policyDecision.allowed
      ? heuristic.recommendedActions
      : [
          "Request approval before taking any containment or forwarding action.",
          "Share the read-only findings with the security lead.",
          "Keep the message isolated until policy allows the next step.",
        ],
    integrations: [...integrations],
    cases: [
      {
        id: "case-live-201",
        title: "Current suspicious intake",
        source: mode === "armoriq-live" ? "Live governed scan" : "Demo governed scan",
        status: "high-risk",
        timestamp: "now",
      },
      ...mockAnalysis.cases.slice(1),
    ],
    insights: [
      mockAnalysis.insights[0],
      {
        label: "Policy action",
        value: policyDecision.allowed ? "Allowed" : "Blocked",
        detail: policyDecision.reason,
      },
      {
        label: "ArmorClaw signal",
        value: scanFinding.severity.toUpperCase(),
        detail: scanFinding.evidence[0],
      },
    ],
    auditEvents: [
      {
        time: "12:04",
        title: "User submitted content for AI-guided triage.",
        kind: "User input",
      },
      {
        time: "12:05",
        title: `ArmorIQ policy decision: ${policyDecision.reason}`,
        kind: "Policy gate",
      },
      {
        time: "12:06",
        title: `ArmorClaw finding: ${scanFinding.summary}`,
        kind: "Scan result",
      },
      {
        time: "12:06",
        title: policyDecision.tokenIssued
          ? "Intent token was issued for the declared triage step."
          : "No live intent token was issued; demo fallback remained active.",
        kind: "Intent proof",
      },
      {
        time: "12:06",
        title: "Incident-ready summary prepared for a non-technical teammate.",
        kind: "Agent output",
      },
    ],
  };
}

import type { AnalysisResponse } from "./types";

export const mockAnalysis: AnalysisResponse = {
  mode: "demo",
  verdict: "Likely phishing",
  riskScore: "8.7/10",
  summary:
    "The message uses urgency, asks for sensitive financial changes, and routes through a suspicious redirecting link. The safest next step is to avoid clicking anything, notify finance leadership, and generate an incident report.",
  policySummary: "Demo policy allows read-only triage actions.",
  scanSummary: "Mock ArmorClaw scan found a suspicious redirect and urgency markers.",
  executiveSummary:
    "A likely phishing attempt targeted payroll operations with urgency and redirect-based link behavior. No destructive action was taken, and the case is ready for escalation or reporting.",
  evidence: [
    "Urgent financial language pressures the user to act immediately.",
    "The sender context does not match the requested action path.",
    "The embedded link appears to route through a redirect chain.",
  ],
  recommendedActions: [
    "Do not click links or submit financial information.",
    "Notify the finance lead and security contact with the generated summary.",
    "Mark the message for quarantine or escalation after approval.",
  ],
  integrations: [
    {
      label: "ArmorIQ policy gate",
      status: "demo",
      detail: "Fallback mode is active until live credentials are added.",
    },
    {
      label: "ArmorClaw scanner",
      status: "demo",
      detail: "Demo scan findings are being used until a live endpoint is configured.",
    },
  ],
  cases: [
    {
      id: "case-104",
      title: "Payroll reset impersonation",
      source: "Email triage",
      status: "high-risk",
      timestamp: "2m ago",
    },
    {
      id: "case-103",
      title: "Vendor portal redirect",
      source: "URL inspection",
      status: "monitoring",
      timestamp: "18m ago",
    },
    {
      id: "case-102",
      title: "Unknown attachment hash",
      source: "Artifact scan",
      status: "contained",
      timestamp: "44m ago",
    },
  ],
  insights: [
    {
      label: "Threat posture",
      value: "Likely phishing",
      detail: "Spoofed sender and urgency language detected.",
    },
    {
      label: "Policy action",
      value: "Escalation gated",
      detail: "External forwarding blocked until approval.",
    },
    {
      label: "Recommended move",
      value: "Quarantine draft",
      detail: "Generate report and notify finance lead.",
    },
  ],
  auditEvents: [
    {
      time: "12:04",
      title: "User asked for guidance on a suspicious payroll email.",
      kind: "User input",
    },
    {
      time: "12:05",
      title: "Triage agent extracted sender mismatch and embedded redirect.",
      kind: "Agent step",
    },
    {
      time: "12:05",
      title: "ArmorIQ approved read-only scans and denied auto-forward action.",
      kind: "Policy gate",
    },
    {
      time: "12:06",
      title: "ArmorClaw marked the URL as suspicious and raised a high-confidence warning.",
      kind: "Scan result",
    },
  ],
};

export type InsightCard = {
  label: string;
  value: string;
  detail: string;
};

export type AuditEvent = {
  time: string;
  title: string;
  kind: string;
};

export type IntegrationStatus = {
  label: string;
  status: "live" | "demo" | "missing";
  detail: string;
};

export type CaseRecord = {
  id: string;
  title: string;
  source: string;
  status: "high-risk" | "monitoring" | "contained";
  timestamp: string;
};

export type AnalysisResponse = {
  mode: "demo" | "armoriq-live";
  verdict: string;
  riskScore: string;
  summary: string;
  policySummary: string;
  scanSummary: string;
  executiveSummary: string;
  evidence: string[];
  recommendedActions: string[];
  integrations: IntegrationStatus[];
  cases: CaseRecord[];
  insights: InsightCard[];
  auditEvents: AuditEvent[];
};

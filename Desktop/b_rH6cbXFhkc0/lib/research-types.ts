import { z } from "zod"

export type ResearchDepth = "quick" | "standard" | "deep"

export type ResearchTemplate =
  | "general"
  | "literature-review"
  | "market-analysis"
  | "competitor-research"
  | "scientific-summary"
  | "news-digest"

export type AgentName = "search" | "summarize" | "insight" | "contradict" | "factcheck"

export type AgentStatus = "idle" | "pending" | "running" | "done" | "error"

export const SOURCE_TYPES = ["peer-reviewed", "preprint", "news", "blog", "report", "wiki", "book"] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

// ----- Zod schemas (used by structured output) -----
export const SourceSchema = z.object({
  id: z.string().describe("A short unique id like s1, s2"),
  title: z.string(),
  author: z.string().describe("Author or publication name"),
  year: z.number().describe("Publication year"),
  url: z.string().describe("A plausible URL for the source"),
  type: z.enum(SOURCE_TYPES),
  quality: z.number().min(0).max(100).describe("Source reliability score 0-100"),
  snippet: z.string().describe("One-sentence snippet about the source"),
})

export const SourcesOutputSchema = z.object({
  sources: z.array(SourceSchema),
})

export const SummarySchema = z.object({
  sourceId: z.string(),
  tldr: z.string().describe("One-line TL;DR"),
  keyPoints: z.array(z.string()).describe("3-5 key bullet points"),
  methodology: z.string().nullable().describe("Methodology used, or null"),
})

export const SummariesOutputSchema = z.object({
  summaries: z.array(SummarySchema),
})

export const InsightSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(100),
  sourceIds: z.array(z.string()),
  category: z.enum(["finding", "trend", "gap", "implication"]),
})

export const InsightsOutputSchema = z.object({
  executiveSummary: z.string(),
  insights: z.array(InsightSchema),
})

export const ContradictionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  claimA: z.string(),
  claimB: z.string(),
  sourceIdsA: z.array(z.string()),
  sourceIdsB: z.array(z.string()),
  resolution: z.string().describe("Likely resolution or context"),
})

export const ContradictionsOutputSchema = z.object({
  contradictions: z.array(ContradictionSchema),
})

export const FactCheckSchema = z.object({
  id: z.string(),
  claim: z.string(),
  verdict: z.enum(["verified", "likely-true", "disputed", "unverified", "false"]),
  reasoning: z.string(),
  sourceIds: z.array(z.string()),
})

export const FactChecksOutputSchema = z.object({
  factChecks: z.array(FactCheckSchema),
  followUpQuestions: z.array(z.string()).describe("3-5 follow-up research questions"),
  keywords: z.array(z.string()).describe("Top 8-12 concept keywords for knowledge graph"),
})

// ----- Client-side types -----
export type Source = z.infer<typeof SourceSchema>
export type Summary = z.infer<typeof SummarySchema>
export type Insight = z.infer<typeof InsightSchema>
export type Contradiction = z.infer<typeof ContradictionSchema>
export type FactCheck = z.infer<typeof FactCheckSchema>

export interface ResearchDocument {
  id: string
  topic: string
  depth: ResearchDepth
  template: ResearchTemplate
  createdAt: number
  executiveSummary: string
  sources: Source[]
  summaries: Summary[]
  insights: Insight[]
  contradictions: Contradiction[]
  factChecks: FactCheck[]
  followUpQuestions: string[]
  keywords: string[]
}

// ----- Streaming event types -----
export type ResearchEvent =
  | { type: "agent_status"; agent: AgentName; status: AgentStatus; note?: string }
  | { type: "thinking"; agent: AgentName; text: string }
  | { type: "sources"; sources: Source[] }
  | { type: "summaries"; summaries: Summary[] }
  | { type: "insights"; executiveSummary: string; insights: Insight[] }
  | { type: "contradictions"; contradictions: Contradiction[] }
  | {
      type: "factchecks"
      factChecks: FactCheck[]
      followUpQuestions: string[]
      keywords: string[]
    }
  | { type: "error"; message: string }
  | { type: "complete" }

export const AGENT_META: Record<
  AgentName,
  { label: string; description: string; colorVar: string; icon: string }
> = {
  search: {
    label: "Web Search Agent",
    description: "Discovers relevant sources across the web and academic databases.",
    colorVar: "var(--chart-1)",
    icon: "Search",
  },
  summarize: {
    label: "Summarization Agent",
    description: "Extracts key points, TL;DRs and methodology from each source.",
    colorVar: "var(--chart-2)",
    icon: "FileText",
  },
  insight: {
    label: "Insight Generation Agent",
    description: "Synthesizes findings, trends, gaps and implications across sources.",
    colorVar: "var(--chart-4)",
    icon: "Lightbulb",
  },
  contradict: {
    label: "Contradiction Detector",
    description: "Finds conflicting claims between sources and proposes resolutions.",
    colorVar: "var(--chart-5)",
    icon: "GitCompareArrows",
  },
  factcheck: {
    label: "Fact-Checker Agent",
    description: "Verifies key claims, rates confidence and surfaces follow-up questions.",
    colorVar: "var(--chart-3)",
    icon: "ShieldCheck",
  },
}

export const AGENT_ORDER: AgentName[] = ["search", "summarize", "insight", "contradict", "factcheck"]

export const TEMPLATES: { value: ResearchTemplate; label: string; hint: string }[] = [
  { value: "general", label: "General Research", hint: "Balanced mix of sources" },
  { value: "literature-review", label: "Literature Review", hint: "Academic papers & preprints" },
  { value: "market-analysis", label: "Market Analysis", hint: "Industry reports & trends" },
  { value: "competitor-research", label: "Competitor Research", hint: "Companies, products, positioning" },
  { value: "scientific-summary", label: "Scientific Summary", hint: "Peer-reviewed findings" },
  { value: "news-digest", label: "News Digest", hint: "Recent news & current events" },
]

export const DEPTH_CONFIG: Record<ResearchDepth, { sources: number; label: string; hint: string }> = {
  quick: { sources: 4, label: "Quick", hint: "~4 sources • fastest" },
  standard: { sources: 7, label: "Standard", hint: "~7 sources • balanced" },
  deep: { sources: 10, label: "Deep", hint: "~10 sources • thorough" },
}

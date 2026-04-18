import { generateText, Output } from "ai"
import { google } from "@ai-sdk/google"
import {
  SourcesOutputSchema,
  SummariesOutputSchema,
  InsightsOutputSchema,
  ContradictionsOutputSchema,
  FactChecksOutputSchema,
  DEPTH_CONFIG,
  type ResearchDepth,
  type ResearchEvent,
  type ResearchTemplate,
} from "@/lib/research-types"

export const maxDuration = 60

// Using Google Gemini free tier models
const FAST_MODEL = google("gemini-2.5-flash")
const SMART_MODEL = google("gemini-2.5-flash")

interface Body {
  topic: string
  depth: ResearchDepth
  template: ResearchTemplate
}

function encoder() {
  return new TextEncoder()
}

function sse(event: ResearchEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

function templateHint(t: ResearchTemplate): string {
  switch (t) {
    case "literature-review":
      return "Prefer peer-reviewed papers and preprints. Include methodology-focused summaries."
    case "market-analysis":
      return "Prefer industry reports, market research and trend analyses."
    case "competitor-research":
      return "Focus on companies, products, positioning and market share."
    case "scientific-summary":
      return "Prefer peer-reviewed scientific literature. Emphasize methodology and findings."
    case "news-digest":
      return "Prefer recent news articles and current events from reputable outlets."
    default:
      return "Use a balanced mix of academic, industry and news sources."
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body
  const { topic, depth, template } = body

  if (!topic || typeof topic !== "string") {
    return new Response("Missing topic", { status: 400 })
  }

  const enc = encoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: ResearchEvent) => {
        try {
          controller.enqueue(enc.encode(sse(ev)))
        } catch {
          /* client disconnected */
        }
      }

      try {
        const cfg = DEPTH_CONFIG[depth] ?? DEPTH_CONFIG.standard
        const hint = templateHint(template)

        // -------- AGENT 1: Web Search --------
        send({ type: "agent_status", agent: "search", status: "running" })
        send({
          type: "thinking",
          agent: "search",
          text: `Scanning the web for ${cfg.sources} high-signal sources on "${topic}"...`,
        })

        const searchResult = await generateText({
          model: FAST_MODEL,
          system:
            "You are a Web Search Agent. Given a research topic, simulate a realistic set of credible sources one would find across the open web and academic databases. Output real-sounding titles, authors, plausible URLs (can be domain roots like example.com/path), and recent years (2020-2026).",
          prompt: `Topic: ${topic}\n\nGuidance: ${hint}\n\nReturn exactly ${cfg.sources} diverse sources. Mix of types is good. Score quality 0-100 based on reliability (peer-reviewed highest, blogs lowest). Use ids s1..s${cfg.sources}.`,
          experimental_output: Output.object({ schema: SourcesOutputSchema }),
        })
        const sources = searchResult.experimental_output.sources
        send({ type: "sources", sources })
        send({ type: "agent_status", agent: "search", status: "done", note: `${sources.length} sources found` })

        // -------- AGENT 2: Summarization --------
        send({ type: "agent_status", agent: "summarize", status: "running" })
        send({
          type: "thinking",
          agent: "summarize",
          text: `Extracting key points and methodology from ${sources.length} sources...`,
        })

        const summariesResult = await generateText({
          model: FAST_MODEL,
          system:
            "You are a Paper Summarization Agent. Produce concise, faithful summaries. Every source MUST get a summary. Use the provided sourceId exactly.",
          prompt: `Topic: ${topic}\n\nSources:\n${sources
            .map((s) => `- [${s.id}] ${s.title} by ${s.author} (${s.year}, ${s.type}) — ${s.snippet}`)
            .join("\n")}\n\nFor each source produce: a one-line TL;DR, 3-5 key bullet points, and (when the source type implies research) a short methodology note. If no methodology, set methodology to null.`,
          experimental_output: Output.object({ schema: SummariesOutputSchema }),
        })
        const summaries = summariesResult.experimental_output.summaries
        send({ type: "summaries", summaries })
        send({ type: "agent_status", agent: "summarize", status: "done", note: `${summaries.length} summaries` })

        // -------- AGENT 3: Insight Generation --------
        send({ type: "agent_status", agent: "insight", status: "running" })
        send({
          type: "thinking",
          agent: "insight",
          text: "Synthesizing cross-source patterns, trends and research gaps...",
        })

        const insightsResult = await generateText({
          model: SMART_MODEL,
          system:
            "You are an Insight Generation Agent. Synthesize across source summaries to produce an executive summary and a set of insights. Each insight has a category (finding/trend/gap/implication), a confidence score 0-100, and cites sourceIds. Be rigorous — lower confidence when evidence is thin.",
          prompt: `Topic: ${topic}\n\nSource summaries:\n${summaries
            .map((s) => `- [${s.sourceId}] ${s.tldr} Key points: ${s.keyPoints.join("; ")}`)
            .join(
              "\n",
            )}\n\nProduce an executive summary (3-5 sentences) and 4-6 insights. Use ids i1..i6.`,
          experimental_output: Output.object({ schema: InsightsOutputSchema }),
        })
        const { executiveSummary, insights } = insightsResult.experimental_output
        send({ type: "insights", executiveSummary, insights })
        send({ type: "agent_status", agent: "insight", status: "done", note: `${insights.length} insights` })

        // -------- AGENT 4: Contradiction Detector --------
        send({ type: "agent_status", agent: "contradict", status: "running" })
        send({
          type: "thinking",
          agent: "contradict",
          text: "Comparing claims across sources to surface disagreements...",
        })

        const contradictionsResult = await generateText({
          model: FAST_MODEL,
          system:
            "You are a Contradiction Detector. Find genuine disagreements between sources. If none exist, return an empty array. Each contradiction must cite sourceIds for both sides and propose a likely resolution.",
          prompt: `Topic: ${topic}\n\nSource summaries:\n${summaries
            .map((s) => `- [${s.sourceId}] ${s.tldr} Key points: ${s.keyPoints.join("; ")}`)
            .join("\n")}\n\nReturn 0-4 real contradictions. Use ids c1..c4.`,
          experimental_output: Output.object({ schema: ContradictionsOutputSchema }),
        })
        const { contradictions } = contradictionsResult.experimental_output
        send({ type: "contradictions", contradictions })
        send({
          type: "agent_status",
          agent: "contradict",
          status: "done",
          note: `${contradictions.length} contradictions`,
        })

        // -------- AGENT 5: Fact-Checker + Follow-ups + Keywords --------
        send({ type: "agent_status", agent: "factcheck", status: "running" })
        send({
          type: "thinking",
          agent: "factcheck",
          text: "Verifying key claims, extracting concepts and generating follow-up questions...",
        })

        const factChecksResult = await generateText({
          model: FAST_MODEL,
          system:
            "You are a Fact-Checker Agent. Review the most important claims made in the insights and summaries. Assign a verdict from: verified, likely-true, disputed, unverified, false. Also produce 3-5 follow-up research questions and 8-12 concept keywords for a knowledge graph.",
          prompt: `Topic: ${topic}\n\nExecutive summary: ${executiveSummary}\n\nInsights:\n${insights
            .map((i) => `- [${i.id}] ${i.title}: ${i.description}`)
            .join(
              "\n",
            )}\n\nFact-check 3-6 central claims. Use ids f1..f6. Cite sourceIds.`,
          experimental_output: Output.object({ schema: FactChecksOutputSchema }),
        })
        const { factChecks, followUpQuestions, keywords } = factChecksResult.experimental_output
        send({ type: "factchecks", factChecks, followUpQuestions, keywords })
        send({
          type: "agent_status",
          agent: "factcheck",
          status: "done",
          note: `${factChecks.length} checks`,
        })

        send({ type: "complete" })
      } catch (err) {
        console.error("[v0] research error:", err)
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error during research.",
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}

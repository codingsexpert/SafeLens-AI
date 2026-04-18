import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { google } from "@ai-sdk/google"
import type { ResearchDocument } from "@/lib/research-types"

export const maxDuration = 30

interface Body {
  messages: UIMessage[]
  document: ResearchDocument
}

export async function POST(req: Request) {
  const { messages, document } = (await req.json()) as Body

  if (!document) {
    return new Response("Missing document context", { status: 400 })
  }

  const context = `You are Lumen, an AI research assistant. The user has just generated the following research document. Answer follow-up questions accurately and concisely, citing source IDs like [s1], [s2] when relevant. If the answer is not in the document, say so and offer to start a new deeper research.

=== RESEARCH DOCUMENT ===
Topic: ${document.topic}

Executive Summary:
${document.executiveSummary}

Sources:
${document.sources.map((s) => `[${s.id}] ${s.title} — ${s.author} (${s.year}, ${s.type}). ${s.snippet}`).join("\n")}

Summaries:
${document.summaries
  .map((s) => `[${s.sourceId}] ${s.tldr}\n  Points: ${s.keyPoints.join("; ")}`)
  .join("\n")}

Insights:
${document.insights.map((i) => `[${i.id}] ${i.title} (${i.confidence}%): ${i.description}`).join("\n")}

${
  document.contradictions.length
    ? `Contradictions:\n${document.contradictions
        .map((c) => `[${c.id}] ${c.topic}: A=${c.claimA} | B=${c.claimB}`)
        .join("\n")}\n`
    : ""
}
${
  document.factChecks.length
    ? `Fact checks:\n${document.factChecks
        .map((f) => `[${f.id}] ${f.verdict}: ${f.claim}`)
        .join("\n")}\n`
    : ""
}
=== END DOCUMENT ===`

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: context,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}

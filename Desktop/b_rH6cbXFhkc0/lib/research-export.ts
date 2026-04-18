import type { ResearchDocument } from "./research-types"

export function toMarkdown(doc: ResearchDocument): string {
  const lines: string[] = []
  lines.push(`# Research: ${doc.topic}`)
  lines.push("")
  lines.push(
    `_Generated ${new Date(doc.createdAt).toLocaleString()} • Depth: ${doc.depth} • Template: ${doc.template}_`,
  )
  lines.push("")
  lines.push("## Executive Summary")
  lines.push(doc.executiveSummary || "—")
  lines.push("")

  if (doc.insights.length) {
    lines.push("## Key Insights")
    doc.insights.forEach((i, idx) => {
      lines.push(`### ${idx + 1}. ${i.title} _(${i.category}, ${i.confidence}% confidence)_`)
      lines.push(i.description)
      if (i.sourceIds.length) {
        lines.push(`\nSources: ${i.sourceIds.join(", ")}`)
      }
      lines.push("")
    })
  }

  if (doc.contradictions.length) {
    lines.push("## Contradictions")
    doc.contradictions.forEach((c, idx) => {
      lines.push(`### ${idx + 1}. ${c.topic}`)
      lines.push(`- **Claim A** (${c.sourceIdsA.join(", ")}): ${c.claimA}`)
      lines.push(`- **Claim B** (${c.sourceIdsB.join(", ")}): ${c.claimB}`)
      lines.push(`- **Resolution:** ${c.resolution}`)
      lines.push("")
    })
  }

  if (doc.factChecks.length) {
    lines.push("## Fact Checks")
    doc.factChecks.forEach((f, idx) => {
      lines.push(`### ${idx + 1}. [${f.verdict.toUpperCase()}] ${f.claim}`)
      lines.push(f.reasoning)
      if (f.sourceIds.length) lines.push(`\nSources: ${f.sourceIds.join(", ")}`)
      lines.push("")
    })
  }

  if (doc.summaries.length) {
    lines.push("## Source Summaries")
    doc.summaries.forEach((s) => {
      const src = doc.sources.find((x) => x.id === s.sourceId)
      lines.push(`### ${src ? src.title : s.sourceId}`)
      lines.push(`_${s.tldr}_`)
      lines.push("")
      s.keyPoints.forEach((p) => lines.push(`- ${p}`))
      if (s.methodology) {
        lines.push(`\n**Methodology:** ${s.methodology}`)
      }
      lines.push("")
    })
  }

  if (doc.followUpQuestions.length) {
    lines.push("## Follow-up Questions")
    doc.followUpQuestions.forEach((q) => lines.push(`- ${q}`))
    lines.push("")
  }

  if (doc.sources.length) {
    lines.push("## References")
    doc.sources.forEach((s) => {
      lines.push(
        `- **[${s.id}]** ${s.author} (${s.year}). _${s.title}_. ${s.type}. ${s.url}`,
      )
    })
  }

  return lines.join("\n")
}

export function downloadText(filename: string, content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

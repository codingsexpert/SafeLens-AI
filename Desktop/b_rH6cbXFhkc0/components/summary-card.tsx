"use client"

import type { Source, Summary } from "@/lib/research-types"

export function SummaryCard({ summary, source }: { summary: Summary; source?: Source }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug">
          {source ? source.title : summary.sourceId}
        </h4>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          [{summary.sourceId}]
        </span>
      </div>
      <p className="mt-2 text-sm italic leading-relaxed text-muted-foreground">{summary.tldr}</p>
      <ul className="mt-3 space-y-1.5">
        {summary.keyPoints.map((p, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {summary.methodology && (
        <div className="mt-3 rounded-lg bg-muted/50 p-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Methodology
          </span>
          <p className="mt-0.5 text-xs leading-relaxed">{summary.methodology}</p>
        </div>
      )}
    </div>
  )
}

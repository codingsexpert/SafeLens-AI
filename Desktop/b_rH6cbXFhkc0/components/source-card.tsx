"use client"

import { ExternalLink } from "lucide-react"
import type { Source } from "@/lib/research-types"
import { cn } from "@/lib/utils"

const TYPE_STYLES: Record<Source["type"], { label: string; className: string }> = {
  "peer-reviewed": { label: "Peer-reviewed", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  preprint: { label: "Preprint", className: "bg-chart-1/15 text-chart-1 border-chart-1/30" },
  news: { label: "News", className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  blog: { label: "Blog", className: "bg-muted text-muted-foreground border-border" },
  report: { label: "Report", className: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  wiki: { label: "Wiki", className: "bg-muted text-muted-foreground border-border" },
  book: { label: "Book", className: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
}

export function SourceCard({ source }: { source: Source }) {
  const typeStyle = TYPE_STYLES[source.type]
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            typeStyle.className,
          )}
        >
          {typeStyle.label}
        </span>
        <QualityBadge score={source.quality} />
      </div>
      <h4 className="text-sm font-medium leading-snug text-foreground line-clamp-2">
        {source.title}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-2">{source.snippet}</p>
      <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-2 text-xs text-muted-foreground">
        <span className="truncate">
          {source.author} · {source.year}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] opacity-60 transition group-hover:text-primary group-hover:opacity-100">
          [{source.id}]
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  )
}

function QualityBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "text-chart-2"
      : score >= 60
        ? "text-chart-3"
        : score >= 40
          ? "text-chart-4"
          : "text-destructive"
  return (
    <span className={cn("flex items-center gap-1 font-mono text-[10px] font-medium", tone)}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {score}
    </span>
  )
}

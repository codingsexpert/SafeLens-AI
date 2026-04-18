"use client"

import { Lightbulb, TrendingUp, AlertCircle, Target } from "lucide-react"
import type { Insight } from "@/lib/research-types"
import { cn } from "@/lib/utils"

const CATEGORY_META: Record<
  Insight["category"],
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  finding: { label: "Finding", icon: Lightbulb, className: "text-chart-1" },
  trend: { label: "Trend", icon: TrendingUp, className: "text-chart-2" },
  gap: { label: "Research Gap", icon: AlertCircle, className: "text-chart-3" },
  implication: { label: "Implication", icon: Target, className: "text-chart-4" },
}

export function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const meta = CATEGORY_META[insight.category]
  const Icon = meta.icon
  const confidenceTone =
    insight.confidence >= 80
      ? "text-chart-2 bg-chart-2/10 border-chart-2/30"
      : insight.confidence >= 60
        ? "text-chart-3 bg-chart-3/10 border-chart-3/30"
        : "text-muted-foreground bg-muted border-border"

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted", meta.className)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {String(index).padStart(2, "0")}
              </span>
              <span className={cn("text-[10px] font-medium uppercase tracking-wide", meta.className)}>
                {meta.label}
              </span>
            </div>
            <h3 className="mt-0.5 text-pretty text-base font-medium leading-snug">{insight.title}</h3>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium", confidenceTone)}>
          {insight.confidence}%
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
      {insight.sourceIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {insight.sourceIds.map((id) => (
            <span
              key={id}
              className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {id}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

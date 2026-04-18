"use client"

import { CheckCircle2, CircleHelp, ShieldAlert, ShieldCheck, XCircle } from "lucide-react"
import type { FactCheck } from "@/lib/research-types"
import { cn } from "@/lib/utils"

const VERDICT_META: Record<
  FactCheck["verdict"],
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  verified: { label: "Verified", icon: ShieldCheck, className: "text-chart-2 border-chart-2/30 bg-chart-2/10" },
  "likely-true": {
    label: "Likely true",
    icon: CheckCircle2,
    className: "text-chart-2 border-chart-2/30 bg-chart-2/5",
  },
  disputed: {
    label: "Disputed",
    icon: ShieldAlert,
    className: "text-chart-3 border-chart-3/30 bg-chart-3/10",
  },
  unverified: {
    label: "Unverified",
    icon: CircleHelp,
    className: "text-muted-foreground border-border bg-muted",
  },
  false: { label: "False", icon: XCircle, className: "text-destructive border-destructive/40 bg-destructive/10" },
}

export function FactCheckCard({ item }: { item: FactCheck }) {
  const meta = VERDICT_META[item.verdict]
  const Icon = meta.icon
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", meta.className)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", meta.className)}>
              {meta.label}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{item.id}</span>
          </div>
          <p className="mt-2 text-sm font-medium leading-snug">{item.claim}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.reasoning}</p>
          {item.sourceIds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.sourceIds.map((id) => (
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
      </div>
    </div>
  )
}

"use client"

import { GitCompareArrows } from "lucide-react"
import type { Contradiction } from "@/lib/research-types"

export function ContradictionCard({ item }: { item: Contradiction }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <GitCompareArrows className="h-4 w-4 text-chart-5" />
        <h3 className="text-pretty text-base font-medium">{item.topic}</h3>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-chart-1/30 bg-chart-1/5 p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-chart-1">Claim A</span>
            <div className="flex flex-wrap gap-1">
              {item.sourceIdsA.map((id) => (
                <span
                  key={id}
                  className="rounded-md border border-chart-1/30 bg-background px-1.5 py-0.5 font-mono text-[10px] text-chart-1"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed">{item.claimA}</p>
        </div>
        <div className="rounded-lg border border-chart-4/30 bg-chart-4/5 p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-chart-4">Claim B</span>
            <div className="flex flex-wrap gap-1">
              {item.sourceIdsB.map((id) => (
                <span
                  key={id}
                  className="rounded-md border border-chart-4/30 bg-background px-1.5 py-0.5 font-mono text-[10px] text-chart-4"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed">{item.claimB}</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-muted/50 p-3">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Likely Resolution
        </div>
        <p className="text-sm leading-relaxed text-foreground">{item.resolution}</p>
      </div>
    </div>
  )
}

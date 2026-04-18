"use client"

import {
  CheckCircle2,
  CircleDashed,
  FileText,
  GitCompareArrows,
  Lightbulb,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { AGENT_META, AGENT_ORDER, type AgentName, type AgentStatus } from "@/lib/research-types"
import type { AgentState } from "@/hooks/use-research"
import { cn } from "@/lib/utils"

const ICONS: Record<AgentName, React.ComponentType<{ className?: string }>> = {
  search: Search,
  summarize: FileText,
  insight: Lightbulb,
  contradict: GitCompareArrows,
  factcheck: ShieldCheck,
}

interface Props {
  agents: Record<AgentName, AgentState>
  active: boolean
}

export function AgentPipeline({ agents, active }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl leading-none tracking-tight">Agent Pipeline</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Five specialized agents collaborating in sequence
          </p>
        </div>
        {active && (
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="pulse-ring inline-block h-2 w-2 rounded-full bg-primary" />
            Live
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {AGENT_ORDER.map((name, idx) => {
          const agent = agents[name]
          const Icon = ICONS[name]
          const meta = AGENT_META[name]
          return (
            <AgentNode
              key={name}
              name={name}
              index={idx + 1}
              label={meta.label}
              description={meta.description}
              Icon={Icon}
              status={agent.status}
              note={agent.note}
              thinking={agent.thinking[agent.thinking.length - 1]}
            />
          )
        })}
      </div>
    </div>
  )
}

function AgentNode({
  name,
  index,
  label,
  description,
  Icon,
  status,
  note,
  thinking,
}: {
  name: AgentName
  index: number
  label: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
  status: AgentStatus
  note?: string
  thinking?: string
}) {
  const isRunning = status === "running"
  const isDone = status === "done"
  const isError = status === "error"

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border p-3 transition",
        isRunning && "border-primary/60 bg-primary/5",
        isDone && "border-border bg-card",
        isError && "border-destructive/60 bg-destructive/5",
        !isRunning && !isDone && !isError && "border-border bg-card/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition",
            isRunning && "border-primary/60 bg-primary/10 text-primary pulse-ring",
            isDone && "border-border bg-muted text-foreground",
            isError && "border-destructive/60 bg-destructive/10 text-destructive",
            !isRunning && !isDone && !isError && "border-border bg-muted/40 text-muted-foreground",
          )}
          style={{ color: isDone ? `oklch(from ${AGENT_META[name].colorVar} l c h)` : undefined }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <StatusBadge status={status} />
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
          <h3 className="text-sm font-medium leading-tight">{label}</h3>
        </div>
        <p className="mt-1 text-xs leading-snug text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>

      {(isRunning || isDone || isError) && (
        <div className="mt-auto border-t border-border/70 pt-2">
          {isRunning && thinking ? (
            <p className="shimmer-text line-clamp-2 text-xs leading-snug">{thinking}</p>
          ) : note ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">{note}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Idle</p>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: AgentStatus }) {
  if (status === "running")
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </span>
    )
  if (status === "done")
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-chart-2" />
        Done
      </span>
    )
  if (status === "error")
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
        <XCircle className="h-3 w-3" />
        Error
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60">
      <CircleDashed className="h-3 w-3" />
      Waiting
    </span>
  )
}

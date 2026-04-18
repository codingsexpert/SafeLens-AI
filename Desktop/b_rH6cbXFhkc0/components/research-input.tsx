"use client"

import { useState } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEPTH_CONFIG, TEMPLATES, type ResearchDepth, type ResearchTemplate } from "@/lib/research-types"
import { cn } from "@/lib/utils"

interface Props {
  onSubmit: (data: { topic: string; depth: ResearchDepth; template: ResearchTemplate }) => void
  disabled?: boolean
}

const SUGGESTIONS = [
  "Impact of large language models on software engineering productivity",
  "State of fusion energy research in 2026",
  "Long-term effects of intermittent fasting on metabolic health",
  "How federated learning is changing healthcare AI",
]

export function ResearchInput({ onSubmit, disabled }: Props) {
  const [topic, setTopic] = useState("")
  const [depth, setDepth] = useState<ResearchDepth>("standard")
  const [template, setTemplate] = useState<ResearchTemplate>("general")

  const submit = () => {
    const t = topic.trim()
    if (!t || disabled) return
    onSubmit({ topic: t, depth, template })
  }

  return (
    <div className="relative">
      <div className="relative rounded-2xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-sm transition focus-within:border-primary/60 focus-within:shadow-lg focus-within:shadow-primary/5">
        <div className="flex items-start gap-3">
          <div className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="What would you like to research? e.g. 'How is AI transforming drug discovery?'"
            className="min-h-[72px] resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 md:text-lg"
            disabled={disabled}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={template} onValueChange={(v) => setTemplate(v as ResearchTemplate)} disabled={disabled}>
              <SelectTrigger className="h-9 w-auto gap-2 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col">
                      <span>{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex h-9 items-center overflow-hidden rounded-md border border-border bg-background">
              {(Object.keys(DEPTH_CONFIG) as ResearchDepth[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  disabled={disabled}
                  className={cn(
                    "h-full px-3 text-xs font-medium transition",
                    depth === d
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  title={DEPTH_CONFIG[d].hint}
                >
                  {DEPTH_CONFIG[d].label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={submit} disabled={disabled || !topic.trim()} className="gap-2">
            Research
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTopic(s)}
            disabled={disabled}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

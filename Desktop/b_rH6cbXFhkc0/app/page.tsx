"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Clock, Github, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ResearchInput } from "@/components/research-input"
import { AgentPipeline } from "@/components/agent-pipeline"
import { ResearchDocumentView } from "@/components/research-document"
import { ResearchChat } from "@/components/research-chat"
import { HistoryPanel } from "@/components/history-panel"
import { useResearch } from "@/hooks/use-research"
import type { ResearchDepth, ResearchDocument, ResearchTemplate } from "@/lib/research-types"

export default function Page() {
  const { state, run, reset, loadDocument } = useResearch()
  const [historyOpen, setHistoryOpen] = useState(false)

  const handleSubmit = useCallback(
    (data: { topic: string; depth: ResearchDepth; template: ResearchTemplate }) => {
      run(data)
      // Smooth scroll to pipeline
      setTimeout(() => {
        document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    },
    [run],
  )

  const handleHistorySelect = useCallback(
    (doc: ResearchDocument) => {
      loadDocument(doc)
    },
    [loadDocument],
  )

  const handleFollowUp = useCallback(
    (q: string) => {
      // Pre-fill topic and run deeper research
      run({ topic: q, depth: "standard", template: "general" })
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [run],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to focus input (new research)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        reset()
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      // Cmd/Ctrl+H to open history
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "h") {
        e.preventDefault()
        setHistoryOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [reset])

  const currentDoc: ResearchDocument | null = useMemo(() => {
    if (!state.documentId || !state.createdAt) return null
    if (state.status === "idle") return null
    if (state.status === "running" && state.insights.length === 0) return null
    return {
      id: state.documentId,
      topic: state.topic,
      depth: state.depth,
      template: state.template,
      createdAt: state.createdAt,
      executiveSummary: state.executiveSummary,
      sources: state.sources,
      summaries: state.summaries,
      insights: state.insights,
      contradictions: state.contradictions,
      factChecks: state.factChecks,
      followUpQuestions: state.followUpQuestions,
      keywords: state.keywords,
    }
  }, [state])

  const showPipeline = state.status !== "idle"
  const canShowChat = state.status === "done" && currentDoc

  return (
    <div className="min-h-screen bg-background">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-serif text-lg leading-none tracking-tight">Lumen</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Multi-agent research
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="hidden gap-2 md:inline-flex"
            >
              <Clock className="h-3.5 w-3.5" />
              History
              <kbd className="ml-1 rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
                ⌘H
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="md:hidden"
              aria-label="History"
            >
              <Clock className="h-4 w-4" />
            </Button>
            {state.status !== "idle" && (
              <Button variant="outline" size="sm" onClick={reset} className="gap-2">
                <Plus className="h-3.5 w-3.5" />
                New
                <kbd className="ml-0.5 hidden rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground sm:inline">
                  ⌘K
                </kbd>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {/* Hero / input */}
        {state.status === "idle" && (
          <section className="mb-8 md:mb-12">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary pulse-ring" />
                Five agents · Web search · Summarization · Insights · Contradictions · Fact-check
              </div>
              <h1 className="text-balance font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl">
                Turn any question into a{" "}
                <span className="italic text-primary">structured research</span> document.
              </h1>
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                Lumen orchestrates five specialized AI agents in parallel — each responsible for one
                part of the research process — and assembles their output into a single, source-cited
                document you can trust.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl">
              <ResearchInput onSubmit={handleSubmit} />
            </div>
          </section>
        )}

        {/* Pipeline */}
        {showPipeline && (
          <section id="pipeline" className="mb-6 md:mb-8">
            <AgentPipeline agents={state.agents} active={state.status === "running"} />
            {state.error && (
              <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                {state.error}
              </div>
            )}
          </section>
        )}

        {/* Document */}
        {currentDoc && (
          <section className="mb-8">
            <ResearchDocumentView document={currentDoc} onFollowUp={handleFollowUp} />
          </section>
        )}

        {/* Chat */}
        {canShowChat && currentDoc && (
          <section className="mb-12">
            <ResearchChat document={currentDoc} />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lumen — powered by AI SDK and Vercel AI Gateway</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono">⌘K</kbd>
            <span>New research</span>
            <span>·</span>
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono">⌘H</kbd>
            <span>History</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-1 transition hover:text-foreground"
          >
            <Github className="h-3 w-3" />
            Open source research tooling
          </a>
        </footer>
      </main>

      <HistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelect={handleHistorySelect}
        activeId={state.documentId}
      />
    </div>
  )
}

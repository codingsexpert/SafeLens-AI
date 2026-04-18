"use client"

import { useMemo, useState } from "react"
import {
  BookOpen,
  Check,
  Copy,
  Download,
  FileText,
  GitCompareArrows,
  Hash,
  Lightbulb,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ResearchDocument } from "@/lib/research-types"
import { downloadText, slugify, toMarkdown } from "@/lib/research-export"
import { SourceCard } from "@/components/source-card"
import { InsightCard } from "@/components/insight-card"
import { ContradictionCard } from "@/components/contradiction-card"
import { FactCheckCard } from "@/components/factcheck-card"
import { SummaryCard } from "@/components/summary-card"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { toast } from "sonner"

interface Props {
  document: ResearchDocument
  onFollowUp?: (q: string) => void
}

export function ResearchDocumentView({ document, onFollowUp }: Props) {
  const [copied, setCopied] = useState(false)
  const markdown = useMemo(() => toMarkdown(document), [document])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      toast.success("Copied markdown to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy")
    }
  }

  const handleDownload = () => {
    downloadText(`${slugify(document.topic)}.md`, markdown)
    toast.success("Downloaded as Markdown")
  }

  const stats = [
    { label: "Sources", value: document.sources.length, icon: BookOpen },
    { label: "Insights", value: document.insights.length, icon: Lightbulb },
    { label: "Contradictions", value: document.contradictions.length, icon: GitCompareArrows },
    { label: "Fact-checks", value: document.factChecks.length, icon: ShieldCheck },
  ]

  return (
    <article className="flex flex-col gap-6">
      {/* Header */}
      <header className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium uppercase tracking-wide text-primary">
                Research Document
              </span>
              <span>·</span>
              <span className="font-mono">{document.depth}</span>
              <span>·</span>
              <span>{new Date(document.createdAt).toLocaleString()}</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-pretty md:text-4xl">
              {document.topic}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="mr-2 h-3.5 w-3.5" /> : <Copy className="mr-2 h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-3.5 w-3.5" />
              Markdown
            </Button>
          </div>
        </div>

        {/* Executive summary */}
        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Executive Summary
          </div>
          <p className="mt-2 text-base leading-relaxed text-pretty md:text-lg">
            {document.executiveSummary}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-mono text-xl tabular-nums leading-none">{s.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </header>

      {/* Main tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="insights" className="gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="contradictions" className="gap-1.5">
            <GitCompareArrows className="h-3.5 w-3.5" />
            Contradictions
            {document.contradictions.length > 0 && (
              <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                {document.contradictions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="factchecks" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fact-checks
          </TabsTrigger>
          <TabsTrigger value="summaries" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Summaries
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-1.5">
            <Network className="h-3.5 w-3.5" />
            Graph
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-4">
          {document.insights.length === 0 ? (
            <EmptyState label="No insights yet" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {document.insights.map((ins, i) => (
                <InsightCard key={ins.id} insight={ins} index={i + 1} />
              ))}
            </div>
          )}

          {document.followUpQuestions.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-accent" />
                <h3 className="font-serif text-xl leading-none tracking-tight">Follow-up questions</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {document.followUpQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onFollowUp?.(q)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contradictions" className="mt-4">
          {document.contradictions.length === 0 ? (
            <EmptyState label="No contradictions detected between sources" />
          ) : (
            <div className="grid gap-3">
              {document.contradictions.map((c) => (
                <ContradictionCard key={c.id} item={c} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="factchecks" className="mt-4">
          {document.factChecks.length === 0 ? (
            <EmptyState label="No fact-checks yet" />
          ) : (
            <div className="grid gap-3">
              {document.factChecks.map((f) => (
                <FactCheckCard key={f.id} item={f} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="summaries" className="mt-4">
          {document.summaries.length === 0 ? (
            <EmptyState label="No summaries yet" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {document.summaries.map((s) => (
                <SummaryCard
                  key={s.sourceId}
                  summary={s}
                  source={document.sources.find((x) => x.id === s.sourceId)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          {document.sources.length === 0 ? (
            <EmptyState label="No sources yet" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {document.sources.map((s) => (
                <SourceCard key={s.id} source={s} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graph" className="mt-4">
          <KnowledgeGraph topic={document.topic} keywords={document.keywords} />
          {document.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {document.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </article>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  )
}

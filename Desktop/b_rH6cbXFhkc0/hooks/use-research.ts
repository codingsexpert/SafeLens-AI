"use client"

import { useCallback, useRef, useState } from "react"
import type {
  AgentName,
  AgentStatus,
  Contradiction,
  FactCheck,
  Insight,
  ResearchDepth,
  ResearchDocument,
  ResearchEvent,
  ResearchTemplate,
  Source,
  Summary,
} from "@/lib/research-types"
import { AGENT_ORDER } from "@/lib/research-types"
import { saveToHistory } from "@/lib/research-history"

export interface AgentState {
  status: AgentStatus
  note?: string
  thinking: string[]
}

export interface ResearchState {
  topic: string
  depth: ResearchDepth
  template: ResearchTemplate
  agents: Record<AgentName, AgentState>
  sources: Source[]
  summaries: Summary[]
  insights: Insight[]
  contradictions: Contradiction[]
  factChecks: FactCheck[]
  followUpQuestions: string[]
  keywords: string[]
  executiveSummary: string
  status: "idle" | "running" | "done" | "error"
  error: string | null
  documentId: string | null
  createdAt: number | null
}

const initialAgents = (): Record<AgentName, AgentState> =>
  AGENT_ORDER.reduce(
    (acc, a) => {
      acc[a] = { status: "pending", thinking: [] }
      return acc
    },
    {} as Record<AgentName, AgentState>,
  )

const emptyState = (): ResearchState => ({
  topic: "",
  depth: "standard",
  template: "general",
  agents: initialAgents(),
  sources: [],
  summaries: [],
  insights: [],
  contradictions: [],
  factChecks: [],
  followUpQuestions: [],
  keywords: [],
  executiveSummary: "",
  status: "idle",
  error: null,
  documentId: null,
  createdAt: null,
})

async function* parseSSE(response: Response): AsyncGenerator<ResearchEvent> {
  if (!response.body) throw new Error("No response body")
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""
    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed.startsWith("data:")) continue
      const data = trimmed.slice(5).trim()
      if (!data) continue
      try {
        yield JSON.parse(data) as ResearchEvent
      } catch {
        /* skip malformed */
      }
    }
  }
}

export function useResearch() {
  const [state, setState] = useState<ResearchState>(emptyState())
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setState(emptyState())
  }, [])

  const loadDocument = useCallback((doc: ResearchDocument) => {
    setState({
      topic: doc.topic,
      depth: doc.depth,
      template: doc.template,
      agents: AGENT_ORDER.reduce(
        (acc, a) => {
          acc[a] = { status: "done", thinking: [] }
          return acc
        },
        {} as Record<AgentName, AgentState>,
      ),
      sources: doc.sources,
      summaries: doc.summaries,
      insights: doc.insights,
      contradictions: doc.contradictions,
      factChecks: doc.factChecks,
      followUpQuestions: doc.followUpQuestions,
      keywords: doc.keywords,
      executiveSummary: doc.executiveSummary,
      status: "done",
      error: null,
      documentId: doc.id,
      createdAt: doc.createdAt,
    })
  }, [])

  const run = useCallback(
    async (opts: { topic: string; depth: ResearchDepth; template: ResearchTemplate }) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const docId = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
      const createdAt = Date.now()

      setState({
        ...emptyState(),
        topic: opts.topic,
        depth: opts.depth,
        template: opts.template,
        status: "running",
        documentId: docId,
        createdAt,
      })

      try {
        const res = await fetch("/api/research", {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(opts),
        })
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)

        for await (const ev of parseSSE(res)) {
          setState((prev) => applyEvent(prev, ev))
          if (ev.type === "error") throw new Error(ev.message)
          if (ev.type === "complete") {
            setState((prev) => {
              const doc: ResearchDocument = {
                id: docId,
                topic: prev.topic,
                depth: prev.depth,
                template: prev.template,
                createdAt,
                executiveSummary: prev.executiveSummary,
                sources: prev.sources,
                summaries: prev.summaries,
                insights: prev.insights,
                contradictions: prev.contradictions,
                factChecks: prev.factChecks,
                followUpQuestions: prev.followUpQuestions,
                keywords: prev.keywords,
              }
              saveToHistory(doc)
              return { ...prev, status: "done" }
            })
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Something went wrong",
        }))
      }
    },
    [],
  )

  return { state, run, reset, loadDocument }
}

function applyEvent(prev: ResearchState, ev: ResearchEvent): ResearchState {
  switch (ev.type) {
    case "agent_status":
      return {
        ...prev,
        agents: {
          ...prev.agents,
          [ev.agent]: {
            ...prev.agents[ev.agent],
            status: ev.status,
            note: ev.note ?? prev.agents[ev.agent].note,
          },
        },
      }
    case "thinking":
      return {
        ...prev,
        agents: {
          ...prev.agents,
          [ev.agent]: {
            ...prev.agents[ev.agent],
            thinking: [...prev.agents[ev.agent].thinking, ev.text].slice(-6),
          },
        },
      }
    case "sources":
      return { ...prev, sources: ev.sources }
    case "summaries":
      return { ...prev, summaries: ev.summaries }
    case "insights":
      return { ...prev, executiveSummary: ev.executiveSummary, insights: ev.insights }
    case "contradictions":
      return { ...prev, contradictions: ev.contradictions }
    case "factchecks":
      return {
        ...prev,
        factChecks: ev.factChecks,
        followUpQuestions: ev.followUpQuestions,
        keywords: ev.keywords,
      }
    case "error":
      return { ...prev, status: "error", error: ev.message }
    case "complete":
      return prev
    default:
      return prev
  }
}

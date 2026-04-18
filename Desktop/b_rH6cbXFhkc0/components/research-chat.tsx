"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowUp, MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ResearchDocument } from "@/lib/research-types"
import { cn } from "@/lib/utils"

interface Props {
  document: ResearchDocument
  onSelectQuestion?: (q: string) => void
}

export function ResearchChat({ document, onSelectQuestion }: Props) {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, document },
      }),
    }),
  })

  const isStreaming = status === "streaming" || status === "submitted"

  const ask = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    sendMessage({ text: trimmed })
    setInput("")
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-xl leading-none tracking-tight">Chat with this research</h3>
      </div>

      {messages.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Ask follow-up questions. The assistant has full context of your research document.
          </div>
          {document.followUpQuestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {document.followUpQuestions.slice(0, 3).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    onSelectQuestion?.(q)
                    ask(q)
                  }}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((m) => {
            const text =
              m.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("") ?? ""
            return (
              <div
                key={m.id}
                className={cn(
                  "max-w-[90%] rounded-xl border px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto border-primary/30 bg-primary/10 text-foreground"
                    : "border-border bg-background",
                )}
              >
                {text || (isStreaming && m.role === "assistant" ? <span className="shimmer-text">Thinking...</span> : null)}
              </div>
            )
          })}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about this research..."
          disabled={isStreaming}
          className="h-10"
        />
        <Button type="submit" size="icon" disabled={isStreaming || !input.trim()} aria-label="Send">
          <ArrowUp className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

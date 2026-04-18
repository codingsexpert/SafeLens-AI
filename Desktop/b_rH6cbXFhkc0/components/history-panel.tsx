"use client"

import { useEffect, useState } from "react"
import { Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ResearchDocument } from "@/lib/research-types"
import { clearHistory, getHistory, removeFromHistory } from "@/lib/research-history"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (doc: ResearchDocument) => void
  activeId: string | null
}

export function HistoryPanel({ open, onOpenChange, onSelect, activeId }: Props) {
  const [items, setItems] = useState<ResearchDocument[]>([])

  useEffect(() => {
    if (open) setItems(getHistory())
  }, [open])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromHistory(id)
    setItems(getHistory())
  }

  const handleClear = () => {
    clearHistory()
    setItems([])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full max-w-sm p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Research History
          </SheetTitle>
          <SheetDescription>
            Saved locally on this device. {items.length} {items.length === 1 ? "entry" : "entries"}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {items.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              No history yet — run a research to start.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {items.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(doc)
                      onOpenChange(false)
                    }}
                    className={cn(
                      "group flex w-full flex-col gap-1 rounded-lg border border-transparent p-3 text-left transition hover:border-border hover:bg-muted/60",
                      activeId === doc.id && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-medium leading-snug">
                        {doc.topic}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Delete entry"
                        onClick={(e) => handleDelete(doc.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") handleDelete(doc.id, e as unknown as React.MouseEvent)
                        }}
                        className="opacity-0 transition hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-mono uppercase">{doc.depth}</span>
                      <span>·</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{doc.insights.length} insights</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-3">
            <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleClear}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Clear all history
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

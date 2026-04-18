import type { ResearchDocument } from "./research-types"

const KEY = "lumen:research-history:v1"
const MAX = 30

export function getHistory(): ResearchDocument[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveToHistory(doc: ResearchDocument) {
  if (typeof window === "undefined") return
  try {
    const existing = getHistory().filter((d) => d.id !== doc.id)
    const next = [doc, ...existing].slice(0, MAX)
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota errors */
  }
}

export function removeFromHistory(id: string) {
  if (typeof window === "undefined") return
  try {
    const next = getHistory().filter((d) => d.id !== id)
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function clearHistory() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
}

"use client"

import { useMemo } from "react"

interface Props {
  topic: string
  keywords: string[]
}

interface Node {
  id: string
  label: string
  x: number
  y: number
  r: number
  primary: boolean
}

export function KnowledgeGraph({ topic, keywords }: Props) {
  const { nodes, edges, size } = useMemo(() => {
    const size = 420
    const cx = size / 2
    const cy = size / 2
    const radius = size * 0.34

    const nodes: Node[] = [
      { id: "root", label: topic, x: cx, y: cy, r: 44, primary: true },
      ...keywords.slice(0, 12).map((kw, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2
        return {
          id: `k${i}`,
          label: kw,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          r: 28,
          primary: false,
        }
      }),
    ]

    const edges = nodes
      .slice(1)
      .map((n) => ({ id: `e-${n.id}`, x1: cx, y1: cy, x2: n.x, y2: n.y }))

    // Add some cross-links between adjacent keywords for a networked feel
    for (let i = 1; i < nodes.length; i++) {
      const next = i === nodes.length - 1 ? 1 : i + 1
      const a = nodes[i]
      const b = nodes[next]
      edges.push({ id: `c-${a.id}-${b.id}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    }

    return { nodes, edges, size }
  }, [topic, keywords])

  if (!keywords.length) {
    return (
      <div className="flex h-[340px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        Graph will appear once keywords are extracted.
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/50">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        role="img"
        aria-label="Concept knowledge graph"
      >
        <defs>
          <radialGradient id="kg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={size * 0.4} fill="url(#kg-glow)" />
        {edges.map((e) => (
          <line
            key={e.id}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="var(--border)"
            strokeWidth={1}
            opacity={e.id.startsWith("c-") ? 0.4 : 0.7}
          />
        ))}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.primary ? "var(--primary)" : "var(--card)"}
              stroke={n.primary ? "var(--primary)" : "var(--border)"}
              strokeWidth={n.primary ? 0 : 1}
            />
            <foreignObject x={n.x - n.r} y={n.y - n.r} width={n.r * 2} height={n.r * 2}>
              <div
                className="flex h-full w-full items-center justify-center px-1 text-center font-medium leading-tight"
                style={{
                  color: n.primary ? "var(--primary-foreground)" : "var(--foreground)",
                  fontSize: n.primary ? 11 : 10,
                }}
              >
                <span className="line-clamp-3">{n.label}</span>
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  )
}

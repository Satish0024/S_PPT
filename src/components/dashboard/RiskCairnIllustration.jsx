import { Rocket, Scale, ShieldCheck } from 'lucide-react'

const LEVEL_ICON = { conservative: ShieldCheck, moderate: Scale, aggressive: Rocket }

// A small stacked-stones ("cairn") illustration representing balance —
// used by the Risk Meter v2 widget. The stones stay on-brand (gradient of
// --brand/--accent) so it re-themes per client; the badge on the top stone
// swaps per risk level so the scenario is still visually distinct.
export default function RiskCairnIllustration({ levelId, color }) {
  const Icon = LEVEL_ICON[levelId] || Scale

  return (
    <svg className="risk-cairn" viewBox="0 0 140 130" role="img" aria-label="Illustration of balanced stacked stones">
      <defs>
        <linearGradient id="cairn-stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
      </defs>

      <circle className="risk-cairn-glow" cx="70" cy="72" r="52" fill="var(--active-bg)" />

      <g className="risk-cairn-sparkle risk-cairn-sparkle-a">
        <path d="M112 30l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z" fill="var(--accent)" />
      </g>
      <g className="risk-cairn-sparkle risk-cairn-sparkle-b">
        <circle cx="24" cy="50" r="2.6" fill="var(--brand)" />
      </g>

      <g className="risk-cairn-leaf risk-cairn-leaf-a">
        <path d="M30 108c-14-4-20-18-16-32 14 2 24 12 26 26 1 3 -3 7 -10 6z" fill="#6fae6f" />
      </g>
      <g className="risk-cairn-leaf risk-cairn-leaf-b">
        <path d="M112 104c11-5 15-17 10-28-11 3-19 12-20 23-1 3 3 6 10 5z" fill="#5f9c5f" />
      </g>

      <g className="risk-cairn-stack">
        <ellipse cx="70" cy="106" rx="34" ry="15" fill="url(#cairn-stone)" />
        <ellipse cx="70" cy="106" rx="34" ry="15" fill="#000" opacity="0.06" />
        <ellipse cx="70" cy="78" rx="25" ry="13" fill="url(#cairn-stone)" />
        <ellipse cx="66" cy="73" rx="9" ry="5" fill="#fff" opacity="0.18" />
        <circle cx="70" cy="52" r="16" fill="url(#cairn-stone)" />
        <ellipse cx="65" cy="47" rx="5" ry="3.4" fill="#fff" opacity="0.22" />
        <circle className="risk-cairn-badge" cx="70" cy="52" r="11" fill="#fff" />
        <foreignObject x="59" y="41" width="22" height="22">
          <div style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', color }}>
            <Icon size={14} strokeWidth={2.4} />
          </div>
        </foreignObject>
      </g>
    </svg>
  )
}

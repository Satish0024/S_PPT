// Sunrise hot-air-balloon illustration for the risk questionnaire's side
// panel — layered mountain silhouettes, a lake with a mirrored reflection,
// pine tree clusters, birds, and a softly bobbing balloon. Pure inline SVG +
// CSS animation, themed entirely through CSS custom properties so it
// re-colors automatically per brand/light/dark instead of needing a raster
// asset swap.
export default function RiskJourneyScene() {
  return (
    <svg
      className="rqj-scene"
      viewBox="0 0 300 420"
      role="img"
      aria-label="Illustration of a hot air balloon rising at sunrise over layered mountains and a lake"
    >
      <defs>
        <linearGradient id="rqj-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--scene-sky)" />
          <stop offset="55%" stopColor="var(--scene-ground)" />
          <stop offset="100%" stopColor="var(--scene-ground)" />
        </linearGradient>
        <radialGradient id="rqj-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7e6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff7e6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rqj-balloon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="var(--active-bg)" />
        </linearGradient>
        <linearGradient id="rqj-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--scene-sky)" />
          <stop offset="100%" stopColor="var(--scene-ground)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="300" height="420" fill="url(#rqj-sky)" />

      {/* Sunrise glow, low on the horizon */}
      <circle className="rqj-sun" cx="150" cy="285" r="120" fill="url(#rqj-sun)" />
      <circle cx="150" cy="285" r="46" fill="#fff7e6" opacity="0.85" />

      {/* Birds */}
      <g className="rqj-bird rqj-bird-a" stroke="var(--muted)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" transform="translate(40,205)">
        <path d="M0 4q4-6 8 0q4-6 8 0" />
      </g>
      <g className="rqj-bird rqj-bird-b" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" transform="translate(70,238)">
        <path d="M0 4q4-6 8 0q4-6 8 0" />
      </g>
      <g className="rqj-bird rqj-bird-c" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" transform="translate(198,190)">
        <path d="M0 4q3.5-5 7 0q3.5-5 7 0" />
      </g>

      {/* Clouds */}
      <g className="rqj-cloud rqj-cloud-a" opacity="0.55">
        <ellipse cx="46" cy="150" rx="30" ry="12" fill="#fff" />
        <ellipse cx="70" cy="145" rx="18" ry="10" fill="#fff" />
      </g>
      <g className="rqj-cloud rqj-cloud-b" opacity="0.45">
        <ellipse cx="250" cy="120" rx="26" ry="11" fill="#fff" />
        <ellipse cx="270" cy="115" rx="15" ry="8" fill="#fff" />
      </g>

      {/* Balloon */}
      <g className="rqj-balloon">
        <line x1="140" y1="228" x2="130" y2="266" stroke="var(--brand)" strokeWidth="1.6" opacity="0.6" />
        <line x1="164" y1="230" x2="168" y2="266" stroke="var(--brand)" strokeWidth="1.6" opacity="0.6" />
        <rect x="126" y="266" width="40" height="24" rx="4" fill="var(--brand-dark)" />
        <rect x="126" y="266" width="40" height="5" rx="2.5" fill="var(--brand)" />
        <ellipse cx="150" cy="180" rx="42" ry="52" fill="url(#rqj-balloon)" stroke="var(--line-strong)" strokeWidth="1" />
        <path d="M116 160a42 52 0 0 1 20-24c-13 4-22 19-22 40z" fill="#ffffff" opacity="0.6" />
        {/* Gore seams — gentle curves following the envelope's roundness,
            rather than the flat horizontal bands a plain <line> would give. */}
        <path d="M150 128c-14 14-14 90 0 104" stroke="var(--brand)" strokeOpacity="0.4" strokeWidth="2.5" fill="none" />
        <path d="M150 128c-24 14-24 90 0 104" stroke="var(--brand)" strokeOpacity="0.32" strokeWidth="2.5" fill="none" />
        <path d="M150 128c14 14 14 90 0 104" stroke="var(--brand)" strokeOpacity="0.32" strokeWidth="2.5" fill="none" />
        {/* Neck skirt where the envelope gathers into the basket lines */}
        <path d="M138 228q12 8 24 0" stroke="var(--brand-dark)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Layered mountains, back to front */}
      <path d="M0 300l38-30 46 20 40-42 54 36 44-24 78 40v122H0z" fill="var(--brand)" opacity="0.16" />
      <path d="M0 330l50-26 42 20 60-34 50 26 46-18 52 24v140H0z" fill="var(--brand)" opacity="0.28" />
      <path d="M0 360l60-22 48 18 66-30 52 22 42-16 32 14v96H0z" fill="var(--brand-dark)" opacity="0.4" />

      {/* Foreground hills with pine clusters */}
      <path d="M0 392l30-16 44 12 40-20 56 16 60-14 70 18v34H0z" fill="var(--brand-dark)" opacity="0.65" />
      {[18, 30, 44].map((x, i) => (
        <g key={x} transform={`translate(${x},${370 - i * 3}) scale(${0.8 + i * 0.12})`} fill="var(--brand-dark)" opacity="0.7">
          <path d="M0 26h20l-10-14z" />
          <path d="M3 16h14l-7-11z" />
        </g>
      ))}
      {[228, 244, 262, 276].map((x, i) => (
        <g key={x} transform={`translate(${x},${364 - (i % 2) * 4}) scale(${0.75 + (i % 3) * 0.1})`} fill="var(--brand-dark)" opacity="0.7">
          <path d="M0 28h22l-11-15z" />
          <path d="M3 17h16l-8-12z" />
        </g>
      ))}

      {/* Lake with a soft mirrored reflection */}
      <rect x="0" y="392" width="300" height="28" fill="url(#rqj-lake)" opacity="0.9" />
      <ellipse className="rqj-glint" cx="150" cy="392" rx="46" ry="6" fill="#fff7e6" opacity="0.55" />
    </svg>
  )
}

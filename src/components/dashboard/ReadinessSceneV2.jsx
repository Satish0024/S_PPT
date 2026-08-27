// Animated sky/mountain/balloon illustration for the Retirement Readiness
// widget (v2). Pure inline SVG + CSS animation so it re-themes with the
// active brand color automatically (no raster asset to swap per client).
export default function ReadinessSceneV2({ idle = false }) {
  return (
    <svg
      className={`rr2-scene${idle ? ' idle' : ''}`}
      viewBox="0 0 240 130"
      role="img"
      aria-label="Illustration of a hot air balloon rising over mountains"
    >
      <defs>
        <linearGradient id="rr2-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--active-bg)" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="rr2-balloon-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="240" height="130" rx="12" fill="url(#rr2-sky)" />

      <g className="rr2-cloud rr2-cloud-a" opacity="0.9">
        <ellipse cx="34" cy="34" rx="22" ry="10" fill="#ffffff" />
        <ellipse cx="52" cy="30" rx="16" ry="9" fill="#ffffff" />
        <ellipse cx="18" cy="30" rx="12" ry="8" fill="#ffffff" />
      </g>
      <g className="rr2-cloud rr2-cloud-b" opacity="0.75">
        <ellipse cx="172" cy="20" rx="20" ry="9" fill="#ffffff" />
        <ellipse cx="188" cy="17" rx="13" ry="7" fill="#ffffff" />
        <ellipse cx="158" cy="18" rx="11" ry="7" fill="#ffffff" />
      </g>

      <g className="rr2-balloon">
        <line x1="120" y1="70" x2="112" y2="94" stroke="var(--brand)" strokeWidth="1.4" opacity="0.6" />
        <line x1="130" y1="72" x2="132" y2="94" stroke="var(--brand)" strokeWidth="1.4" opacity="0.6" />
        <rect x="110" y="94" width="24" height="14" rx="3" fill="var(--brand-dark)" />
        <ellipse cx="122" cy="55" rx="26" ry="30" fill="url(#rr2-balloon-a)" />
        <path d="M100 45a26 30 0 0 1 12-14 34 38 0 0 0-8 24z" fill="#ffffff" opacity="0.28" />
        <path d="M96 55h52M100 40h44M92 68h60" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" />
        <path d="M122 82c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10z" fill="var(--brand-dark)" />
      </g>

      <path d="M0 130V88l32-30 26 20 30-38 40 34 26-16 46 30 40-24v46z" fill="var(--active-bg)" />
      <path d="M0 130V104l46-26 42 22 52-30 50 28 50-20v52z" fill="var(--brand)" opacity="0.55" />
      <path d="M0 130v-18l58-20 46 18 60-24 46 20 30-12v36z" fill="var(--brand-dark)" opacity="0.85" />
    </svg>
  )
}

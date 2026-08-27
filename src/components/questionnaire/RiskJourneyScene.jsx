// A larger, more elaborate animated illustration for the risk
// questionnaire's side panel — twinkling stars, drifting cloud layers,
// layered mountains, and a hot air balloon rising with a soft glow behind
// it. Distinct from the compact dashboard ReadinessSceneV2 so the
// questionnaire feels like its own moment.
export default function RiskJourneyScene() {
  return (
    <svg className="rqj-scene" viewBox="0 0 300 420" role="img" aria-label="A hot air balloon rising over mountains under a starry sky">
      <defs>
        <radialGradient id="rqj-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rqj-balloon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#bcd2ff" />
        </linearGradient>
      </defs>

      <g className="rqj-star rqj-star-a">
        <path d="M50 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff" />
      </g>
      <g className="rqj-star rqj-star-b">
        <path d="M230 70l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" fill="#fff" />
      </g>
      <g className="rqj-star rqj-star-c">
        <circle cx="90" cy="100" r="2.6" fill="#fff" />
      </g>
      <g className="rqj-star rqj-star-d">
        <circle cx="250" cy="150" r="2" fill="#fff" />
      </g>
      <g className="rqj-star rqj-star-e">
        <path d="M40 160l2 4.6 4.6 2-4.6 2-2 4.6-2-4.6-4.6-2 4.6-2z" fill="#fff" />
      </g>
      <g className="rqj-star rqj-star-f">
        <circle cx="200" cy="30" r="1.8" fill="#fff" />
      </g>

      <circle className="rqj-glow" cx="185" cy="150" r="95" fill="url(#rqj-glow)" />

      <g className="rqj-cloud rqj-cloud-a" opacity="0.5">
        <ellipse cx="60" cy="210" rx="34" ry="14" fill="#fff" />
        <ellipse cx="88" cy="203" rx="22" ry="12" fill="#fff" />
        <ellipse cx="34" cy="204" rx="18" ry="10" fill="#fff" />
      </g>
      <g className="rqj-cloud rqj-cloud-b" opacity="0.35">
        <ellipse cx="230" cy="240" rx="30" ry="12" fill="#fff" />
        <ellipse cx="252" cy="234" rx="18" ry="10" fill="#fff" />
      </g>

      <g className="rqj-balloon">
        <line x1="172" y1="205" x2="160" y2="248" stroke="#fff" strokeWidth="1.6" opacity="0.7" />
        <line x1="198" y1="208" x2="202" y2="248" stroke="#fff" strokeWidth="1.6" opacity="0.7" />
        <rect x="156" y="248" width="46" height="26" rx="5" fill="#1f2268" />
        <rect x="156" y="248" width="46" height="6" rx="3" fill="#3d4fa8" />
        <ellipse cx="185" cy="150" rx="46" ry="55" fill="url(#rqj-balloon)" />
        <path d="M148 128a46 55 0 0 1 22-26c-14 4-24 20-24 42z" fill="#fff" opacity="0.5" />
        <path d="M155 150h60M162 122h46M147 178h76" stroke="#8fa8e8" strokeOpacity="0.55" strokeWidth="3.5" />
        <path d="M185 195c-5 6-9 11-9 16a9 9 0 0 0 18 0c0-5-4-10-9-16z" fill="#1f2268" />
      </g>

      <path d="M0 420V330l40-40 34 26 40-50 52 44 34-20 60 38 40-30v122z" fill="#ffffff" opacity="0.18" />
      <path d="M0 420V378l58-32 54 26 66-38 62 34 60-24v76z" fill="#ffffff" opacity="0.3" />
      <path d="M0 420v-46l72-24 58 22 74-30 58 24 38-14v68z" fill="#ffffff" opacity="0.45" />
    </svg>
  )
}

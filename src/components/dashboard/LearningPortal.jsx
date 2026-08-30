import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Decorative botanical sprig: a single arcing stem with fine-line leaves
// paired along it, drawn stroke-first with only a whisper of fill. This
// replaces three oversized, heavily-filled leaf blobs that read as flat
// clip-art rather than the editorial line art intended.
//
// aria-hidden — every word on the card is real text regardless of this.
function BotanicalArt() {
  // One leaf: a pointed ellipse plus its midrib, placed and angled on the
  // stem. Kept as a helper so the pairs stay geometrically consistent
  // instead of each being hand-tweaked (which is what made the old set
  // look arbitrary).
  const leaf = (x, y, angle, len, key) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        d={`M0 0 C ${len * 0.42} ${-len * 0.3}, ${len * 0.86} ${-len * 0.16}, ${len} 0 C ${len * 0.86} ${len * 0.16}, ${len * 0.42} ${len * 0.3}, 0 0 Z`}
        fill="var(--learn-pattern-soft)"
        stroke="var(--learn-pattern)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d={`M0 0 L ${len} 0`} fill="none" stroke="var(--learn-pattern)" strokeWidth=".7" opacity=".75" />
    </g>
  )

  return (
    <svg className="learn2-field" viewBox="0 0 200 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="learn2-glow" cx="62%" cy="38%" r="58%">
          <stop offset="0%" stopColor="var(--learn-pattern-soft)" />
          <stop offset="100%" stopColor="var(--learn-pattern-soft)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="180" fill="url(#learn2-glow)" />

      <g className="learn2-leaf-drift">
        {/* Main stem, arcing up from the lower right. */}
        <path
          d="M150 168 C 138 132, 132 96, 140 58 C 144 40, 152 26, 164 16"
          fill="none"
          stroke="var(--learn-pattern)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {[
          leaf(141, 132, -152, 34, 'l1'),
          leaf(139, 116, -26, 30, 'l2'),
          leaf(135, 98, -160, 30, 'l3'),
          leaf(137, 82, -20, 26, 'l4'),
          leaf(142, 60, -166, 25, 'l5'),
          leaf(148, 44, -14, 22, 'l6')
        ]}
        <circle cx="164" cy="16" r="2.6" fill="var(--learn-pattern)" opacity=".7" />
      </g>

      {/* A second, smaller sprig set further back for depth. */}
      <g className="learn2-leaf-drift d2" opacity=".55">
        <path
          d="M182 172 C 176 146, 176 122, 184 100"
          fill="none"
          stroke="var(--learn-pattern)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {[leaf(178, 146, -150, 22, 's1'), leaf(177, 128, -28, 19, 's2'), leaf(180, 110, -158, 18, 's3')]}
      </g>
    </svg>
  )
}

// Financial Wellness sidebar widget: a light, editorial content-discovery
// card. Typography carries the hierarchy, botanical line art provides
// texture on the right without becoming the focal point.
export default function LearningPortal() {
  return (
    <section className="learn2" aria-label="Financial Wellness">
      <BotanicalArt />
      <div className="learn2-body">
        <span className="learn2-tag">Learning</span>
        <h3 className="learn2-title">Financial Wellness</h3>
        <p className="learn2-desc">Learn about planning, saving, investing wisely</p>
        <Link className="learn2-cta" to="/enrich">
          Know More
          <ArrowRight size={13} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

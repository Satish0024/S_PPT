import { Link } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { useParticipant } from '../../context/ParticipantContext.jsx'

// Financial Wellness sidebar widget: a light, editorial content-discovery
// card. Typography carries the hierarchy on the left; the supplied
// illustration (public/learning-illustration.png) sits on the right,
// full colour, as the card's visual — not tinted or masked, since the
// gold/green/red of the source image is the point of it.
//
// Per prototype review #79, this shows one of two variants depending on
// the participant: auto-enrolled participants get the Enrich-branded
// version (no logo asset was supplied, so it uses an "enrich" text
// wordmark as a placeholder — swap in the real mark when it's provided);
// everyone else keeps the original generic Financial Wellness card.
export default function LearningPortal() {
  const { participant } = useParticipant()
  const isEnrich = participant?.scenario === 'Auto Enrolled'

  if (isEnrich) {
    return (
      <section className="learn2 learn2-enrich" aria-label="Enrich">
        <div className="learn2-body">
          <span className="learn2-enrich-mark" aria-hidden="true">
            enrich<span className="dot">.</span>
          </span>
          <p className="learn2-desc">
            Learn how saving, spending, investing, and retirement planning can work together to support your
            financial goals.
          </p>
          <Link className="learn2-cta" to="/enrich">
            Know More
            <Icon icon={faArrowRight} size={13} aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="learn2" aria-label="Financial Wellness">
      <img className="learn2-field" src="/learning-illustration.png" alt="" aria-hidden="true" />
      <div className="learn2-body">
        <span className="learn2-tag">Learning</span>
        <h3 className="learn2-title">Financial Wellness</h3>
        <p className="learn2-desc">Learn about planning, saving, investing wisely</p>
        <Link className="learn2-cta" to="/enrich">
          Know More
          <Icon icon={faArrowRight} size={13} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

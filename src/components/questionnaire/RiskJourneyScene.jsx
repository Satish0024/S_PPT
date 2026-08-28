// Sunrise hot-air-balloon scene for the risk questionnaire's side panel.
// This is the user-supplied reference image itself (public/risk-questionnaire-
// scene.png) rather than a redrawn illustration — static, reused unchanged
// across every questionnaire step. Only the copy above it changes per step.
export default function RiskJourneyScene() {
  return (
    <img
      className="rqj-scene"
      src="/risk-questionnaire-scene.png"
      alt="Illustration of a hot air balloon rising at sunrise over layered mountains and a lake"
    />
  )
}

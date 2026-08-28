import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Rocket, Scale, ShieldCheck, X } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { LIKERT_OPTIONS, LIKERT_QUESTIONS, QUESTIONNAIRE_STEP_COUNT } from '../data/riskQuestionnaire'
import { LOCATIONS, PREFS_KEY, hydratePrefs, writeMap } from '../lib/retirementGoal'
import { getRiskLevel, scoreQuestionnaire, setRiskProfileId } from '../lib/riskProfile'
import RiskJourneyScene from '../components/questionnaire/RiskJourneyScene.jsx'
import '../styles/riskQuestionnaire.css'

const LEVEL_ICON = { conservative: ShieldCheck, moderate: Scale, aggressive: Rocket }

export default function RiskQuestionnaire() {
  const { participant } = useParticipant()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Lets a caller (e.g. the enrollment Investment Election step) send the
  // participant here and get them back to a specific place afterward,
  // instead of always landing on the dashboard.
  const returnTo =
    params.get('return')?.startsWith('/') && !params.get('return')?.startsWith('//') ? params.get('return') : ''
  const goReturn = (extra) => navigate(returnTo ? `${returnTo}${extra || ''}` : '/')
  const [step, setStep] = useState(0) // 0..4 = likert questions, 5 = profile, 6 = results
  const [answers, setAnswers] = useState({})
  const [profile, setProfile] = useState(() => {
    const prefs = hydratePrefs(participant)
    return {
      location: prefs.location,
      retireAge: prefs.retireAge,
      monthlySpend: prefs.monthlySpend,
      salary: prefs.salary,
      outside: prefs.outside
    }
  })

  const leave = () => (returnTo ? goReturn() : navigate(-1))

  const isProfileStep = step === LIKERT_QUESTIONS.length
  const isResultsStep = step === LIKERT_QUESTIONS.length + 1
  const question = LIKERT_QUESTIONS[step]

  const canContinue = isProfileStep
    ? profile.location && profile.retireAge && profile.monthlySpend && profile.salary
    : isResultsStep
      ? true
      : Boolean(answers[question?.id])

  const finish = () => {
    writeMap(PREFS_KEY, participant.id, {
      location: profile.location,
      retireAge: +profile.retireAge,
      monthlySpend: +profile.monthlySpend,
      salary: +profile.salary,
      outside: +profile.outside || 0
    })
    const { levelId } = scoreQuestionnaire(answers)
    setRiskProfileId(participant.id, levelId)
  }

  const goNext = () => {
    if (isResultsStep) {
      // ?riskDone=1 tells a caller like Investments.jsx that a level was
      // just measured, so it can read it back via getRiskProfileId and
      // apply a matching allocation instead of landing on a blank step.
      goReturn(returnTo ? (returnTo.includes('?') ? '&riskDone=1' : '?riskDone=1') : '')
      return
    }
    if (isProfileStep) {
      finish()
      setStep((s) => s + 1)
      return
    }
    setStep((s) => s + 1)
  }
  const goBack = () => setStep((s) => Math.max(0, s - 1))

  const { levelId, score } = isResultsStep ? { ...scoreQuestionnaire(answers) } : {}
  const level = isResultsStep ? getRiskLevel(levelId) : null
  const ResultIcon = level ? LEVEL_ICON[level.id] : null

  return (
    <div className="rqp-page">
      <aside className="rqp-side" aria-hidden="true">
        <RiskJourneyScene />
        <div className="rqp-side-copy">
          <span className="rqp-side-tag">Quick Setup · Smarter Insights</span>
          <h1>See how ready you are for retirement</h1>
          <p>A few honest answers help us shape an investment style that actually fits how you feel about risk.</p>
        </div>
      </aside>

      <main className="rqp-main">
        <div className="rqp-main-head">
          <button type="button" className="rqp-leave" onClick={leave}>
            <ArrowLeft size={15} strokeWidth={2.2} />
            Back
          </button>
          {!isResultsStep && (
            <div className="rq-progress">
              <div className="rq-progress-track">
                <div
                  className="rq-progress-fill"
                  style={{ width: `${((step + 1) / QUESTIONNAIRE_STEP_COUNT) * 100}%` }}
                />
              </div>
              <span>
                {String(step + 1).padStart(2, '0')} / {String(QUESTIONNAIRE_STEP_COUNT).padStart(2, '0')}
              </span>
            </div>
          )}
          <button type="button" className="rq-close" onClick={leave} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="rqp-body">
          {!isProfileStep && !isResultsStep && (
            <div className="rq-step" key={question.id}>
              <h3 id="rq-title">{question.text}</h3>
              <div className="rq-options">
                {LIKERT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rq-opt${answers[question.id] === opt.value ? ' on' : ''}`}
                    onClick={() => setAnswers((a) => ({ ...a, [question.id]: opt.value }))}
                  >
                    <span className="rq-opt-dot" aria-hidden="true">
                      {answers[question.id] === opt.value && <Check size={12} strokeWidth={3} />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="rq-hint">This question helps us understand your investment style.</p>
            </div>
          )}

          {isProfileStep && (
            <div className="rq-step">
              <h3 id="rq-title">A few details about your plans</h3>
              <div className="rq-field">
                <label>Where do you intend to spend your retirement years?</label>
                <select value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rq-field">
                <label>At what age do you plan to retire?</label>
                <input
                  type="number"
                  min={45}
                  max={80}
                  value={profile.retireAge}
                  onChange={(e) => setProfile((p) => ({ ...p, retireAge: e.target.value }))}
                />
              </div>
              <div className="rq-field">
                <label>On average, how much do you spend each month?</label>
                <div className="rq-money">
                  <span>$</span>
                  <input
                    type="number"
                    min={0}
                    value={profile.monthlySpend}
                    onChange={(e) => setProfile((p) => ({ ...p, monthlySpend: e.target.value }))}
                  />
                </div>
              </div>
              <div className="rq-field">
                <label>What is your annual salary?</label>
                <div className="rq-money">
                  <span>$</span>
                  <input
                    type="number"
                    min={0}
                    value={profile.salary}
                    onChange={(e) => setProfile((p) => ({ ...p, salary: e.target.value }))}
                  />
                </div>
              </div>
              <div className="rq-field">
                <label>Other savings outside your 401(k) (IRAs, CDs, annuities, etc.)</label>
                <div className="rq-money">
                  <span>$</span>
                  <input
                    type="number"
                    min={0}
                    value={profile.outside}
                    onChange={(e) => setProfile((p) => ({ ...p, outside: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {isResultsStep && (
            <div className="rq-step rq-results">
              <span className="rq-results-ico" style={{ color: level.color }}>
                <ResultIcon size={34} strokeWidth={2} />
              </span>
              <span className="rq-results-tag" style={{ color: level.color }}>
                {level.badge} · {score}/100
              </span>
              <h3 id="rq-title">{level.label}</h3>
              <p>{level.copy}</p>
            </div>
          )}
        </div>

        <div className="rq-actions rqp-actions">
          {step > 0 && !isResultsStep && (
            <button type="button" className="btn btn-ghost" onClick={goBack}>
              <ArrowLeft size={15} strokeWidth={2.2} />
              Back
            </button>
          )}
          <button type="button" className="btn btn-primary rq-next" disabled={!canContinue} onClick={goNext}>
            {isResultsStep ? 'Done' : isProfileStep ? 'See my results' : 'Continue'}
            {!isResultsStep && <ArrowRight size={15} strokeWidth={2.2} />}
          </button>
        </div>
      </main>
    </div>
  )
}

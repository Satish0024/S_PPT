import { ageFromDob } from './retirementGoal'
import { LIKERT_QUESTIONS } from '../data/riskQuestionnaire'

export const RISK_PROFILE_KEY = 'lendguardRiskProfile'

// Three canonical levels — these ids line up with the `risk` field already
// used on fund rows in data/portfolio.js (conservative/moderate/aggressive).
export const RISK_LEVELS = [
  {
    id: 'conservative',
    label: 'Conservative Investor',
    badge: 'CONSERVATIVE',
    score: 15,
    color: '#1a9d63',
    copy: "This investment style favors stability, leaning on bonds and cash to help protect what you've saved."
  },
  {
    id: 'moderate',
    label: 'Moderate Investor',
    badge: 'MODERATE',
    score: 50,
    color: '#d4a017',
    copy: 'We picked this investment style based on how you answered the questionnaire.'
  },
  {
    id: 'aggressive',
    label: 'Aggressive Investor',
    badge: 'AGGRESSIVE',
    score: 85,
    color: '#c0392b',
    copy: 'This investment style leans into equities for higher long-term growth potential, with more short-term swings.'
  }
]

export function getRiskLevel(id) {
  return RISK_LEVELS.find((l) => l.id === id) || RISK_LEVELS[1]
}

function readOverrides() {
  try {
    return JSON.parse(sessionStorage.getItem(RISK_PROFILE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getRiskProfileId(participant) {
  const overrides = readOverrides()
  if (overrides[participant.id]) return overrides[participant.id]
  const age = ageFromDob(participant.profile?.dob)
  if (age < 35) return 'aggressive'
  if (age < 55) return 'moderate'
  return 'conservative'
}

// Fired on window whenever a risk level is saved, so any already-mounted
// widget (e.g. the dashboard Risk Meter) can refresh even when the
// questionnaire was opened from somewhere else (like the sidebar CTA).
export const RISK_PROFILE_UPDATED_EVENT = 'riskProfileUpdated'

export function setRiskProfileId(participantId, levelId) {
  try {
    const overrides = readOverrides()
    overrides[participantId] = levelId
    sessionStorage.setItem(RISK_PROFILE_KEY, JSON.stringify(overrides))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(RISK_PROFILE_UPDATED_EVENT, { detail: { participantId, levelId } }))
}

// Turns { [questionId]: 1-5 } answers into a 0-100 risk-tolerance score and
// the nearest canonical level. Reverse-scored questions (agreeing means
// more conservative) get flipped before summing.
export function scoreQuestionnaire(answers) {
  const total = LIKERT_QUESTIONS.reduce((sum, q) => {
    const raw = answers[q.id] || 3
    return sum + (q.reverse ? 6 - raw : raw)
  }, 0)
  const max = LIKERT_QUESTIONS.length * 5
  const min = LIKERT_QUESTIONS.length * 1
  const score = Math.round(((total - min) / (max - min)) * 100)
  const levelId = score < 35 ? 'conservative' : score <= 65 ? 'moderate' : 'aggressive'
  return { score, levelId }
}

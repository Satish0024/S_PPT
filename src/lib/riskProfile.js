import { ageFromDob } from './retirementGoal'

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

export function setRiskProfileId(participantId, levelId) {
  try {
    const overrides = readOverrides()
    overrides[participantId] = levelId
    sessionStorage.setItem(RISK_PROFILE_KEY, JSON.stringify(overrides))
  } catch {
    /* ignore */
  }
}

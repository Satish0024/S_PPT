import { AUTO_INCREASE_KEY, DEFERRAL_KEY, readSession } from '../data/participants'

export const READINESS_KEY = 'saturnaReadiness'
export const PREFS_KEY = 'saturnaReadinessPrefs'

export const ASSUMPTIONS = [
  'Calculations are performed at the individual plan level and then aggregated.',
  'Annual auto-increase percentages are applied when applicable.',
  'IRS limits and Secure Act provisions are applied based on the plan.',
  'Earnings are prorated across each source within the plan.',
  'A fixed inflation rate of 4% is used for salary and expenses.',
  'A standard return of 4.48% is applied to outside savings.',
  'Social Security benefits are treated as cash income.'
]

export const LOCATIONS = ['California', 'Texas', 'New York', 'Florida', 'Washington', 'Other']

export const LOCATION_DEFAULTS = {
  California: { monthlySpend: 6100, salary: 118000, outside: 48000 },
  'New York': { monthlySpend: 6400, salary: 124000, outside: 42000 },
  Washington: { monthlySpend: 5400, salary: 108000, outside: 56000 },
  Florida: { monthlySpend: 4700, salary: 91000, outside: 28000 },
  Texas: { monthlySpend: 4600, salary: 96000, outside: 32000 },
  Other: { monthlySpend: 4200, salary: 88000, outside: 24000 }
}

export const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export const round100 = (n) => Math.round((n || 0) / 100) * 100
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export function parseMoney(value) {
  if (typeof value === 'number') return value
  return Number(String(value || '').replace(/[^0-9.]/g, '')) || 0
}

export function readMap(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

export function writeMap(key, id, value) {
  try {
    const next = readMap(key)
    next[id] = value
    sessionStorage.setItem(key, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function ageFromDob(dob) {
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return 40
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age
}

export function locationFromCity(city = '') {
  if (/CA|California/i.test(city)) return 'California'
  if (/NY|New York/i.test(city)) return 'New York'
  if (/WA|Washington|Seattle/i.test(city)) return 'Washington'
  if (/FL|Florida/i.test(city)) return 'Florida'
  if (/TX|Texas/i.test(city)) return 'Texas'
  return 'Texas'
}

export function elections() {
  const deferral = readSession(DEFERRAL_KEY)
  const autoInc = readSession(AUTO_INCREASE_KEY)
  const optedOut = !!(deferral?.optedOut || deferral?.mode === 'optout')
  const pre = optedOut ? 0 : +deferral?.pre || 6
  const roth = optedOut ? 0 : +deferral?.roth || 2
  const autoOn = !optedOut && autoInc?.mode === 'do' && !autoInc?.skipped
  const autoPct = Number.isFinite(+autoInc?.incPre)
    ? +autoInc.incPre
    : Number.isFinite(+autoInc?.inc)
      ? +autoInc.inc
      : 1
  const autoCap = Number.isFinite(+autoInc?.capPre)
    ? +autoInc.capPre
    : Number.isFinite(+autoInc?.cap)
      ? +autoInc.cap
      : 10
  return { pre, roth, autoOn, autoPct, autoCap }
}

export function defaultPrefs(participant) {
  const location = locationFromCity(participant.profile?.city)
  return { location, retireAge: 67, ...LOCATION_DEFAULTS[location], ...elections() }
}

export function hydratePrefs(participant) {
  const saved = readMap(PREFS_KEY)[participant.id]
  const base = defaultPrefs(participant)
  return saved ? { ...base, ...saved } : base
}

export function scoreGoal({ prefs, currentAge, balance }) {
  const years = Math.max(1, (+prefs.retireAge || 67) - currentAge)
  const total = (+prefs.pre || 0) + (+prefs.roth || 0)
  const saveRate = Math.min(0.15, Math.max(0, total / 100))
  const salary = +prefs.salary || 0
  const annualSave = salary * saveRate
  const autoPct = Math.max(0, +prefs.autoPct || 0)
  const autoBoost = prefs.autoOn ? 1 + Math.min(0.55, autoPct * 0.18) : 1
  const realRate = 0.03
  const fvAnnuity = (Math.pow(1 + realRate, years) - 1) / realRate
  const nestEgg =
    annualSave * fvAnnuity * autoBoost +
    balance * Math.pow(1 + realRate, years) +
    (+prefs.outside || 0) * Math.pow(1.0048, years)
  const socialSecurity = Math.min(28800, Math.max(15600, salary * 0.21))
  const income = round100(nestEgg * 0.04 + socialSecurity)
  const expense = round100((+prefs.monthlySpend || 0) * 12)
  const shortfall = Math.max(0, expense - income)
  const score = expense <= 0 ? 0 : Math.max(4, Math.min(100, Math.round((income / expense) * 100)))
  return { score, income, expense, shortfall, years }
}

// Only two neutral scenarios are shown here — there is no alarming
// "Needs Attention" state, so a lower score still reads as encouraging
// guidance rather than a warning.
export function statusCopy(score) {
  if (score >= 80) return { title: 'Excellent!', body: 'Your plan is well set up for this retirement goal.' }
  return { title: 'On Track', body: 'A few changes can close the gap to your target.' }
}

export function playLevel(score) {
  if (score >= 95) return { label: 'Level 4', name: 'Fully Funded', tone: 'max' }
  if (score >= 80) return { label: 'Level 3', name: 'Goal Unlocked', tone: 'good' }
  if (score >= 55) return { label: 'Level 2', name: 'On Track', tone: 'ok' }
  return { label: 'Level 1', name: 'Warming Up', tone: 'warn' }
}

export function applyMission(draft, kind) {
  if (kind === 'auto') return { ...draft, autoOn: true, autoPct: Math.max(1, +draft.autoPct || 1) }
  if (kind === 'autoPct') return { ...draft, autoOn: true, autoPct: Math.min(3, (+draft.autoPct || 1) + 1) }
  if (kind === 'pre') return setRateOn(draft, 'pre', (+draft.pre || 0) + 1)
  if (kind === 'spend') return { ...draft, monthlySpend: Math.max(500, (+draft.monthlySpend || 0) - 200) }
  if (kind === 'outside') return { ...draft, outside: (+draft.outside || 0) + 5000 }
  return draft
}

export function revertMission(draft, kind) {
  if (kind === 'auto') return { ...draft, autoOn: false }
  if (kind === 'autoPct') return { ...draft, autoPct: Math.max(1, (+draft.autoPct || 1) - 1) }
  if (kind === 'pre') return setRateOn(draft, 'pre', Math.max(0, (+draft.pre || 0) - 1))
  if (kind === 'spend') return { ...draft, monthlySpend: (+draft.monthlySpend || 0) + 200 }
  if (kind === 'outside') return { ...draft, outside: Math.max(0, (+draft.outside || 0) - 5000) }
  return draft
}

export function ptsDelta(from, to) {
  return Math.round((to || 0) - (from || 0))
}

export function goalMissions(draft, currentAge, balance) {
  const live = scoreGoal({ prefs: draft, currentAge, balance })
  const withAuto = scoreGoal({
    prefs: { ...draft, autoOn: true, autoPct: Math.max(1, +draft.autoPct || 1) },
    currentAge,
    balance
  })
  const withPre = scoreGoal({
    prefs: { ...draft, pre: Math.min(12, (+draft.pre || 0) + 1) },
    currentAge,
    balance
  })
  const withSpend = scoreGoal({
    prefs: { ...draft, monthlySpend: Math.max(500, (+draft.monthlySpend || 0) - 200) },
    currentAge,
    balance
  })
  const withOutside = scoreGoal({
    prefs: { ...draft, outside: (+draft.outside || 0) + 5000 },
    currentAge,
    balance
  })
  const withAutoPct = scoreGoal({
    prefs: { ...draft, autoOn: true, autoPct: Math.min(3, (+draft.autoPct || 1) + 1) },
    currentAge,
    balance
  })

  const missions = []
  if (!draft.autoOn) {
    missions.push({
      id: 'auto',
      title: 'Turn On Auto Increase',
      detail: `+${Math.max(1, +draft.autoPct || 1)}% each year until ${draft.autoCap || 10}%`,
      pts: ptsDelta(live.score, withAuto.score),
      kind: 'auto'
    })
  } else if ((+draft.autoPct || 1) < 3) {
    missions.push({
      id: 'autoPct',
      title: 'Raise Auto Increase',
      detail: `Move from +${draft.autoPct || 1}% to +${Math.min(3, (+draft.autoPct || 1) + 1)}% each year`,
      pts: ptsDelta(live.score, withAutoPct.score),
      kind: 'autoPct'
    })
  }
  if ((+draft.pre || 0) < 12) {
    missions.push({
      id: 'pre',
      title: 'Add 1% Pre-Tax',
      detail: `Lift deferral from ${draft.pre || 0}% to ${(draft.pre || 0) + 1}%`,
      pts: ptsDelta(live.score, withPre.score),
      kind: 'pre'
    })
  }
  missions.push({
    id: 'spend',
    title: 'Trim Spend $200',
    detail: 'A smaller monthly target closes the gap faster',
    pts: ptsDelta(live.score, withSpend.score),
    kind: 'spend'
  })
  missions.push({
    id: 'outside',
    title: 'Add $5,000 Outside',
    detail: 'Grow savings outside your 401(k)',
    pts: ptsDelta(live.score, withOutside.score),
    kind: 'outside'
  })
  return missions.filter((m) => m.pts > 0).slice(0, 3)
}

export function setRateOn(prefs, key, value) {
  const next = Math.round(clamp(+value || 0, 0, 12))
  const other = key === 'pre' ? +prefs.roth || 0 : +prefs.pre || 0
  const capped = Math.min(next, 15 - other)
  return { ...prefs, [key]: Math.max(0, capped) }
}

export function goalDiff(from, to, fromScore, toScore) {
  const rows = []
  const add = (label, was, now) => {
    if (String(was) === String(now)) return
    rows.push({ label, was, now })
  }
  add('Retirement Location', from.location, to.location)
  add('Retirement Age', from.retireAge, to.retireAge)
  add('Monthly Spending', money(from.monthlySpend), money(to.monthlySpend))
  add('Annual Salary', money(from.salary), money(to.salary))
  add('Outside Savings', money(from.outside), money(to.outside))
  add('Pre-Tax Deferral', `${from.pre || 0}%`, `${to.pre || 0}%`)
  add('Roth Deferral', `${from.roth || 0}%`, `${to.roth || 0}%`)
  add(
    'Auto Increase',
    from.autoOn ? `On · +${from.autoPct || 1}% to ${from.autoCap || 10}%` : 'Off',
    to.autoOn ? `On · +${to.autoPct || 1}% to ${to.autoCap || 10}%` : 'Off'
  )
  add('Readiness Score', `${fromScore}%`, `${toScore}%`)
  return rows
}


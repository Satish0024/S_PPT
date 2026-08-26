import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  CircleCheck,
  CircleDollarSign,
  MapPin,
  Sparkles,
  X,
  Trophy,
  AlertTriangle,
  Umbrella
} from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { isNotEligibleUser } from '../data/participants'
import { DisclaimerModal, ReadinessChart } from '../components/dashboard/ReadinessVisuals.jsx'
import {
  LOCATION_DEFAULTS,
  LOCATIONS,
  PREFS_KEY,
  READINESS_KEY,
  ageFromDob,
  applyMission,
  revertMission,
  clamp,
  goalDiff,
  goalMissions,
  hydratePrefs,
  money,
  parseMoney,
  scoreGoal,
  setRateOn,
  statusCopy,
  writeMap
} from '../lib/retirementGoal'

function useAnimatedNumber(value) {
  const [shown, setShown] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    let frame
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 420)
      const eased = 1 - (1 - t) * (1 - t)
      const next = Math.round(from + (value - from) * eased)
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return shown
}

function TargetCard({ icon: Icon, label, hint, children }) {
  return (
    <div className="rg-target">
      <span className="rg-target-ico" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="rg-target-copy">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      <div className="rg-target-ctrl">{children}</div>
    </div>
  )
}

function MoneyInput({ value, onChange }) {
  return (
    <span className="rg-affix">
      <em>$</em>
      <input
        inputMode="numeric"
        value={value ? Number(value).toLocaleString('en-US') : ''}
        onChange={(e) => onChange(parseMoney(e.target.value))}
      />
    </span>
  )
}

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const drift = (i % 2 === 0 ? 1 : -1) * (10 + (i % 9) * 6)
        return {
          left: `${(i * 17 + (i % 5) * 4) % 100}%`,
          delay: `${(i % 12) * 0.08}s`,
          duration: `${2.2 + (i % 5) * 0.25}s`,
          color: ['#2e3192', '#1a9d63', '#d4a017', '#4a63c7'][i % 4],
          size: 6 + (i % 4) * 2,
          round: i % 3 === 0,
          spin: (i % 2 === 0 ? 1 : -1) * (200 + (i % 7) * 36),
          drift: `${drift}px`
        }
      }),
    []
  )
  return (
    <div className="rg-confetti loop" aria-hidden="true">
      {bits.map((bit, i) => (
        <i
          key={i}
          className={bit.round ? 'round' : ''}
          style={{
            left: bit.left,
            width: bit.size,
            height: bit.round ? bit.size : bit.size * (i % 3 === 0 ? 1.7 : 1),
            background: bit.color,
            animationDelay: bit.delay,
            animationDuration: bit.duration,
            '--spin': `${bit.spin}deg`,
            '--drift': bit.drift
          }}
        />
      ))}
    </div>
  )
}

function RangeField({ min, max, value, origin, onChange, step = 1 }) {
  const span = Math.max(1, max - min)
  const valuePct = ((value - min) / span) * 100
  const originPct = ((origin - min) / span) * 100
  const changed = Number(value) !== Number(origin)
  const direction = Number(value) > Number(origin) ? 'up' : Number(value) < Number(origin) ? 'down' : 'same'
  return (
    <div className={`rg-range${changed ? ` changed rg-range--${direction}` : ''}`}>
      <span className="rg-range-fill" style={{ width: `${valuePct}%` }} />
      {changed && (
        <span
          className="rg-range-origin"
          style={{ left: `${originPct}%` }}
          title={`Current setting ${origin}%`}
        />
      )}
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
      {changed && (
        <small className="rg-range-note">
          <em>Current {origin}%</em>
          <b className={`rg-range-new rg-range-new--${direction}`}>New {value}%</b>
        </small>
      )}
    </div>
  )
}

function AutoIncreaseRow({ label, hint, inc, cap, onInc, onCap }) {
  const capMin = Math.min(15, Math.max(1, inc + 1))
  return (
    <div className="ai-row">
      <span className="ai-source">
        <b>{label}</b>
        <small>{hint}</small>
      </span>
      <span className="sval">
        <input
          type="number"
          value={inc}
          min={1}
          max={5}
          onChange={(e) => onInc(Math.min(5, Math.max(1, Math.round(+e.target.value || 1))))}
        />
        <span className="pct">%</span>
      </span>
      <span className="sval">
        <input
          type="number"
          value={cap}
          min={capMin}
          max={15}
          onChange={(e) => onCap(Math.min(15, Math.max(capMin, Math.round(+e.target.value || capMin))))}
        />
        <span className="pct">%</span>
      </span>
    </div>
  )
}

function AutoIncreaseBlock({ state, onChange }) {
  const pctPre = Math.max(1, +state.pctPre || 1)
  const capPre = Math.max(pctPre, +state.capPre || 10)
  const pctRoth = Math.max(1, +state.pctRoth || pctPre)
  const capRoth = Math.max(pctRoth, +state.capRoth || capPre)
  return (
    <>
      <label className={`rg-toggle${state.on ? ' on' : ''}`}>
        <input type="checkbox" checked={!!state.on} onChange={(e) => onChange('on', e.target.checked)} />
        <span>
          <b>Auto Increase {state.on ? `· +${pctPre}% / Year` : '· Off'}</b>
          {state.on
            ? `Deferral rises ${pctPre}% each year until it reaches ${capPre}%.`
            : 'Typical plan setting is +1% each year until 10%.'}
        </span>
      </label>
      {state.on && (
        <div className="rg-auto">
          <div className="ai-source-table">
            <div className="ai-row head">
              <span>Source</span>
              <span>Increment</span>
              <span>Max Limit</span>
            </div>
            <AutoIncreaseRow
              label="Pre-Tax"
              hint="Applies to your Pre-Tax deferral rate."
              inc={pctPre}
              cap={capPre}
              onInc={(v) => onChange('pctPre', clamp(v, 1, 5))}
              onCap={(v) => onChange('capPre', clamp(v, pctPre + 1, 15))}
            />
            <AutoIncreaseRow
              label="Roth"
              hint="Applies to your Roth deferral rate."
              inc={pctRoth}
              cap={capRoth}
              onInc={(v) => onChange('pctRoth', clamp(v, 1, 5))}
              onCap={(v) => onChange('capRoth', clamp(v, pctRoth + 1, 15))}
            />
          </div>
        </div>
      )}
    </>
  )
}

const AUTO_FIELD_MAP = { on: 'autoOn', pctPre: 'autoPct', capPre: 'autoCap', pctRoth: 'autoPctRoth', capRoth: 'autoCapRoth' }

function PctInput({ value, onChange, min = 0, max = 15 }) {
  return (
    <span className="rg-affix pct">
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <em>%</em>
    </span>
  )
}

const canDefer = (plan) => /401\(k\)/i.test(plan.type || '')
const isParticipatingPlan = (plan) => /enrolled|participating/i.test(`${plan.badge} ${plan.details?.status || ''}`)
const isEligibleOnlyPlan = (plan) => plan.badge === 'Eligible' || plan.badgeClass === 'eligible'

function deferralPlansFor(participant) {
  return (participant.plans || []).filter((p) => canDefer(p) && (isParticipatingPlan(p) || isEligibleOnlyPlan(p)))
}

function initialShares(plans, seedPre, seedRoth) {
  const shares = {}
  plans.forEach((p, i) => {
    shares[p.id] = i === 0 ? { pre: seedPre || 0, roth: seedRoth || 0 } : { pre: 0, roth: 0 }
  })
  return shares
}

function sumShares(shares) {
  return Object.values(shares).reduce(
    (acc, s) => ({ pre: acc.pre + (+s.pre || 0), roth: acc.roth + (+s.roth || 0) }),
    { pre: 0, roth: 0 }
  )
}

const blankAuto = () => ({ on: false, pctPre: 1, capPre: 10, pctRoth: 1, capRoth: 10 })

function initialAuto(plans, seed) {
  const auto = {}
  plans.forEach((p, i) => {
    auto[p.id] =
      i === 0
        ? {
            on: !!seed.autoOn,
            pctPre: Math.max(1, +seed.autoPct || 1),
            capPre: Math.max(1, +seed.autoCap || 10),
            pctRoth: Math.max(1, +seed.autoPctRoth || +seed.autoPct || 1),
            capRoth: Math.max(1, +seed.autoCapRoth || +seed.autoCap || 10)
          }
        : blankAuto()
  })
  return auto
}

function aggregateAuto(auto) {
  const on = Object.values(auto).some((a) => a.on)
  const enabled = Object.values(auto).filter((a) => a.on)
  const pick = (key) => (enabled.length ? Math.max(...enabled.map((a) => +a[key] || 0)) : 1)
  return {
    autoOn: on,
    autoPct: pick('pctPre'),
    autoCap: Math.max(pick('pctPre'), pick('capPre')),
    autoPctRoth: pick('pctRoth'),
    autoCapRoth: Math.max(pick('pctRoth'), pick('capRoth'))
  }
}

export default function RetirementGoal() {
  const { participant } = useParticipant()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => hydratePrefs(participant))
  const [baseline, setBaseline] = useState(() => hydratePrefs(participant))
  const deferralPlans = useMemo(() => deferralPlansFor(participant), [participant])
  const multiPlan = deferralPlans.length > 1
  const [activePlanId, setActivePlanId] = useState(() => deferralPlans[0]?.id)
  const [expandedPlanId, setExpandedPlanId] = useState(() => deferralPlans[0]?.id)
  const [planShares, setPlanShares] = useState(() => initialShares(deferralPlans, draft.pre, draft.roth))
  const [baselineShares, setBaselineShares] = useState(() => initialShares(deferralPlans, draft.pre, draft.roth))
  const [planAuto, setPlanAuto] = useState(() => initialAuto(deferralPlans, draft))
  const [baselineAuto, setBaselineAuto] = useState(() => initialAuto(deferralPlans, draft))
  const [open, setOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [changes, setChanges] = useState([])
  const [applied, setApplied] = useState([])
  const [delta, setDelta] = useState(null)
  const [celebrate, setCelebrate] = useState(false)
  const prevScore = useRef(null)

  useEffect(() => {
    if (isNotEligibleUser(participant)) {
      navigate('/', { replace: true })
    }
  }, [participant, navigate])

  useEffect(() => {
    const next = hydratePrefs(participant)
    setDraft(next)
    setBaseline(next)
    setApplied([])
    const plans = deferralPlansFor(participant)
    const shares = initialShares(plans, next.pre, next.roth)
    const auto = initialAuto(plans, next)
    setActivePlanId(plans[0]?.id)
    setExpandedPlanId(plans[0]?.id)
    setPlanShares(shares)
    setBaselineShares(shares)
    setPlanAuto(auto)
    setBaselineAuto(auto)
  }, [participant.id])

  const setPlanRate = (planId, key, value) => {
    const next = Math.max(0, Math.min(12, Math.round(+value || 0)))
    setPlanShares((prev) => {
      const updated = { ...prev, [planId]: { ...prev[planId], [key]: next } }
      const totals = sumShares(updated)
      setDraft((d) => ({ ...d, pre: totals.pre, roth: totals.roth }))
      return updated
    })
  }

  const setPlanAutoField = (planId, key, value) => {
    setPlanAuto((prev) => {
      const updated = { ...prev, [planId]: { ...(prev[planId] || blankAuto()), [key]: value } }
      setDraft((d) => ({ ...d, ...aggregateAuto(updated) }))
      return updated
    })
  }

  const currentAge = ageFromDob(participant.profile?.dob)
  const balance = parseMoney(participant.overall?.total)
  const live = useMemo(
    () => scoreGoal({ prefs: draft, currentAge, balance }),
    [draft, currentAge, balance]
  )
  const shownScore = useAnimatedNumber(live.score)
  const liveStatus = statusCopy(live.score)
  const liveExcellent = live.score >= 80
  const missions = useMemo(
    () => goalMissions(draft, currentAge, balance),
    [draft, currentAge, balance]
  )

  useEffect(() => {
    const prev = prevScore.current
    if (prev == null) {
      prevScore.current = live.score
      return
    }
    if (live.score !== prev) {
      setDelta({ value: live.score - prev, key: Date.now() })
      if (prev < 80 && live.score >= 80) setCelebrate(true)
      prevScore.current = live.score
    }
  }, [live.score])

  useEffect(() => {
    if (!celebrate) return
    const t = window.setTimeout(() => setCelebrate(false), 2200)
    return () => window.clearTimeout(t)
  }, [celebrate])

  const setDraftField = (key, value) => setDraft((p) => ({ ...p, [key]: value }))
  const setRate = (key, value) => setDraft((p) => setRateOn(p, key, value))
  const runMission = (mission) => {
    setDraft((p) => applyMission(p, mission.kind))
    setApplied((list) => [...list, { ...mission, key: `${mission.id}-${Date.now()}` }])
  }
  const undoMission = (mission) => {
    setDraft((p) => revertMission(p, mission.kind))
    setApplied((list) => list.filter((item) => item.key !== mission.key))
  }

  const startScore = useMemo(
    () => scoreGoal({ prefs: baseline, currentAge, balance }).score,
    [baseline, currentAge, balance]
  )

  const save = () => {
    writeMap(PREFS_KEY, participant.id, draft)
    writeMap(READINESS_KEY, participant.id, true)
    setChanges(goalDiff(baseline, draft, startScore, live.score))
    setBaseline(draft)
    setBaselineShares(planShares)
    setBaselineAuto(planAuto)
    setApplied([])
    setSavedOpen(true)
  }

  const autoPct = Math.max(1, +draft.autoPct || 1)
  const autoCap = Math.max(autoPct, +draft.autoCap || 10)
  const autoPctRoth = Math.max(1, +draft.autoPctRoth || autoPct)
  const autoCapRoth = Math.max(autoPctRoth, +draft.autoCapRoth || autoCap)
  const spendHint = LOCATION_DEFAULTS[draft.location]?.monthlySpend
  const annualSpend = money((+draft.monthlySpend || 0) * 12)
  const saveTone = live.score >= 80 ? 'good' : live.score >= 55 ? 'ok' : 'warn'
  const SaveIcon = saveTone === 'warn' ? AlertTriangle : saveTone === 'good' ? Trophy : CircleCheck
  const scoreRow = changes.find((row) => row.label === 'Readiness Score')
  const inputChanges = changes.filter((row) => row.label !== 'Readiness Score')
  const scoreWas = scoreRow ? parseInt(scoreRow.was, 10) : live.score
  const scoreNow = live.score
  const scoreDelta = scoreNow - scoreWas

  if (isNotEligibleUser(participant)) return null

  return (
    <div className="page-body rg-page">
      <div className="hi-bar">
        <div>
          <Link className="text-link rg-back" to="/">
            <ArrowLeft size={16} strokeWidth={2.2} />
            Back To Dashboard
          </Link>
          <h1>Retirement Goal Simulator</h1>
          <p className="rg-intro">
            Set the target first, then try a change below. The score updates as you go — enrollment is not changed until
            you save this goal.
          </p>
        </div>
      </div>

      <div className="rg-shell">
        <aside className={`panel rg-live${celebrate ? ' win' : ''}`} aria-live="polite">
          <ReadinessChart
            score={shownScore}
            expense={live.expense}
            income={live.income}
            shortfall={live.shortfall}
            large
          />
          {delta && (
            <span key={delta.key} className={`rg-delta ${delta.value >= 0 ? 'up' : 'down'}`}>
              {delta.value >= 0 ? '+' : ''}
              {delta.value}
            </span>
          )}
          <div className={`rr-status ${liveExcellent ? 'good' : live.score >= 55 ? 'ok' : 'warn'}`}>
            <b>{liveStatus.title}</b>
            <span>{liveStatus.body}</span>
          </div>
          <dl className="rg-facts">
            <div>
              <dt>Retirement Age</dt>
              <dd>{draft.retireAge}</dd>
            </div>
            <div>
              <dt>Years Remaining</dt>
              <dd>{live.years}</dd>
            </div>
            {multiPlan ? (
              deferralPlans.map((plan) => {
                const share = planShares[plan.id] || { pre: 0, roth: 0 }
                return (
                  <div key={plan.id}>
                    <dt>{plan.name} Deferral</dt>
                    <dd>{(share.pre || 0) + (share.roth || 0)}%</dd>
                  </div>
                )
              })
            ) : (
              <div>
                <dt>Deferrals</dt>
                <dd>{(draft.pre || 0) + (draft.roth || 0)}% of pay</dd>
              </div>
            )}
            <div>
              <dt>Auto Increase</dt>
              <dd>{draft.autoOn ? `+${autoPct}% each year` : 'Off'}</dd>
            </div>
          </dl>
          <p className="rg-disc">
            *Not guaranteed results · It&apos;s a simulation.{' '}
            <button type="button" className="rr-more" onClick={() => setOpen(true)}>
              Read More
            </button>
          </p>
        </aside>

        <div className="rg-work">
          <section className="rg-improve rg-hidden" aria-label="Ways To Improve">
            <div className="rg-improve-h">
              <Sparkles size={16} strokeWidth={2.1} />
              <h2>Ways To Improve</h2>
              <span>Apply a change to see the score move</span>
            </div>
            <div className="rg-tips">
              {missions.length ? (
                missions.map((mission) => (
                  <div className="rg-tip" key={mission.id}>
                    <b className="rg-tip-pts">+{mission.pts}</b>
                    <div>
                      <strong>{mission.title}</strong>
                      <p>{mission.detail}</p>
                      <button type="button" className="text-link" onClick={() => runMission(mission)}>
                        Apply This Change
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rg-tip done">
                  <b className="rg-tip-pts">✓</b>
                  <div>
                    <strong>Your Goal Looks Funded</strong>
                    <p>Stress-test it with a higher spend or an earlier retirement age.</p>
                  </div>
                </div>
              )}
            </div>
            {applied.length > 0 && (
              <ul className="rg-applied-list" aria-label="Applied changes">
                {applied.map((mission) => (
                  <li key={mission.key}>
                    <Check size={12} strokeWidth={2.6} />
                    <strong>{mission.title}</strong>
                    <button
                      type="button"
                      className="rg-applied-x"
                      aria-label={`Revert ${mission.title}`}
                      onClick={() => undoMission(mission)}
                    >
                      <X size={11} strokeWidth={2.6} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel rg-inputs">
            <h2>Retirement Target</h2>
            <div className="rg-targets">
              <TargetCard icon={MapPin} label="Retirement Location" hint="Used to estimate a typical monthly spend">
                <select
                  value={draft.location}
                  onChange={(e) => {
                    const location = e.target.value
                    const next = LOCATION_DEFAULTS[location] || LOCATION_DEFAULTS.Other
                    setDraft((p) => ({ ...p, location, monthlySpend: next.monthlySpend }))
                  }}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>
              </TargetCard>
              <TargetCard icon={Umbrella} label="Planned Retirement Age" hint={`About ${live.years} years from now`}>
                <span className="rg-step">
                  <button
                    type="button"
                    aria-label="Lower age"
                    onClick={() => setDraftField('retireAge', clamp((+draft.retireAge || 67) - 1, 50, 80))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={50}
                    max={80}
                    value={draft.retireAge}
                    onChange={(e) => setDraftField('retireAge', clamp(Math.round(+e.target.value || 67), 50, 80))}
                  />
                  <button
                    type="button"
                    aria-label="Raise age"
                    onClick={() => setDraftField('retireAge', clamp((+draft.retireAge || 67) + 1, 50, 80))}
                  >
                    +
                  </button>
                </span>
              </TargetCard>
              <TargetCard
                icon={CalendarDays}
                label="Monthly Spending"
                hint={spendHint ? `About ${annualSpend} a year · typical here is ${money(spendHint)}` : `${annualSpend} a year`}
              >
                <MoneyInput
                  value={draft.monthlySpend}
                  onChange={(n) => setDraftField('monthlySpend', Math.max(0, n))}
                />
              </TargetCard>
              <TargetCard icon={Banknote} label="Annual Salary" hint="Drives how much each deferral percent saves">
                <MoneyInput value={draft.salary} onChange={(n) => setDraftField('salary', Math.max(0, n))} />
              </TargetCard>
              <TargetCard
                icon={CircleDollarSign}
                label="Savings Outside Your 401(k)"
                hint="Brokerage, IRAs, and cash you expect to use in retirement"
              >
                <MoneyInput value={draft.outside} onChange={(n) => setDraftField('outside', Math.max(0, n))} />
              </TargetCard>
            </div>
          </section>

          <section className="panel rg-inputs">
            <h2>Deferrals</h2>
            {multiPlan && (
              <p className="rg-plan-note">
                You have {deferralPlans.length} plans that take deferrals. Tap a plan to edit its rate — the combined
                total across all plans drives the readiness score.
              </p>
            )}
            {deferralPlans.map((plan, i) => {
              const share = multiPlan ? planShares[plan.id] || { pre: 0, roth: 0 } : { pre: draft.pre || 0, roth: draft.roth || 0 }
              const baseShare = multiPlan
                ? baselineShares[plan.id] || { pre: 0, roth: 0 }
                : { pre: baseline.pre || 0, roth: baseline.roth || 0 }
              const onPre = (v) => (multiPlan ? setPlanRate(plan.id, 'pre', v) : setRate('pre', v))
              const onRoth = (v) => (multiPlan ? setPlanRate(plan.id, 'roth', v) : setRate('roth', v))
              const body = (
                <>
                  <div className="rg-source">
                    <div className="rg-source-h">
                      <span>
                        <b>Pre-Tax Deferral</b>
                        <small>Goes in before taxes and can lower taxable income today.</small>
                      </span>
                      <PctInput value={share.pre || 0} onChange={onPre} max={12} />
                    </div>
                    <RangeField
                      min={0}
                      max={12}
                      value={share.pre || 0}
                      origin={baseShare.pre || 0}
                      onChange={(e) => onPre(e.target.value)}
                    />
                  </div>
                  <div className="rg-source">
                    <div className="rg-source-h">
                      <span>
                        <b>Roth Deferral</b>
                        <small>Goes in after taxes. Qualified withdrawals can come out tax-free.</small>
                      </span>
                      <PctInput value={share.roth || 0} onChange={onRoth} max={12} />
                    </div>
                    <RangeField
                      min={0}
                      max={12}
                      value={share.roth || 0}
                      origin={baseShare.roth || 0}
                      onChange={(e) => onRoth(e.target.value)}
                    />
                  </div>
                </>
              )
              if (!multiPlan) {
                return (
                  <div key="single">
                    {body}
                    <AutoIncreaseBlock
                      state={{ on: draft.autoOn, pctPre: autoPct, capPre: autoCap, pctRoth: autoPctRoth, capRoth: autoCapRoth }}
                      onChange={(key, val) => setDraftField(AUTO_FIELD_MAP[key], val)}
                    />
                  </div>
                )
              }
              const total = (+share.pre || 0) + (+share.roth || 0)
              const expanded = expandedPlanId === plan.id
              const planAutoState = planAuto[plan.id] || blankAuto()
              return (
                <div className={`rg-plan-card${expanded ? ' open' : ''}`} key={plan.id}>
                  <button
                    type="button"
                    className="rg-plan-card-h"
                    aria-expanded={expanded}
                    onClick={() => setExpandedPlanId(expanded ? null : plan.id)}
                  >
                    <div className="rg-plan-card-name">
                      <b>{plan.name}</b>
                      <span className={`plan-badge ${plan.badgeClass || ''}`}>{plan.badge}</span>
                    </div>
                    <div className="rg-plan-card-metrics">
                      <span className="rg-plan-card-total">
                        Deferral <b>{total}%</b>
                        <small>
                          Pre-Tax {share.pre || 0}% · Roth {share.roth || 0}%
                          {planAutoState.on ? ` · Auto +${planAutoState.pctPre}%/yr` : ''}
                        </small>
                      </span>
                      <span className="rg-plan-card-toggle">{expanded ? 'Done' : 'Edit'}</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="rg-plan-card-body">
                      {body}
                      <AutoIncreaseBlock state={planAutoState} onChange={(key, val) => setPlanAutoField(plan.id, key, val)} />
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        </div>
      </div>

      <div className="rg-nav">
        <button type="button" className="btn btn-primary" onClick={save}>
          Save This Goal
        </button>
        <Link className="text-link" to="/">
          Cancel
        </Link>
      </div>

      {open && <DisclaimerModal onClose={() => setOpen(false)} />}

      {savedOpen && (
        <div className="enroll-modal-bg rg-save-bg" role="presentation">
          {saveTone !== 'warn' && <Confetti />}
          <div
            className={`enroll-modal rr-modal rg-save ${saveTone}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rg-saved-title"
          >
            <div className="rg-save-hero">
              <span className="rg-save-mark" aria-hidden="true">
                <SaveIcon size={26} strokeWidth={2.1} />
              </span>
              <h4 id="rg-saved-title">{saveTone === 'warn' ? 'Goal Saved · Needs Attention' : 'Goal Saved'}</h4>
              <p>{liveStatus.body}</p>
            </div>
            <div
              className="rg-save-score"
              aria-label={
                scoreDelta
                  ? `Readiness score ${scoreWas} percent to ${scoreNow} percent`
                  : `Readiness score ${scoreNow} percent`
              }
            >
              <div className="rg-save-score-row">
                {scoreRow && scoreDelta !== 0 && (
                  <>
                    <span>{scoreWas}%</span>
                    <em aria-hidden="true">→</em>
                  </>
                )}
                <b>{scoreNow}%</b>
              </div>
              <small>
                {scoreDelta !== 0 ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta} points · ` : ''}
                {liveStatus.title}
              </small>
            </div>
            {inputChanges.length ? (
              <>
                <p className="rr-modal-k">What Changed</p>
                <ul className="rg-changes">
                  {inputChanges.map((row) => (
                    <li key={row.label}>
                      <span>{row.label}</span>
                      <b>
                        {row.was} → {row.now}
                      </b>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No inputs changed. Your current goal is saved.</p>
            )}
            <div className="enroll-modal-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate('/', { state: { goalSaved: true } })}>
                Save &amp; Go To Dashboard
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setSavedOpen(false)}>
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

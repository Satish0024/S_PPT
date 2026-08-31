import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Rocket, Scale, ShieldCheck } from 'lucide-react'
import { INVESTMENT_KEY, readSession, writeSession } from '../data/participants'
import { PLAN_FUNDS } from '../data/portfolio'
import { useEscapeToClose } from '../hooks/useEscapeToClose'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { RISK_LEVELS, getRiskLevel, getRiskProfileId } from '../lib/riskProfile'
import FundDetailDialog from '../components/common/FundDetailDialog.jsx'
import '../styles/portfolio.css'

const ENROLL_FUNDS = PLAN_FUNDS.filter((f) => f.cat !== 'Target-Date')
const FUNDS = ENROLL_FUNDS.map((f) => f.name)
const emptyAlloc = () => Object.fromEntries(FUNDS.map((name) => [name, 0]))
const PLAN_ALLOC = {
  'Vanguard 500 Index Fund': 30,
  'Fidelity 500 Index Fund': 30,
  'Vanguard Total Bond Market': 20,
  'Fidelity U.S. Bond Index': 20
}
const PLAN_FUNDS_LIST = ENROLL_FUNDS.filter((f) => PLAN_ALLOC[f.name])
// One preset fund mix per measured risk level — same four-fund lineup as
// PLAN_ALLOC, just weighted toward bonds or equities to match the level's
// stated split (see RISK_LEVELS' insights copy in lib/riskProfile.js).
const RISK_ALLOC = {
  conservative: {
    'Vanguard 500 Index Fund': 15,
    'Fidelity 500 Index Fund': 15,
    'Vanguard Total Bond Market': 35,
    'Fidelity U.S. Bond Index': 35
  },
  moderate: {
    'Vanguard 500 Index Fund': 25,
    'Fidelity 500 Index Fund': 25,
    'Vanguard Total Bond Market': 25,
    'Fidelity U.S. Bond Index': 25
  },
  aggressive: {
    'Vanguard 500 Index Fund': 45,
    'Fidelity 500 Index Fund': 45,
    'Vanguard Total Bond Market': 5,
    'Fidelity U.S. Bond Index': 5
  }
}
const RISK_LEVEL_ICON = { conservative: ShieldCheck, moderate: Scale, aggressive: Rocket }
const riskAlloc = (levelId) => ({ ...emptyAlloc(), ...RISK_ALLOC[levelId] })
const planAlloc = () => ({ ...emptyAlloc(), ...PLAN_ALLOC })
const sumAlloc = (alloc, names = FUNDS) => names.reduce((sum, name) => sum + (+alloc?.[name] || 0), 0)
const SOURCES = [
  { id: 'pre', label: 'Pre-Tax' },
  { id: 'roth', label: 'Roth' }
]
const blankBySource = () => Object.fromEntries(SOURCES.map((s) => [s.id, emptyAlloc()]))
const fillBySource = (alloc) => Object.fromEntries(SOURCES.map((s) => [s.id, { ...alloc }]))
const parsePct = (s) => parseFloat(String(s).replace(/[^0-9.-]/g, '')) || 0
const assetClass = (f) => ((f.cat || '').toLowerCase().includes('bond') ? 'Bond' : 'Equity')
const ASSET_CLASSES = [...new Set(ENROLL_FUNDS.map(assetClass))]
const byPerformance = (a, b) => parsePct(b.y1) - parsePct(a.y1)
const fundsFromNames = (names) =>
  ENROLL_FUNDS.filter((f) => names.includes(f.name)).sort(byPerformance)

const pruneAlloc = (alloc, names) => {
  const next = emptyAlloc()
  names.forEach((name) => {
    next[name] = +alloc?.[name] || 0
  })
  return next
}

export function InvestmentEditor({
  embedded = false,
  saveLabel = 'Continue',
  riskReturnPath = '/enrollment/investments',
  onComplete,
  onCancel
}) {
  const { participant } = useParticipant()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const saved = useMemo(() => readSession(INVESTMENT_KEY), [])
  const [mode, setMode] = useState(() => (embedded ? saved?.mode || 'plan' : ''))
  const [riskLevelId, setRiskLevelId] = useState(() => saved?.riskLevelId || '')
  const [applyAll, setApplyAll] = useState(saved?.applyAll !== false)
  const [bySource, setBySource] = useState(() => ({
    ...blankBySource(),
    ...(saved?.bySource || (embedded ? fillBySource(planAlloc()) : {}))
  }))
  const [picked, setPicked] = useState(() => saved?.picked || [])
  const [error, setError] = useState('')
  const [fundsOpen, setFundsOpen] = useState(false)
  const [riskConsentOpen, setRiskConsentOpen] = useState(false)

  const usingCustom = mode === 'custom'
  const usingPlan = mode === 'plan'
  const usingRisk = mode === 'risk'
  const sharedAlloc = bySource[SOURCES[0].id] || emptyAlloc()
  const customFunds = fundsFromNames(picked)
  const measuredLevel = riskLevelId ? getRiskLevel(riskLevelId) : null

  // Returning from the risk questionnaire (?riskDone=1): read back the level
  // it just measured and apply that level's fund mix, then strip the query
  // param so refreshing this page doesn't re-trigger it.
  useEffect(() => {
    if (params.get('riskDone') !== '1') return
    const levelId = getRiskProfileId(participant)
    setMode('risk')
    setRiskLevelId(levelId)
    setApplyAll(true)
    setBySource(fillBySource(riskAlloc(levelId)))
    setError('')
    navigate(location.pathname, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const setPct = (src, name, val) => {
    const next = Math.max(0, Math.min(100, Math.round(+val || 0)))
    setError('')
    setBySource((prev) => {
      const updated = { ...prev[src], [name]: next }
      if (applyAll) return fillBySource(updated)
      return { ...prev, [src]: updated }
    })
  }

  const choosePlan = () => {
    setMode('plan')
    setApplyAll(true)
    setBySource(fillBySource(planAlloc()))
    setError('')
  }

  const chooseCustom = () => {
    if (mode !== 'custom') {
      setBySource(blankBySource())
      setApplyAll(true)
      setPicked([])
    }
    setMode('custom')
    setFundsOpen('select')
    setError('')
  }

  // Clicking "Not sure? Take our risk questionnaire" (or "Retake
  // questionnaire") asks for confirmation first — only navigates to the
  // questionnaire once the participant agrees to proceed.
  const chooseRisk = () => setRiskConsentOpen(true)
  const confirmChooseRisk = () => {
    setRiskConsentOpen(false)
    const here = `${location.pathname}${location.search}`
    navigate(`/risk-check-in?return=${encodeURIComponent(riskReturnPath || here)}`)
  }

  const toggleApplyAll = () => {
    setError('')
    if (!applyAll) {
      setBySource(fillBySource(sharedAlloc))
      setApplyAll(true)
      return
    }
    setApplyAll(false)
  }

  const applyPicks = (names) => {
    setPicked(names)
    setBySource((prev) => {
      if (applyAll) return fillBySource(pruneAlloc(prev[SOURCES[0].id], names))
      return Object.fromEntries(SOURCES.map((s) => [s.id, pruneAlloc(prev[s.id], names)]))
    })
    setFundsOpen(false)
    setError('')
  }

  const reset = (src) => {
    setError('')
    const next = pruneAlloc({}, picked)
    if (applyAll) setBySource(fillBySource(next))
    else setBySource((prev) => ({ ...prev, [src]: next }))
  }

  const continueStep = () => {
    if (!mode) {
      setError('Choose how you want new contributions invested.')
      return
    }
    if (usingCustom && !picked.length) {
      setError('Select at least one investment before you continue.')
      return
    }
    const names = usingCustom ? picked : FUNDS
    if (usingPlan || usingRisk || applyAll) {
      if (sumAlloc(sharedAlloc, names) !== 100) {
        setError('Allocations must add up to 100% before you continue.')
        return
      }
    } else if (SOURCES.some((s) => sumAlloc(bySource[s.id], names) !== 100)) {
      setError('Each source must add up to 100% before you continue.')
      return
    }
    const savedSources = usingPlan || usingRisk || applyAll ? fillBySource(sharedAlloc) : bySource
    writeSession(INVESTMENT_KEY, {
      mode,
      riskLevelId: usingRisk ? riskLevelId : '',
      applyAll: usingPlan || usingRisk ? true : applyAll,
      picked: usingCustom ? picked : FUNDS.filter((name) => (usingRisk ? RISK_ALLOC[riskLevelId]?.[name] : PLAN_ALLOC[name])),
      alloc: savedSources[SOURCES[0].id],
      bySource: savedSources,
      total: 100
    })
    onComplete?.()
  }

  return (
    <div className={embedded ? 'enroll-embed enroll-simple' : 'detail-body enroll-simple'}>
      <div className="section-top">
        <div>
          <h3 className="section-title">{embedded ? 'Edit investments' : 'Investment election'}</h3>
          <p className="section-sub">Choose how each contribution source is invested. Each source must total 100%.</p>
        </div>
        <button type="button" className="optout-link" onClick={() => setFundsOpen('view')}>
          View plan investments
        </button>
      </div>

      <div className="choice-list" role="radiogroup" aria-label="Investment election">
        <button
          type="button"
          className={`choice${usingPlan ? ' on' : ''}`}
          role="radio"
          aria-checked={usingPlan}
          onClick={choosePlan}
        >
          <span className="choice-dot" aria-hidden="true" />
          <span>
            <b>Use plan-selected investments</b>
            <small>Investments will be made in the plan&apos;s default selection unless preferred investments are selected.</small>
          </span>
        </button>
        <button
          type="button"
          className={`choice${usingCustom ? ' on' : ''}`}
          role="radio"
          aria-checked={usingCustom}
          onClick={chooseCustom}
        >
          <span className="choice-dot" aria-hidden="true" />
          <span>
            <b>Select my own investments</b>
            <small>Select preferred investments and set the allocation.</small>
          </span>
        </button>
        <button
          type="button"
          className={`choice${usingRisk ? ' on' : ''}`}
          role="radio"
          aria-checked={usingRisk}
          onClick={chooseRisk}
        >
          <span className="choice-dot" aria-hidden="true" />
          <span>
            <b>Not sure? Take our risk questionnaire</b>
            <small>
              {measuredLevel
                ? `Matched to ${measuredLevel.label} — retake to change it.`
                : "A few quick questions match you to a Conservative, Moderate, or Aggressive mix."}
            </small>
          </span>
        </button>
      </div>

      {usingPlan && (
        <div className="inv-panel">
          <AllocPanel title="All sources" funds={PLAN_FUNDS_LIST} alloc={sharedAlloc} locked />
        </div>
      )}

      {usingRisk && measuredLevel && (
        <div className="inv-panel">
          <div className="inv-risk-badge" style={{ '--risk-color': measuredLevel.color }}>
            {(() => {
              const Icon = RISK_LEVEL_ICON[measuredLevel.id]
              return <Icon size={16} strokeWidth={2.2} />
            })()}
            <span>{measuredLevel.label}</span>
            <button type="button" className="text-btn" onClick={chooseRisk}>
              Retake questionnaire
            </button>
          </div>
          <AllocPanel
            title="All sources"
            funds={fundsFromNames(FUNDS.filter((name) => RISK_ALLOC[measuredLevel.id]?.[name] > 0))}
            alloc={sharedAlloc}
            locked
          />
        </div>
      )}

      {usingCustom && (
        <div className="inv-panel">
          <div className="inv-toolbar">
            <button type="button" className="text-btn" onClick={() => setFundsOpen('select')}>
              {picked.length ? 'Add or edit investments' : 'Add investments'}
            </button>
            <label className={`inv-toggle${applyAll ? ' on' : ''}`}>
              <input type="checkbox" checked={applyAll} onChange={toggleApplyAll} />
              <span className="switch" aria-hidden="true" />
              Apply to all sources
            </label>
          </div>
          {!picked.length ? (
            <div className="inv-empty">
              <p>Select investments, then set each percent so the total is 100%.</p>
              <button type="button" className="btn btn-primary" onClick={() => setFundsOpen('select')}>
                Select investments
              </button>
            </div>
          ) : applyAll ? (
            <AllocPanel
              title="All sources"
              funds={customFunds}
              alloc={sharedAlloc}
              showReset
              onChange={(name, val) => setPct(SOURCES[0].id, name, val)}
              onReset={() => reset(SOURCES[0].id)}
            />
          ) : (
            <div className="inv-stack">
              {SOURCES.map((s) => (
                <AllocPanel
                  key={s.id}
                  title={s.label}
                  funds={customFunds}
                  alloc={bySource[s.id]}
                  showReset
                  onChange={(name, val) => setPct(s.id, name, val)}
                  onReset={() => reset(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="enroll-error" role="alert">{error}</p>}

      <div className="enroll-nav">
        {onCancel && (
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="btn btn-primary" type="button" onClick={continueStep}>
          {saveLabel}
        </button>
      </div>

      {fundsOpen && (
        <FundsModal
          selectable={fundsOpen === 'select'}
          selected={picked}
          onApply={applyPicks}
          onClose={() => setFundsOpen(false)}
        />
      )}

      {riskConsentOpen && (
        <div className="enroll-modal-bg" role="presentation" onClick={() => setRiskConsentOpen(false)}>
          <div
            className="enroll-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="risk-consent-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="risk-consent-title">Consent to take the risk questionnaire</h4>
            <p>
              A few quick questions will match you to a Conservative, Moderate, or Aggressive investment style, and
              set your election to that mix. Do you consent to continue?
            </p>
            <div className="enroll-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setRiskConsentOpen(false)}>
                Decline
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmChooseRisk}>
                I consent, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AllocPanel({ title, funds, alloc, locked, showReset, onChange, onReset }) {
  const names = funds.map((f) => f.name)
  const total = sumAlloc(alloc, names)
  const [openFund, setOpenFund] = useState(null)
  return (
    <div className="inv-form">
      {title && <h4 className="inv-source-title">{title}</h4>}
      <div className="fund-list-head inv-col-head">
        <span>Investment</span>
        <span>Election Percentage</span>
      </div>
      <div className={`enroll-form${locked ? ' locked' : ''}`}>
        {funds.map((f) => (
          <div className="source" key={f.name}>
            <div className="srow">
              <span className="smeta">
                <button type="button" className="fund-link sname" onClick={() => setOpenFund(f)}>
                  {f.name}
                </button>
                <span className="shelp">{f.cat}</span>
              </span>
              <span className="sval">
                <input
                  type="number"
                  value={alloc[f.name] ?? 0}
                  min={0}
                  max={100}
                  readOnly={locked}
                  disabled={locked}
                  onChange={(e) => onChange?.(f.name, e.target.value)}
                />
                <span className="pct">%</span>
              </span>
            </div>
          </div>
        ))}
        <div className={`totalbar${total === 100 ? ' ok' : ''}`}>
          {showReset ? (
            <button type="button" className="text-btn" onClick={onReset}>
              Reset
            </button>
          ) : (
            <span />
          )}
          <span className="tval-wrap">
            <span>Total</span>
            <span className="tval">{total}%</span>
          </span>
        </div>
      </div>
      {openFund && (
        <FundDetailDialog
          name={openFund.name}
          onClose={() => setOpenFund(null)}
          fields={[
            { label: 'Category', value: openFund.cat },
            { label: 'Return YTD', value: openFund.ytd },
            { label: '1 yr. return', value: openFund.y1 },
            { label: '5 yr. return', value: openFund.y5 },
            { label: '10 yr. return', value: openFund.y10 },
            { label: 'Total annual operating expenses', value: openFund.exp }
          ]}
        />
      )}
    </div>
  )
}

function FundsModal({ selectable, selected, onApply, onClose }) {
  const [query, setQuery] = useState('')
  const [asset, setAsset] = useState('all')
  const [picks, setPicks] = useState(() => selected || [])
  const [modalError, setModalError] = useState('')
  useEscapeToClose(true, onClose)
  const funds = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ENROLL_FUNDS.filter((f) => {
      if (asset !== 'all' && assetClass(f) !== asset) return false
      if (q && !f.name.toLowerCase().includes(q)) return false
      return true
    }).sort(byPerformance)
  }, [query, asset])

  const toggle = (name) => {
    setModalError('')
    setPicks((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  const apply = () => {
    if (!picks.length) {
      setModalError('Select at least one investment to apply.')
      return
    }
    onApply(picks)
  }

  return (
    <div className="enroll-modal-bg" role="presentation" onClick={onClose}>
      <div
        className="enroll-modal funds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="funds-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="review-h">
          <h4 id="funds-title">{selectable ? 'Select investments' : 'Plan investments'}</h4>
          <button type="button" className="text-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="funds-filters">
          <label className="funds-field search">
            Search
            <input
              type="search"
              placeholder="Investment name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="funds-field asset">
            Asset class
            <select value={asset} onChange={(e) => setAsset(e.target.value)}>
              <option value="all">All asset classes</option>
              {ASSET_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          Sorted by highest 1-year return.
          {selectable ? ' Check the investments you want, then apply them to your allocation.' : ' Compare performance, expenses, and fees.'}
        </p>
        <div className="table-wrap">
          <table className="plan-table">
            <thead>
              <tr>
                {selectable && (
                  <th scope="col" className="check-col" rowSpan={2}>
                    <span className="sr-only">Select</span>
                  </th>
                )}
                <th scope="col" className="fund-col" rowSpan={2}>
                  Fund name / category
                </th>
                <th scope="col" rowSpan={2}>
                  Return YTD
                </th>
                <th scope="col" className="group-h" colSpan={4}>
                  Average annual total return
                </th>
                <th scope="col" className="group-h" colSpan={2}>
                  Total annual operating expenses
                </th>
                <th scope="col" rowSpan={2}>
                  Shareholder-
                  <br />
                  type fees
                </th>
              </tr>
              <tr>
                <th scope="col" className="sub-h">1 yr.</th>
                <th scope="col" className="sub-h">5 yr.</th>
                <th scope="col" className="sub-h">10 yr.</th>
                <th scope="col" className="sub-h">Since inception</th>
                <th scope="col" className="sub-h">As a %</th>
                <th scope="col" className="sub-h">Per $1,000</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((f) => {
                const on = picks.includes(f.name)
                return (
                  <Fragment key={f.name}>
                    <tr
                      className={`fund-row${selectable ? ' pickable' : ''}${on ? ' on' : ''}`}
                      onClick={selectable ? () => toggle(f.name) : undefined}
                    >
                      {selectable && (
                        <td className="check-col">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(f.name)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${f.name}`}
                          />
                        </td>
                      )}
                      <td className="fund-cell">
                        <div className="fund-title">{f.name}</div>
                        <div className="fund-meta">
                          <span className="fund-cat">{f.cat}</span>
                        </div>
                      </td>
                      <td>{f.ytd}</td>
                      <td>{f.y1}</td>
                      <td>{f.y5}</td>
                      <td>{f.y10}</td>
                      <td>{f.si}</td>
                      <td>{f.exp}</td>
                      <td>{f.perK}</td>
                      <td>{f.fees}</td>
                    </tr>
                    <tr className="bench-row group-end">
                      {selectable && <td className="check-col" />}
                      <td className="fund-cell">
                        <div className="fund-title">{f.bench}</div>
                      </td>
                      {f.b.map((v, i) => (
                        <td key={`${f.name}-b-${i}`}>{v}</td>
                      ))}
                      <td>—</td>
                      <td>—</td>
                      <td>N/A</td>
                    </tr>
                  </Fragment>
                )
              })}
              {!funds.length && (
                <tr>
                  <td colSpan={selectable ? 10 : 9}>No investments match this search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selectable && (
          <div className="funds-modal-foot">
            <span className="funds-count">
              {picks.length} selected
              {modalError ? ` · ${modalError}` : ''}
            </span>
            <div className="enroll-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={apply}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Investments() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo =
    params.get('return')?.startsWith('/') && !params.get('return')?.startsWith('//') ? params.get('return') : ''
  return (
    <InvestmentEditor
      saveLabel={returnTo ? 'Save changes' : 'Continue'}
      onComplete={() => navigate(returnTo || '/enrollment/summary')}
      onCancel={() => navigate(returnTo || '/')}
    />
  )
}

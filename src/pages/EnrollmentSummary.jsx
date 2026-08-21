import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AUTO_INCREASE_KEY,
  BENEFICIARY_KEY,
  DEFERRAL_KEY,
  INVESTMENT_KEY,
  readSession,
  writeSession
} from '../data/participants'

const CYCLES = {
  calendar: { title: 'Calendar Year', next: 'January 1, 2027' },
  participant: { title: 'Plan Participant Date', next: 'August 15, 2027' },
  planyear: { title: 'Plan Year', next: 'April 1, 2027' }
}
const SALARY = 85000
const PERIODS = 26
const RELATIONS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Trust', 'Other']
const SOURCE_LABEL = { pre: 'Pre-Tax', roth: 'Roth' }

const pct = (n) => Math.round((+n || 0) * 10) / 10 + '%'
const payFromPct = (rate) => Math.round((SALARY * (+rate || 0)) / 100 / PERIODS)
const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fundRows = (alloc) => Object.entries(alloc || {}).filter(([, v]) => +v > 0)
const blankBene = () => ({ name: '', relationship: 'Spouse', share: 100 })

export default function EnrollmentSummary() {
  const navigate = useNavigate()
  const deferral = useMemo(() => readSession(DEFERRAL_KEY), [])
  const autoInc = useMemo(() => readSession(AUTO_INCREASE_KEY), [])
  const investment = useMemo(() => readSession(INVESTMENT_KEY), [])

  const [done, setDone] = useState(false)
  const [showBene, setShowBene] = useState(false)
  const [beneSaved, setBeneSaved] = useState(false)

  const optedOut = !!(deferral?.optedOut || deferral?.mode === 'optout')
  const skippedAi = optedOut || autoInc?.skipped || autoInc?.mode !== 'do'
  const applyAll = investment?.applyAll !== false
  const cycle = CYCLES[autoInc?.cycle] || CYCLES.calendar
  const usingPlan = investment?.mode === 'plan'

  const confirm = () => setDone(true)
  const goHome = () => navigate('/', { replace: true })

  return (
    <div className="detail-body enroll-simple">
      <div className="summary-page">
        <h3 className="section-title">Review And Confirm</h3>
        <p className="section-sub">Check each election, then confirm to finish enrollment.</p>

        <article className="review-card">
          <div className="review-h">
            <div className="review-title">
              <h4>Deferral</h4>
              <small>{optedOut ? 'No Paycheck Deferral' : 'From Each Paycheck'}</small>
            </div>
            <button type="button" className="text-btn" onClick={() => navigate('/enrollment')}>
              Edit
            </button>
          </div>
          {optedOut ? (
            <p>You opted out of contributing from your paycheck.</p>
          ) : (
            <ul className="review-rows">
              <li>
                <span>Pre-Tax</span>
                <b>
                  {pct(deferral?.pre)}
                  <small>{money(payFromPct(deferral?.pre))}</small>
                </b>
              </li>
              <li>
                <span>Roth</span>
                <b>
                  {pct(deferral?.roth)}
                  <small>{money(payFromPct(deferral?.roth))}</small>
                </b>
              </li>
            </ul>
          )}
        </article>

        <article className="review-card">
          <div className="review-h">
            <div className="review-title">
              <h4>Auto Increase</h4>
              <small>{skippedAi ? 'Not Turned On' : cycle.title}</small>
            </div>
            <button type="button" className="text-btn" onClick={() => navigate('/enrollment')}>
              Edit
            </button>
          </div>
          {skippedAi ? (
            <p>Your deferral rate will stay where you set it unless you change it later.</p>
          ) : (
            <ul className="review-rows">
              <li>
                <span>Next Increase</span>
                <b>{cycle.next}</b>
              </li>
              <li>
                <span>Pre-Tax</span>
                <b>
                  +{pct(autoInc?.incPre ?? autoInc?.inc)}
                  <small>until {pct(autoInc?.capPre ?? autoInc?.cap)}</small>
                </b>
              </li>
              <li>
                <span>Roth</span>
                <b>
                  +{pct(autoInc?.incRoth ?? autoInc?.inc)}
                  <small>until {pct(autoInc?.capRoth ?? autoInc?.cap)}</small>
                </b>
              </li>
            </ul>
          )}
        </article>

        <article className="review-card">
          <div className="review-h">
            <div className="review-title">
              <h4>Investments</h4>
              <small>
                {usingPlan ? 'Plan Investments' : 'Your Selection'}
                {applyAll ? ' · Same For All Sources' : ' · By Source'}
              </small>
            </div>
            <button type="button" className="text-btn" onClick={() => navigate('/enrollment/investments')}>
              Edit
            </button>
          </div>
          {applyAll ? (
            <FundList alloc={investment?.bySource?.pre || investment?.alloc} />
          ) : (
            <div className="review-sources">
              {['pre', 'roth'].map((src) => (
                <div key={src}>
                  <h5>{SOURCE_LABEL[src]}</h5>
                  <FundList alloc={investment?.bySource?.[src]} />
                </div>
              ))}
            </div>
          )}
        </article>

        <p className="summary-note">You can change these elections later from your account.</p>
        <div className="enroll-nav">
          <button className="btn btn-primary" type="button" onClick={confirm}>
            Confirm Enrollment
          </button>
        </div>
      </div>

      {done && (
        <div className="enroll-modal-bg success-bg" role="presentation">
          <div
            className={`enroll-modal success-modal${showBene ? ' wide' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <div className="enroll-success">
              <div className="success-burst" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="success-mark" aria-hidden="true">
                <svg viewBox="0 0 52 52">
                  <circle className="success-ring" cx="26" cy="26" r="24" />
                  <path className="success-check" d="M15.5 27.2l7.2 7.2 14.6-16" />
                </svg>
              </div>
              <h3 id="success-title">You&apos;re Enrolled</h3>
              <p className="success-lead">
                Your 401(k) elections are saved. Add a beneficiary next so your account has a named recipient.
              </p>

              {beneSaved ? (
                <div className="success-note">
                  <b>Beneficiary Saved.</b>
                  <span>You can update this anytime from Profile.</span>
                </div>
              ) : showBene ? (
                <BeneficiaryForm
                  onSaved={() => {
                    setBeneSaved(true)
                    setShowBene(false)
                  }}
                  onCancel={() => setShowBene(false)}
                />
              ) : (
                <div className="success-next">
                  <div>
                    <b>Add A Beneficiary</b>
                    <span>Recommended so your account can pass to someone you choose.</span>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => setShowBene(true)}>
                    Add Beneficiary
                  </button>
                </div>
              )}

              <div className="success-actions">
                {beneSaved ? (
                  <button type="button" className="btn btn-primary" onClick={goHome}>
                    Go To Dashboard
                  </button>
                ) : showBene ? null : (
                  <button type="button" className="btn btn-ghost" onClick={goHome}>
                    I&apos;ll Do This Later
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FundList({ alloc }) {
  const rows = fundRows(alloc)
  if (!rows.length) return <p>No funds selected yet.</p>
  return (
    <ul className="review-funds">
      {rows.map(([name, share]) => (
        <li key={name}>
          <span>{name}</span>
          <b>{pct(share)}</b>
        </li>
      ))}
    </ul>
  )
}

function BeneficiaryForm({ onSaved, onCancel }) {
  const [rows, setRows] = useState([blankBene()])
  const [error, setError] = useState('')
  const total = rows.reduce((sum, r) => sum + (+r.share || 0), 0)

  const update = (i, key, val) => {
    setError('')
    setRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)))
  }

  const save = () => {
    if (rows.some((r) => !r.name.trim())) {
      setError('Enter a name for each beneficiary.')
      return
    }
    if (total !== 100) {
      setError('Shares must add up to 100%.')
      return
    }
    writeSession(BENEFICIARY_KEY, { rows, total })
    onSaved()
  }

  return (
    <div className="success-form">
      {rows.map((row, i) => (
        <div className="bene-row" key={i}>
          <label>
            Full Name
            <input
              type="text"
              value={row.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="First And Last Name"
            />
          </label>
          <label>
            Relationship
            <select value={row.relationship} onChange={(e) => update(i, 'relationship', e.target.value)}>
              {RELATIONS.map((rel) => (
                <option key={rel}>{rel}</option>
              ))}
            </select>
          </label>
          <label>
            Share
            <span className="sval">
              <input
                type="number"
                min={0}
                max={100}
                value={row.share}
                onChange={(e) => update(i, 'share', Math.max(0, Math.min(100, Math.round(+e.target.value || 0))))}
              />
              <span className="pct">%</span>
            </span>
          </label>
        </div>
      ))}
      {error && <p className="enroll-error">{error}</p>}
      <div className="success-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={save}>
          Save Beneficiary
        </button>
      </div>
    </div>
  )
}

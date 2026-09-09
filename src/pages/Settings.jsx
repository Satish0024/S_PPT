import { useState } from 'react'
import { Sun, Moon, Monitor, Lock, CircleCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { ProfileBlock, TextField } from '../components/profile/ProfileFields.jsx'
import Toast from '../components/common/Toast.jsx'

// Keeping this intentionally small: an app-level Settings page for a
// participant portal only needs to cover things the app itself controls
// (how it looks, how you sign in) -- not a place to collect every
// possible toggle. Personal/employment/bank/beneficiary details already
// have their own home on the Profile page and stay there.
const APPEARANCE_OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Match device', icon: Monitor }
]

const NOTIFICATIONS_KEY = 'saturnaNotificationPrefs'

function loadNotificationPrefs(participantId) {
  try {
    const all = JSON.parse(sessionStorage.getItem(NOTIFICATIONS_KEY) || '{}')
    return { transactionAlerts: true, statementReady: true, ...(all[participantId] || {}) }
  } catch {
    return { transactionAlerts: true, statementReady: true }
  }
}

function saveNotificationPrefs(participantId, prefs) {
  try {
    const all = JSON.parse(sessionStorage.getItem(NOTIFICATIONS_KEY) || '{}')
    all[participantId] = prefs
    sessionStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all))
  } catch {
    /* private mode / storage unavailable -- prefs just don't persist this session */
  }
}

function NotificationRow({ label, hint, checked, onChange }) {
  return (
    <label className="settings-toggle-row">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <b>{label}</b>
        {hint}
      </span>
    </label>
  )
}

export default function Settings() {
  const { preference, setPreference } = useTheme()
  const { participant } = useParticipant()
  const [prefs, setPrefs] = useState(() => loadNotificationPrefs(participant.id))
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [toast, setToast] = useState(null)

  const updatePref = (key, value) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    saveNotificationPrefs(participant.id, next)
  }

  const submitPassword = (e) => {
    e.preventDefault()
    setPwSaved(false)
    if (!pw.current || !pw.next || !pw.confirm) {
      setPwError('Fill in all three fields.')
      return
    }
    if (pw.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pw.next !== pw.confirm) {
      setPwError("New password and confirmation don't match.")
      return
    }
    setPwError('')
    setPwSaved(true)
    setPw({ current: '', next: '', confirm: '' })
    setToast({ id: Date.now(), message: 'Password updated.', tone: 'success' })
  }

  return (
    <div className="page-body settings-page">
      <div className="hi-bar">
        <div>
          <h1>Settings</h1>
          <p className="pr-intro">Manage how the app looks, sign-in, and notifications.</p>
        </div>
      </div>

      <div className="settings-shell">
        <ProfileBlock title="Appearance">
          <p className="settings-block-lede">Choose how the participant portal looks on this device.</p>
          <div className="settings-appearance-options" role="radiogroup" aria-label="Appearance">
            {APPEARANCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={preference === opt.id}
                className={`settings-appearance-opt${preference === opt.id ? ' on' : ''}`}
                onClick={() => setPreference(opt.id)}
              >
                <opt.icon size={18} strokeWidth={2} />
                {opt.label}
              </button>
            ))}
          </div>
        </ProfileBlock>

        <ProfileBlock title="Notifications">
          <p className="settings-block-lede">Choose what Saturna emails you about.</p>
          <NotificationRow
            label="Transaction confirmations"
            hint="Get an email when a deferral, loan, or transfer request is submitted or processed."
            checked={prefs.transactionAlerts}
            onChange={(v) => updatePref('transactionAlerts', v)}
          />
          <NotificationRow
            label="Statement ready"
            hint="Get an email when a new periodic statement is available to download."
            checked={prefs.statementReady}
            onChange={(v) => updatePref('statementReady', v)}
          />
        </ProfileBlock>

        <ProfileBlock title="Login &amp; security">
          <p className="settings-block-lede">Update the password you use to sign in.</p>
          <form className="pr-form" onSubmit={submitPassword}>
            <TextField
              label="Current password"
              type="password"
              value={pw.current}
              onChange={(v) => setPw((p) => ({ ...p, current: v }))}
              required
              wide
            />
            <TextField
              label="New password"
              type="password"
              value={pw.next}
              onChange={(v) => setPw((p) => ({ ...p, next: v }))}
              required
              hint="At least 8 characters."
              wide
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={pw.confirm}
              onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
              required
              wide
            />
            {pwError && <p className="settings-pw-error">{pwError}</p>}
            {pwSaved && (
              <p className="settings-pw-saved">
                <CircleCheck size={15} strokeWidth={2} /> Password updated.
              </p>
            )}
            <button type="submit" className="btn btn-primary settings-pw-submit">
              <Lock size={14} strokeWidth={2} /> Update password
            </button>
          </form>
        </ProfileBlock>
      </div>
      <Toast key={toast?.id} message={toast?.message || ''} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  )
}

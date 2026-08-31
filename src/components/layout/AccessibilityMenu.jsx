import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Accessibility,
  Contrast,
  Eye,
  Image,
  Link2,
  Mic,
  MousePointer2,
  PauseCircle,
  RotateCcw,
  Type,
  Volume2
} from 'lucide-react'
import { PROFILES, useAccessibility } from '../../context/AccessibilityContext.jsx'
import { useReadAloud, useVoiceNav } from '../../hooks/useSpeech.js'

const FONT_SCALE_LABELS = ['Normal', 'Large', 'Larger', 'Largest']

// Each row is a plain checkbox rendered as a toggle switch — same semantics
// as a native checkbox (Space to toggle, announced as checked/unchecked by
// every screen reader) rather than a custom div that would need its own
// aria-checked/keyboard wiring to match.
function ToggleRow({ icon: Icon, label, hint, checked, onChange }) {
  return (
    <label className="a11y-row">
      <span className="a11y-row-ico" aria-hidden="true">
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className="a11y-row-copy">
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <span className="a11y-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="a11y-switch-track" aria-hidden="true" />
      </span>
    </label>
  )
}

export default function AccessibilityMenu() {
  const { settings, toggle, cycleFontScale, reset, applyProfile, isActive } = useAccessibility()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const navigate = useNavigate()
  const readAloud = useReadAloud()
  const voiceNav = useVoiceNav(navigate)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Voice nav keeps listening across a panel close (it's meant to work
  // hands-free while browsing) — but read-aloud and the mic should both
  // stop if the participant navigates away entirely.
  useEffect(() => {
    return () => {
      readAloud.stop()
      voiceNav.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="a11y-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`icon-btn a11y-toggle${isActive || voiceNav.listening ? ' on' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Accessibility options"
        title="Accessibility options"
        onClick={() => setOpen((v) => !v)}
      >
        <Accessibility size={19} strokeWidth={2.1} />
      </button>

      {open && (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility options">
          <div className="a11y-panel-head">
            <span>
              <Accessibility size={16} strokeWidth={2.2} aria-hidden="true" />
              Accessibility
            </span>
            <button type="button" className="a11y-reset" onClick={reset} disabled={!isActive}>
              <RotateCcw size={13} strokeWidth={2.2} aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="a11y-section">
            <span className="a11y-section-label">Accessibility profiles</span>
            <div className="a11y-profiles">
              {PROFILES.map((p) => (
                <button key={p.id} type="button" className="a11y-profile" onClick={() => applyProfile(p.id)}>
                  <b>{p.label}</b>
                  <small>{p.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="a11y-section">
            <span className="a11y-section-label">Voice &amp; reading</span>

            <button
              type="button"
              className={`a11y-row a11y-row-btn${readAloud.speaking ? ' a11y-row-live' : ''}`}
              onClick={readAloud.speaking ? readAloud.stop : readAloud.speakPage}
              disabled={!readAloud.supported}
            >
              <span className="a11y-row-ico" aria-hidden="true">
                <Volume2 size={17} strokeWidth={2} />
              </span>
              <span className="a11y-row-copy">
                <b>Screen reader</b>
                <small>
                  {readAloud.supported
                    ? readAloud.speaking
                      ? 'Reading this page — tap to stop'
                      : 'Read this page aloud'
                    : 'Not supported in this browser'}
                </small>
              </span>
              <span className="a11y-row-value">{readAloud.speaking ? 'Stop' : 'Read'}</span>
            </button>

            <button
              type="button"
              className={`a11y-row a11y-row-btn${voiceNav.listening ? ' a11y-row-live' : ''}`}
              onClick={voiceNav.listening ? voiceNav.stop : voiceNav.start}
              disabled={!voiceNav.supported}
            >
              <span className="a11y-row-ico" aria-hidden="true">
                <Mic size={17} strokeWidth={2} />
              </span>
              <span className="a11y-row-copy">
                <b>Voice navigation</b>
                <small>
                  {!voiceNav.supported
                    ? 'Not supported in this browser'
                    : voiceNav.listening
                      ? voiceNav.lastHeard
                        ? `Heard: "${voiceNav.lastHeard}"`
                        : 'Listening — say a page name'
                      : 'Say "Dashboard", "Portfolio", "Transactions"...'}
                </small>
              </span>
              <span className="a11y-row-value">{voiceNav.listening ? 'On' : 'Off'}</span>
            </button>
          </div>

          <div className="a11y-section">
            <span className="a11y-section-label">Display</span>

            <button type="button" className="a11y-row a11y-row-btn" onClick={cycleFontScale}>
              <span className="a11y-row-ico" aria-hidden="true">
                <Type size={17} strokeWidth={2} />
              </span>
              <span className="a11y-row-copy">
                <b>Bigger text</b>
                <small>Tap to cycle text size</small>
              </span>
              <span className="a11y-row-value">{FONT_SCALE_LABELS[settings.fontScaleIndex]}</span>
            </button>

            <ToggleRow
              icon={Contrast}
              label="High contrast"
              hint="Stronger text/background contrast"
              checked={settings.highContrast}
              onChange={() => toggle('highContrast')}
            />
            <ToggleRow
              icon={Type}
              label="Text spacing"
              hint="More room between lines and letters"
              checked={settings.textSpacing}
              onChange={() => toggle('textSpacing')}
            />
            <ToggleRow
              icon={Link2}
              label="Highlight links"
              hint="Underline every link on the page"
              checked={settings.highlightLinks}
              onChange={() => toggle('highlightLinks')}
            />
            <ToggleRow
              icon={PauseCircle}
              label="Pause animations"
              hint="Stop motion and auto-playing effects"
              checked={settings.pauseAnimations}
              onChange={() => toggle('pauseAnimations')}
            />
            <ToggleRow
              icon={Image}
              label="Hide images"
              hint="Reduce visual clutter, keep layout"
              checked={settings.hideImages}
              onChange={() => toggle('hideImages')}
            />
            <ToggleRow
              icon={Eye}
              label="Dyslexia-friendly font"
              hint="Switch to a more legible typeface"
              checked={settings.dyslexiaFont}
              onChange={() => toggle('dyslexiaFont')}
            />
            <ToggleRow
              icon={MousePointer2}
              label="Bigger cursor"
              hint="Larger, higher-contrast cursor"
              checked={settings.bigCursor}
              onChange={() => toggle('bigCursor')}
            />
          </div>

          <p className="a11y-panel-foot">
            Display settings are saved on this device. Voice features run only while this tab is open and never send
            audio anywhere.
          </p>
        </div>
      )}
    </div>
  )
}

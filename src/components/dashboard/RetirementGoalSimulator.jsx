export default function RetirementGoalSimulator({ variant = 'default' }) {
  const grey = variant === 'grey'
  return (
    <section className={`rr-card${grey ? ' grey' : ''}`} aria-label="Retirement Readiness">
      <div className="rr-head">
        <div className="rr-copy">
          <h3>Retirement Readiness</h3>
          <p>See how your inputs affect your savings, income, risk.</p>
        </div>
        <svg className="rr-art" viewBox="0 0 88 56" aria-hidden="true">
          <circle cx="70" cy="12" r="8" fill="#f4c430" />
          <path d="M8 56c8-18 22-28 40-28 10 0 18 3 24 8v20H8z" fill="#3cbc82" />
          <path d="M52 36c0-10 8-16 12-16 2 0 4 1 5 3-6 2-10 8-10 16v4h-7v-7z" fill="#4a63c7" />
          <rect x="63" y="36" width="2" height="16" fill="#1f2268" />
          <circle cx="44" cy="44" r="4" fill="#1f2268" />
          <ellipse cx="52" cy="48" rx="6" ry="3.5" fill="#2e3192" />
        </svg>
      </div>
      <div className="rr-body">
        <div className="rr-donut" aria-hidden="true">
          <span className="rr-score">83%</span>
        </div>
        <div className="rr-facts">
          <div className="rr-exp">
            Expected Expense<b>$1,328,857.15</b>
          </div>
          <div className="rr-row income">
            <span className="dot" /> All Income <span className="amt">$1,102,951.43</span>
          </div>
          <div className="rr-row short">
            <span className="dot" /> Shortfall <span className="amt">$225,905.72</span>
          </div>
        </div>
      </div>
      <div className="rr-foot">
        *Not guaranteed results · <a href="#">Read More</a>
      </div>
    </section>
  )
}

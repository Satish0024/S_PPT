import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Clock, DollarSign, Search, TrendingUp } from 'lucide-react'
import '../styles/enrich.css'

const ARTICLES = [
  { id: 1, tag: 'Plan Basics', tone: 't1', title: 'Understanding Your 401(k)', body: 'How deferrals, employer match, and vesting work together in your Saturna plan.', time: '5 Min Read', icon: BookOpen },
  { id: 2, tag: 'Taxes', tone: 't2', title: 'Pre-Tax Vs Roth Deferrals', body: 'Compare contribution sources and when each option may make sense for you.', time: '4 Min Read', icon: DollarSign },
  { id: 3, tag: 'Investing', tone: 't3', title: 'Investment Basics', body: 'Asset classes, target-date funds, and why diversification matters.', time: '6 Min Read', icon: TrendingUp },
  { id: 4, tag: 'Retirement', tone: 't4', title: 'Planning For Retirement', body: 'Estimate savings needs and set realistic goals for your timeline.', time: '7 Min Read', icon: Clock }
]

const CATS = ['All Topics', 'Plan Basics', 'Taxes', 'Investing', 'Retirement']

export default function Enrich() {
  const [cat, setCat] = useState('All Topics')
  const [q, setQ] = useState('')
  const items = useMemo(
    () =>
      ARTICLES.filter((a) => (cat === 'All Topics' || a.tag === cat) && `${a.title} ${a.body} ${a.tag}`.toLowerCase().includes(q.toLowerCase())),
    [cat, q]
  )

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src="/saturna_logo.png" alt="Saturna Capital" />
        </div>
        <Link className="back" to="/">
          <ArrowLeft size={16} strokeWidth={2.2} />
          Back to dashboard
        </Link>
      </header>
      <main className="page">
        <div className="page-intro">
          <div className="eyebrow">Enrich</div>
          <h1>Financial wellness library</h1>
          <p>Guides and short lessons to help you make confident decisions about your plan and retirement.</p>
        </div>
        <div className="search-bar">
          <Search size={18} strokeWidth={2} />
          <input
            type="search"
            placeholder="Search Topics, Articles, And Tools…"
            aria-label="Search Enrich"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <a className="featured" href="#">
          <div className="f-visual">
            <div className="bg" />
            <div>
              <div className="label">Featured path</div>
              <h2>Getting Started With Your 401(k)</h2>
            </div>
          </div>
          <div className="f-body">
            <p>A 4-part guide covering enrollment, deferral sources, employer match, and your first investment election.</p>
            <div className="f-meta">
              <span>
                <BookOpen size={14} strokeWidth={2} /> 4 articles
              </span>
              <span>
                <Clock size={14} strokeWidth={2} /> ~12 min
              </span>
            </div>
            <span className="btn-go">
              Start path
              <ArrowRight size={16} strokeWidth={2.2} />
            </span>
          </div>
        </a>
        <div className="section-label">Browse by topic</div>
        <div className="cats" role="tablist">
          {CATS.map((c) => (
            <button key={c} type="button" className={`cat${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid">
          {items.map((a) => {
            const Icon = a.icon
            return (
              <a className={`card ${a.tone}`} href="#" key={a.id}>
                <div className="thumb">
                  <div className="t-bg" />
                  <div className="t-ico" aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                </div>
                <div className="c-body">
                  <div className="tag">{a.tag}</div>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                  <div className="foot">
                    <span className="time">{a.time}</span>
                    <span className="link">Read →</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </main>
    </>
  )
}

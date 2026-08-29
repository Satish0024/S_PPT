import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Clock, Search } from 'lucide-react'
import { BRAND } from '../config/brand.js'
import { useTheme } from '../context/ThemeContext.jsx'
import { ARTICLES, CATS } from '../data/learning.js'
import '../styles/enrich.css'

export default function Enrich() {
  const [cat, setCat] = useState('All Topics')
  const [q, setQ] = useState('')
  const { theme } = useTheme()
  const items = useMemo(
    () =>
      ARTICLES.filter((a) => (cat === 'All Topics' || a.tag === cat) && `${a.title} ${a.body} ${a.tag}`.toLowerCase().includes(q.toLowerCase())),
    [cat, q]
  )

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src={theme === 'dark' ? BRAND.logoOnDark || BRAND.logo : BRAND.logo} alt={BRAND.name} />
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

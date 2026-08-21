import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { PLAN_DOCS, STATEMENTS } from '../data/documents.js'

const FILTERS = ['All', 'Statements', 'Plan Documents', 'Tax Documents', 'Notices']

function category(type) {
  if (type === 'Statement' || type === 'Loan Document') return 'Statements'
  if (type === 'Plan Document') return 'Plan Documents'
  if (type === 'Tax Document') return 'Tax Documents'
  return 'Notices'
}

export default function Reports() {
  const { participant } = useParticipant()
  const [filter, setFilter] = useState('All')
  const docs = useMemo(() => {
    const personal = STATEMENTS[participant.id] || []
    const all = [...personal, ...PLAN_DOCS]
    if (filter === 'All') return all
    return all.filter((d) => category(d.type) === filter)
  }, [participant, filter])

  return (
    <div className="page-body">
      <div className="hi-bar">
        <h1>Reports & Documents</h1>
      </div>
      <section className="panel tx-page">
        <div className="tx-toolbar">
          <div className="tx-filters" role="tablist" aria-label="Document type">
            {FILTERS.map((f) => (
              <button key={f} type="button" className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {!docs.length ? (
          <div className="tx-empty">No documents in this category.</div>
        ) : (
          <div className="doc-list">
            {docs.map((d) => (
              <article className="doc-row" key={d.id}>
                <span className="doc-ico" aria-hidden="true">
                  <FileText size={18} strokeWidth={2} />
                </span>
                <div className="doc-copy">
                  <h3>{d.name}</h3>
                  <p>
                    {d.type} · {d.plan}
                  </p>
                </div>
                <span className="doc-date">{d.date}</span>
                <button type="button" className="doc-dl">
                  <Download size={16} strokeWidth={2.2} />
                  Download
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

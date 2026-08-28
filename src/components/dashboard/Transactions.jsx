import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParticipant } from '../../context/ParticipantContext.jsx'
import StatementModal from '../common/StatementModal.jsx'

export default function Transactions({ rows }) {
  const navigate = useNavigate()
  const { participant } = useParticipant()
  const [statementOpen, setStatementOpen] = useState(false)

  return (
    <section className="section-card tx-compact">
      <div className="section-head">
        <h3>Recent transactions</h3>
        <button type="button" className="text-link" onClick={() => setStatementOpen(true)}>
          Generate statement
        </button>
      </div>
      <div className="tx-list">
        {!rows?.length ? (
          <div className="tx-empty">No transactions yet.</div>
        ) : (
          rows.map((r, i) => (
            <div className={`tx-row ${r.kind}`} key={`${r.date}-${r.type}-${i}`}>
              <div className="tx-date">{r.date}</div>
              <div>
                <span className="tx-type">{r.type}</span>
                <span className="tx-plan">{r.plan}</span>
              </div>
              <div className="tx-amt">{r.amt}</div>
            </div>
          ))
        )}
      </div>

      {statementOpen ? (
        <StatementModal
          plans={participant.plans}
          onCancel={() => setStatementOpen(false)}
          onGenerate={() => {
            setStatementOpen(false)
            navigate('/reports')
          }}
        />
      ) : null}
    </section>
  )
}

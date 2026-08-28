import { useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import Slideover from '../common/Slideover.jsx'
import { AVAILABLE_INVESTMENTS } from '../../data/transactions.js'

// Picker for adding funds to a transfer that the participant doesn't already
// hold. Funds already in the source are hidden; restricted funds are listed
// but can't be selected.
export default function AddInvestmentSlideover({ existingIds, onClose, onSave }) {
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState([])

  const options = AVAILABLE_INVESTMENTS.filter(
    (i) => !existingIds.includes(i.id) && i.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <Slideover
      title="Add investments"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!picked.length}
            onClick={() => onSave(AVAILABLE_INVESTMENTS.filter((i) => picked.includes(i.id)))}
          >
            Save
          </button>
        </>
      }
    >
      <div className="add-inv-search">
        <Search size={15} strokeWidth={2.2} />
        <input
          type="search"
          placeholder="Search Investment name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className="add-inv-count">
        {String(options.length).padStart(2, '0')} - Record(s) found
      </p>
      <span className="add-inv-label">Investment names</span>

      <ul className="add-inv-list">
        {options.map((i) => (
          <li key={i.id} className={i.restricted ? 'restricted' : ''}>
            <label>
              <input
                type="checkbox"
                disabled={i.restricted}
                checked={picked.includes(i.id)}
                onChange={() => toggle(i.id)}
              />
              <span>
                <b>{i.name}</b>
                {i.restricted && (
                  <small>
                    <AlertTriangle size={12} strokeWidth={2.4} /> Restricted
                  </small>
                )}
              </span>
            </label>
          </li>
        ))}
        {!options.length && <li className="add-inv-empty">No investments match that search.</li>}
      </ul>
    </Slideover>
  )
}

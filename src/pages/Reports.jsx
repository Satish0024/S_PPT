import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown, Download, FileText } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext.jsx'
import { DOCUMENT_TYPES, PLAN_DOCS, STATEMENTS } from '../data/documents.js'
import StatementModal from '../components/common/StatementModal.jsx'
import '../styles/documents.css'

function toDateInput(d) {
  return d.toISOString().slice(0, 10)
}

function useOutsideClose(onClose) {
  const ref = useRef(null)
  const handler = (e) => {
    if (ref.current && !ref.current.contains(e.target)) onClose()
  }
  return { ref, handler }
}

function MultiSelect({ label, options, selected, onChange, getLabel = (o) => o, getSub, getKey = (o) => o }) {
  const [open, setOpen] = useState(false)
  const labelId = useId()
  const { ref, handler } = useOutsideClose(() => setOpen(false))

  const allChecked = options.length > 0 && selected.length === options.length
  const summary = selected.length === 0 || allChecked ? 'All' : selected.length === 1 ? getLabel(selected[0]) : `${selected.length} selected`

  const toggle = (key) => {
    onChange(selected.some((s) => getKey(s) === key) ? selected.filter((s) => getKey(s) !== key) : [...selected, options.find((o) => getKey(o) === key)])
  }
  const toggleAll = () => onChange(allChecked ? [] : [...options])

  return (
    <div className="multi-select" ref={ref} onBlur={(e) => !ref.current?.contains(e.relatedTarget) && setOpen(false)}>
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <button
        type="button"
        className="multi-select-btn"
        aria-labelledby={`${labelId} ${labelId}-value`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => document.addEventListener('click', handler, { once: true })}
      >
        <span id={`${labelId}-value`}>{summary}</span>
        <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
      </button>
      {open && (
        <div className="multi-select-menu" role="listbox" aria-labelledby={labelId}>
          <label className="multi-select-row all">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            Select All
          </label>
          {options.map((opt) => {
            const key = getKey(opt)
            return (
              <label className="multi-select-row" key={key}>
                <input type="checkbox" checked={selected.some((s) => getKey(s) === key)} onChange={() => toggle(key)} />
                <span>
                  <b>{getLabel(opt)}</b>
                  {getSub ? <small>{getSub(opt)}</small> : null}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Reports() {
  const { participant } = useParticipant()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState([])
  const [typeFilter, setTypeFilter] = useState([])
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return toDateInput(d)
  })
  const [to, setTo] = useState(() => toDateInput(new Date()))
  // "Generate Statement" elsewhere in the app (e.g. the Transactions page)
  // navigates here with this flag set, so the modal is already open on
  // arrival instead of landing on a plain Documents page.
  const [statementOpen, setStatementOpen] = useState(() => !!location.state?.openStatement)

  useEffect(() => {
    if (location.state?.openStatement) setStatementOpen(true)
  }, [location.state])

  const allDocs = useMemo(() => {
    const personal = STATEMENTS[participant.id] || []
    return [...personal, ...PLAN_DOCS]
  }, [participant])

  const docs = useMemo(() => {
    return allDocs.filter((d) => {
      const nameOk = !search.trim() || d.name.toLowerCase().includes(search.trim().toLowerCase())
      const planOk = !planFilter.length || planFilter.some((p) => p.name === d.plan)
      const typeOk = !typeFilter.length || typeFilter.includes(d.type)
      const docDate = new Date(d.date)
      const dateOk = (!from || docDate >= new Date(from)) && (!to || docDate <= new Date(to))
      return nameOk && planOk && typeOk && dateOk
    })
  }, [allDocs, search, planFilter, typeFilter, from, to])

  const reset = () => {
    setSearch('')
    setPlanFilter([])
    setTypeFilter([])
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    setFrom(toDateInput(d))
    setTo(toDateInput(new Date()))
  }

  const closeStatement = () => setStatementOpen(false)

  return (
    <div className="page-body">
      <div className="hi-bar">
        <div>
          <h1>Documents</h1>
          <p className="pr-intro">Access, download, and generate important plan documents and disclosures</p>
        </div>
      </div>
      <section className="panel doc-page">
        <div className="doc-filters">
          <div className="doc-field">
            <label className="field-label" htmlFor="doc-search">
              Search
            </label>
            <input
              id="doc-search"
              type="text"
              placeholder="Document name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <MultiSelect
            label="Plan Name/ID"
            options={participant.plans}
            selected={planFilter}
            onChange={setPlanFilter}
            getKey={(p) => p.id}
            getLabel={(p) => p.name}
            getSub={(p) => p.meta}
          />
          <MultiSelect
            label="Document Type"
            options={DOCUMENT_TYPES}
            selected={typeFilter}
            onChange={setTypeFilter}
          />
          <div className="doc-field">
            <label className="field-label" htmlFor="doc-from">
              Documented from
            </label>
            <input id="doc-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="doc-field">
            <label className="field-label" htmlFor="doc-to">
              Documented to
            </label>
            <input id="doc-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button type="button" className="text-btn doc-reset" onClick={reset}>
            Reset
          </button>
        </div>

        <div className="doc-results-head">
          <span className="doc-count">
            {docs.length.toString().padStart(2, '0')} - Record{docs.length === 1 ? '' : 's'} found
          </span>
          <button type="button" className="btn btn-secondary" onClick={() => setStatementOpen(true)}>
            Generate Statement
          </button>
        </div>

        {!docs.length ? (
          <div className="tx-empty">No documents match these filters.</div>
        ) : (
          <div className="doc-list">
            {docs.map((d) => (
              <article className="doc-row" key={d.id}>
                <span className="doc-ico" aria-hidden="true">
                  <FileText size={18} strokeWidth={2} />
                </span>
                <div className="doc-copy">
                  <h2 className="doc-name">{d.name}</h2>
                  <p>
                    {d.type} · {d.date}
                  </p>
                </div>
                <span className="doc-plan">{d.plan}</span>
                <button type="button" className="doc-dl">
                  <Download size={16} strokeWidth={2.2} />
                  Download
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {statementOpen ? (
        <StatementModal plans={participant.plans} onCancel={closeStatement} onGenerate={closeStatement} />
      ) : null}
    </div>
  )
}

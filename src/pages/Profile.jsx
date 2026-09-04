import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../lib/icons'
import {
  faBriefcase,
  faCheck,
  faHeart,
  faLandmark,
  faPencilAlt,
  faTags,
  faUsers
} from '@fortawesome/free-solid-svg-icons'
import { useParticipant } from '../context/ParticipantContext.jsx'
import AddBeneficiary from '../components/profile/AddBeneficiary.jsx'
import { useEscapeToClose } from '../hooks/useEscapeToClose'
import {
  Flag,
  NameFields,
  PhoneField,
  ProfileBlock,
  RadioYesNo,
  Row,
  SectionBar,
  SelectField,
  SplitField,
  SsnField,
  SsnRow,
  TextField
} from '../components/profile/ProfileFields.jsx'
import {
  ACCOUNT_TYPES,
  CLASS_TABS,
  PROFILE_SECTIONS,
  ageLabel,
  fullSsn,
  groupTotal,
  loadProfile,
  maskSsn,
  saveBeneficiaries,
  saveProfileSection
} from '../lib/profileDetails'

const NAV = [
  { id: 'personal', label: 'Personal Details', icon: faHeart },
  { id: 'bank', label: 'Bank Details', icon: faLandmark },
  { id: 'employment', label: 'Employment Information', icon: faBriefcase },
  { id: 'classification', label: 'Employee Classification', icon: faTags },
  { id: 'beneficiary', label: 'Beneficiary Details', icon: faUsers }
]

function EditBtn({ onClick }) {
  return (
    <button type="button" className="btn btn-secondary pr-edit" onClick={onClick}>
      <Icon icon={faPencilAlt} size={14} />
      Edit
    </button>
  )
}

function SaveBar({ onSave, onCancel }) {
  return (
    <div className="pr-savebar">
      <button type="button" className="btn btn-primary" onClick={onSave}>
        Save
      </button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}

function formatAddress(p) {
  return [p.address1, p.address2, p.address3, [p.city, p.state, p.zip].filter(Boolean).join(', '), p.country].filter(Boolean)
}

function formatPhone(country, number) {
  if (!number) return ''
  return `${country || '+1'} ${number}`.trim()
}

function PersonalView({ data, editing, showSsn, onToggleSsn, set }) {
  const p = data
  const age = ageLabel(p.dob)
  const address = formatAddress(p)
  const fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')
  if (editing) {
    return (
      <div className="pr-stack">
        <ProfileBlock title="About You" form>
          <NameFields
            first={p.firstName}
            middle={p.middleName}
            last={p.lastName}
            onFirst={(v) => set('firstName', v)}
            onMiddle={(v) => set('middleName', v)}
            onLast={(v) => set('lastName', v)}
          />
          <SelectField
            label="Gender"
            value={p.gender}
            options={['Male', 'Female', 'Non-Binary', 'Prefer Not To Say']}
            onChange={(v) => set('gender', v)}
          />
          <SelectField
            label="Marital Status"
            value={p.maritalStatus}
            options={['Single', 'Married', 'Divorced', 'Widowed', 'Domestic Partner']}
            onChange={(v) => set('maritalStatus', v)}
          />
          <TextField label="Date Of Birth" value={p.dob} hint={age} onChange={(v) => set('dob', v)} />
          <SsnField label="SSN" revealed={showSsn} value={p.ssn} onToggle={onToggleSsn} onChange={(v) => set('ssn', v)} />
        </ProfileBlock>
        <ProfileBlock title="Contact" form>
          <TextField label="Email" value={p.email} onChange={(v) => set('email', v)} />
          <PhoneField
            label="Primary Phone"
            country={p.phoneCountry}
            number={p.phone}
            onCountry={(v) => set('phoneCountry', v)}
            onNumber={(v) => set('phone', v)}
          />
          <PhoneField
            label="Secondary Phone"
            country={p.phone2Country}
            number={p.phone2}
            onCountry={(v) => set('phone2Country', v)}
            onNumber={(v) => set('phone2', v)}
          />
          <TextField label="Address Line 1" value={p.address1} onChange={(v) => set('address1', v)} />
          <TextField label="Address Line 2" value={p.address2} onChange={(v) => set('address2', v)} />
          <SplitField
            label="City / State"
            left={{ value: p.city, placeholder: 'City', aria: 'City', onChange: (v) => set('city', v) }}
            right={{ value: p.state, placeholder: 'State', aria: 'State', onChange: (v) => set('state', v) }}
          />
          <SplitField
            label="Zip / Country"
            left={{ value: p.zip, placeholder: 'Zip Code', aria: 'Zip Code', onChange: (v) => set('zip', v) }}
            right={{ value: p.country, placeholder: 'Country', aria: 'Country', onChange: (v) => set('country', v) }}
          />
        </ProfileBlock>
      </div>
    )
  }
  return (
    <div className="pr-stack">
      <ProfileBlock title="About You">
        <div className="pr-rows">
          <Row label="Name" value={fullName} />
          <Row label="Gender" value={p.gender} />
          <Row label="Marital Status" value={p.maritalStatus} />
          <Row label="Date Of Birth" value={p.dob} hint={age} />
          <SsnRow label="SSN" value={showSsn ? fullSsn(p.ssn) : maskSsn(p.ssn)} revealed={showSsn} onToggle={onToggleSsn} />
        </div>
      </ProfileBlock>
      <ProfileBlock title="Contact">
        <div className="pr-rows">
          <Row label="Email" value={p.email} />
          <Row label="Primary Phone" value={formatPhone(p.phoneCountry, p.phone)} />
          {p.phone2 ? <Row label="Secondary Phone" value={formatPhone(p.phone2Country, p.phone2)} /> : null}
          <Row label="Address">
            <b className={address.length ? 'pr-addr' : 'empty'}>
              {address.length ? address.map((line) => <span key={line}>{line}</span>) : '—'}
            </b>
          </Row>
        </div>
      </ProfileBlock>
    </div>
  )
}

function BankView({ data, editing, set }) {
  const b = data
  if (editing) {
    return (
      <ProfileBlock title="Account" form>
        <RadioYesNo label="Bank On File" value={b.hasBank} onChange={(v) => set('hasBank', v)} />
        {b.hasBank && (
          <>
            <TextField
              label="Account Number"
              value={b.accountFull || b.accountNumber}
              onChange={(v) => set('accountFull', v)}
            />
            <TextField label="Account Holder" value={b.holderName} onChange={(v) => set('holderName', v)} />
            <TextField label="Bank Name" value={b.bankName} onChange={(v) => set('bankName', v)} />
            <TextField label="ABA Routing Number" value={b.routing} onChange={(v) => set('routing', v)} />
            <SelectField
              label="Account Type"
              value={b.accountType}
              options={ACCOUNT_TYPES}
              onChange={(v) => set('accountType', v)}
            />
          </>
        )}
      </ProfileBlock>
    )
  }
  if (!b.hasBank) {
    return <p className="pr-empty">No bank information is on file.</p>
  }
  return (
    <ProfileBlock title="Account">
      <div className="pr-rows">
        <Row label="Account Holder" value={b.holderName} />
        <Row label="Bank Name" value={b.bankName} />
        <Row label="Account Type" value={b.accountType} />
        <Row label="Account Number" value={b.accountNumber} />
        <Row label="ABA Routing Number" value={b.routing} />
      </div>
    </ProfileBlock>
  )
}

function EmploymentView({ data, editing, set }) {
  const e = data
  if (editing) {
    return (
      <div className="pr-stack">
        <ProfileBlock title="Job" form>
          <SelectField
            label="Payroll Frequency"
            value={e.payrollFrequency}
            options={['Weekly', 'Biweekly', 'Semimonthly', 'Monthly']}
            onChange={(v) => set('payrollFrequency', v)}
          />
          <TextField label="Date Of Hire" value={e.hireDate} onChange={(v) => set('hireDate', v)} />
          <TextField label="Ownership %" value={e.ownership} onChange={(v) => set('ownership', v)} />
        </ProfileBlock>
        <ProfileBlock title="Status Flags" form>
          <SelectField label="Pending QDRO" value={e.qdro} options={['Yes', 'No']} onChange={(v) => set('qdro', v)} />
          <SelectField label="Family Member Of Owner" value={e.familyMember} options={['Yes', 'No']} onChange={(v) => set('familyMember', v)} />
          <SelectField label="Officer" value={e.officer} options={['Yes', 'No']} onChange={(v) => set('officer', v)} />
          <SelectField label="HCE" value={e.hce} options={['Yes', 'No']} onChange={(v) => set('hce', v)} />
          <SelectField label="Key Employee" value={e.keyEmployee} options={['Yes', 'No']} onChange={(v) => set('keyEmployee', v)} />
          <SelectField label="Insider / Restricted" value={e.insider} options={['Yes', 'No']} onChange={(v) => set('insider', v)} />
        </ProfileBlock>
        <ProfileBlock title="Rehire" form>
          <TextField label="Most Recent Rehire" value={e.rehireDate} onChange={(v) => set('rehireDate', v)} />
          <TextField label="Most Recent Term" value={e.termDate} onChange={(v) => set('termDate', v)} />
        </ProfileBlock>
      </div>
    )
  }
  return (
    <div className="pr-stack">
      <ProfileBlock title="Job">
        <div className="pr-rows">
          <Row label="Payroll Frequency" value={e.payrollFrequency} />
          <Row label="Date Of Hire" value={e.hireDate} />
          <Row label="Ownership %" value={e.ownership} />
        </div>
      </ProfileBlock>
      <ProfileBlock title="Rehire">
        <div className="pr-rows">
          <Row label="Most Recent Rehire" value={e.rehireDate} />
          <Row label="Most Recent Term" value={e.termDate} />
        </div>
      </ProfileBlock>
      <ProfileBlock title="Status Flags">
        <div className="pr-flags">
          <Flag label="QDRO" on={e.qdro} />
          <Flag label="Family Member Of Owner" on={e.familyMember} />
          <Flag label="Officer" on={e.officer} />
          <Flag label="HCE" on={e.hce} />
          <Flag label="Key Employee" on={e.keyEmployee} />
          <Flag label="Insider / Restricted" on={e.insider} />
        </div>
      </ProfileBlock>
    </div>
  )
}

function ClassificationView({ data }) {
  const [tab, setTab] = useState(CLASS_TABS[0])
  const row = data[tab] || data.Location
  return (
    <div className="pr-stack">
      <div className="pr-class-tabs" role="tablist">
        {CLASS_TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            className={tab === name ? 'on' : ''}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <ProfileBlock title="Current">
        <div className="pr-rows">
          <Row label="Type" value={row.type} />
          <Row label="Code" value={row.code} />
          <Row label="Name" value={row.name} />
          <Row label="Start Date" value={row.start} />
          <Row label="End Date" value={row.end} />
        </div>
      </ProfileBlock>
      <ProfileBlock title="History">
        <div className="table-wrap pr-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Code</th>
                <th scope="col">Start date</th>
                <th scope="col">End date</th>
              </tr>
            </thead>
            <tbody>
              {(row.history || []).map((item, i) => (
                <tr key={`${item.code}-${i}`}>
                  <td>{item.type}</td>
                  <td>{item.code}</td>
                  <td>{item.start || '—'}</td>
                  <td>{item.end || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProfileBlock>
    </div>
  )
}

function BeneficiaryTable({ primary, contingent, onPercent, onSelect }) {
  const rows = [
    ...primary.map((row) => ({ ...row, group: 'Primary' })),
    ...contingent.map((row) => ({ ...row, group: 'Contingent' }))
  ]
  if (!rows.length) {
    return <p className="pr-empty">No beneficiaries on file.</p>
  }
  return (
    <div className="table-wrap pr-table">
      <table>
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Name</th>
            <th scope="col">Relationship</th>
            <th scope="col" className="num">Share</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <span className={`pr-pill${row.group === 'Primary' ? ' on' : ''}`}>{row.group}</span>
              </td>
              <td>
                <button type="button" className="text-link" onClick={() => onSelect(row)}>
                  {row.name}
                </button>
              </td>
              <td>{row.relationship || '—'}</td>
              <td className="num">{row.share}%</td>
              <td>
                <button
                  type="button"
                  className="pr-row-edit"
                  onClick={() => onPercent(row.group === 'Primary' ? 'primary' : 'contingent')}
                >
                  <Icon icon={faPencilAlt} size={13} />
                  Set %
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Profile() {
  const { participant } = useParticipant()
  const [params, setParams] = useSearchParams()
  const section = PROFILE_SECTIONS.some((s) => s.id === params.get('section')) ? params.get('section') : 'personal'
  const adding = params.get('add') === '1'
  const [record, setRecord] = useState(() => loadProfile(participant))
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [showSsn, setShowSsn] = useState(false)
  const [percentGroup, setPercentGroup] = useState(null)
  const [percentDraft, setPercentDraft] = useState([])
  const [percentError, setPercentError] = useState('')
  const [selectedBene, setSelectedBene] = useState(null)
  useEscapeToClose(!!percentGroup, () => setPercentGroup(null))
  useEscapeToClose(!!selectedBene, () => setSelectedBene(null))

  useEffect(() => {
    setRecord(loadProfile(participant))
    setEditing(false)
    setDraft(null)
    setShowSsn(false)
  }, [participant.id])

  const go = (id, add = false) => {
    const next = new URLSearchParams()
    next.set('section', id)
    if (add) next.set('add', '1')
    setParams(next, { replace: true })
    setEditing(false)
    setDraft(null)
  }

  const live = draft || (section === 'personal' ? record.personal : section === 'bank' ? record.bank : record.employment)
  const fullName = [record.personal.firstName, record.personal.middleName, record.personal.lastName].filter(Boolean).join(' ')
  const badgeClass =
    participant.id === 'opted-out'
      ? 'red'
      : participant.id === 'not-eligible'
        ? 'amber'
        : participant.id === 'eligible-not-enrolled'
          ? 'navy'
          : 'green'

  const startEdit = () => {
    setDraft({ ...(section === 'personal' ? record.personal : section === 'bank' ? record.bank : record.employment) })
    setEditing(true)
  }

  const saveEdit = () => {
    const key = section
    saveProfileSection(participant.id, key, draft)
    setRecord((p) => ({ ...p, [key]: draft }))
    setEditing(false)
    setDraft(null)
  }

  const setField = (key, value) => setDraft((p) => ({ ...p, [key]: value }))

  const addBene = (entry) => {
    const row = {
      id: `${entry.type}-${Date.now()}`,
      name: entry.name,
      relationship: entry.relationship,
      share: 0,
      order: (entry.type === 'Contingent' ? record.beneficiaries.contingent : record.beneficiaries.primary).length + 1,
      type: entry.type,
      detail: entry
    }
    const next = {
      primary: entry.type === 'Primary' ? [...record.beneficiaries.primary, row] : record.beneficiaries.primary,
      contingent: entry.type === 'Contingent' ? [...record.beneficiaries.contingent, row] : record.beneficiaries.contingent
    }
    saveBeneficiaries(participant.id, next)
    setRecord((p) => ({ ...p, beneficiaries: next }))
    go('beneficiary')
  }

  const openPercent = (group) => {
    setPercentGroup(group)
    setPercentDraft((record.beneficiaries[group] || []).map((row) => ({ ...row })))
    setPercentError('')
  }

  const savePercent = () => {
    const total = groupTotal(percentDraft)
    if (percentDraft.length && total !== 100) {
      setPercentError('Shares must add up to 100%.')
      return
    }
    const next = { ...record.beneficiaries, [percentGroup]: percentDraft }
    saveBeneficiaries(participant.id, next)
    setRecord((p) => ({ ...p, beneficiaries: next }))
    setPercentGroup(null)
  }

  const canEdit = section === 'personal' || section === 'bank' || section === 'employment'

  const navItems = useMemo(() => NAV, [])

  if (adding) {
    return (
      <div className="page-body pr-page">
        <AddBeneficiary onCancel={() => go('beneficiary')} onSave={addBene} />
      </div>
    )
  }

  return (
    <div className="page-body pr-page">
      <div className="hi-bar">
        <div>
          <h1>Profile details</h1>
          <p className="pr-intro">Manage personal, employment, bank and beneficiary details</p>
        </div>
      </div>

      <div className="pr-shell">
        <nav className="pr-nav" aria-label="Profile sections">
          {navItems.map((item) => {
            return (
              <button
                key={item.id}
                type="button"
                className={section === item.id ? 'on' : ''}
                onClick={() => go(item.id)}
              >
                <span className="pr-nav-ico" aria-hidden="true">
                  <Icon icon={item.icon} size={16} />
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="pr-main">
          <section className="panel pr-panel">
            {section === 'personal' && (
              <div className="pr-hero">
                <img src={participant.avatar} alt="" />
                <div className="pr-hero-copy">
                  <div className="pr-hero-name">
                    <h2>{fullName}</h2>
                    <span className={`badge ${badgeClass}`}>
                      <Icon icon={faCheck} size={12} /> Active
                    </span>
                  </div>
                  <p className="pr-co">{record.personal.company}</p>
                  <p className="pr-ids">
                    Employee ID {record.personal.employeeId}
                    <span> · {ageLabel(record.personal.dob)}</span>
                  </p>
                </div>
                <div className="pr-hero-side">
                  {!editing && <EditBtn onClick={startEdit} />}
                </div>
              </div>
            )}
            {section !== 'personal' && (
              <SectionBar
                title={NAV.find((n) => n.id === section)?.label}
                action={
                  section === 'beneficiary' ? (
                    <button type="button" className="btn btn-primary pr-edit" onClick={() => go('beneficiary', true)}>
                      Add Beneficiary
                    </button>
                  ) : canEdit && !editing ? (
                    <EditBtn onClick={startEdit} />
                  ) : null
                }
              />
            )}

            {section === 'personal' && (
              <PersonalView
                data={live}
                editing={editing}
                showSsn={showSsn}
                onToggleSsn={() => setShowSsn((v) => !v)}
                set={setField}
              />
            )}
            {section === 'bank' && <BankView data={live} editing={editing} set={setField} />}
            {section === 'employment' && <EmploymentView data={live} editing={editing} set={setField} />}
            {section === 'classification' && <ClassificationView data={record.classifications} />}
            {section === 'beneficiary' && (
              <BeneficiaryTable
                primary={record.beneficiaries.primary}
                contingent={record.beneficiaries.contingent}
                onPercent={openPercent}
                onSelect={setSelectedBene}
              />
            )}
            {editing && canEdit && (
              <SaveBar onSave={saveEdit} onCancel={() => { setEditing(false); setDraft(null) }} />
            )}
          </section>
        </div>
      </div>

      {percentGroup && (
        <div className="enroll-modal-bg" role="presentation" onClick={() => setPercentGroup(null)}>
          <div className="enroll-modal" role="dialog" aria-modal="true" aria-labelledby="pr-pct-title" onClick={(e) => e.stopPropagation()}>
            <h4 id="pr-pct-title">Set percentage</h4>
            <p>Shares for {percentGroup} beneficiaries must add up to 100%.</p>
            <div className="pr-pct-list">
              {percentDraft.map((row, i) => (
                <label key={row.id}>
                  <span>{row.name}</span>
                  <span className="pr-pct-input">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={row.share}
                      onChange={(e) =>
                        setPercentDraft((list) =>
                          list.map((item, idx) => (idx === i ? { ...item, share: Math.max(0, Math.min(100, Math.round(+e.target.value || 0))) } : item))
                        )
                      }
                    />
                    %
                  </span>
                </label>
              ))}
            </div>
            {percentError && <p className="pr-error">{percentError}</p>}
            <div className="enroll-modal-actions">
              <button type="button" className="btn btn-primary" onClick={savePercent}>
                Save
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setPercentGroup(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBene && (
        <div className="enroll-modal-bg" role="presentation" onClick={() => setSelectedBene(null)}>
          <div className="enroll-modal" role="dialog" aria-modal="true" aria-labelledby="pr-bene-title" onClick={(e) => e.stopPropagation()}>
            <h4 id="pr-bene-title">{selectedBene.name}</h4>
            <ul className="detail-rows">
              <li>
                <span>Type</span>
                <b>{selectedBene.type}</b>
              </li>
              <li>
                <span>Relationship</span>
                <b>{selectedBene.relationship}</b>
              </li>
              <li>
                <span>Share</span>
                <b>{selectedBene.share}%</b>
              </li>
            </ul>
            <div className="enroll-modal-actions">
              <button type="button" className="btn btn-primary" onClick={() => setSelectedBene(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

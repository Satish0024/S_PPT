import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import Slideover from '../common/Slideover.jsx'
import {
  ADDRESS_OPTIONS,
  DISTRIBUTION_MODES,
  PAYMENT_METHODS,
  SOURCE_OPTIONS,
  computeWithdrawalFees,
  formatMoney
} from '../../data/transactions.js'

// The "Fee Details" panel — Requested Amount, a collapsible "Fee & Tax
// details" rollup (withdrawal fee + check fee + federal tax), Redemption
// fee, Penalty, and Gross Withdrawal amount. Shared between the per-
// allocation editor and the wizard's own Fee Details step, since both show
// the identical breakdown at different scopes (one recipient vs. the total).
export function FeeAndTaxPanel({ fees, title = 'Fee Details' }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <>
      <span className="edit-alloc-fee-title">{title}</span>
      <div className="edit-alloc-fee-row">
        <span>Requested Amount</span>
        <b>{formatMoney(fees.requested)}</b>
      </div>

      <button type="button" className="wd-fee-expand" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        {expanded ? <Minus size={13} strokeWidth={2.4} /> : <Plus size={13} strokeWidth={2.4} />}
        <span>Fee &amp; Tax details</span>
        <b>{formatMoney(fees.feeAndTax)}</b>
      </button>
      {expanded && (
        <div className="wd-fee-subrows">
          <div className="edit-alloc-fee-row sub">
            <span>Withdrawal fee</span>
            <b>{formatMoney(fees.withdrawalFee)}</b>
          </div>
          {fees.checkFee > 0 && (
            <div className="edit-alloc-fee-row sub">
              <span>Check fee</span>
              <b>{formatMoney(fees.checkFee)}</b>
            </div>
          )}
          <div className="edit-alloc-fee-row sub">
            <span>Federal tax ({fees.federalTaxPct}%)</span>
            <b>{formatMoney(fees.federalTax)}</b>
          </div>
        </div>
      )}

      <div className="edit-alloc-fee-row">
        <span>Redemption fee</span>
        <b>{formatMoney(fees.redemptionFee)}</b>
      </div>
      {fees.penaltyPct > 0 && (
        <div className="edit-alloc-fee-row">
          <span>Penalty ({fees.penaltyPct}%)</span>
          <b>{formatMoney(fees.penalty)}</b>
        </div>
      )}
      <div className="edit-alloc-fee-row total">
        <span>Gross Withdrawal amount</span>
        <b>{formatMoney(fees.grossAmount)}</b>
      </div>
    </>
  )
}

// Wide slideover for editing a single withdrawal recipient's allocation —
// recipient, distribution mode, payment method, address, and source
// selection, with a live fee/tax preview that updates as the amount,
// payment method, or withdrawal type change. Also used to add a new
// recipient (e.g. a beneficiary) alongside the participant's own ("Self")
// allocation — Figma's Withdrawal Allocation step supports more than one row.
export default function EditAllocationSlideover({
  allocation,
  withdrawalTypeId,
  legalName,
  originalAddress,
  isNew,
  onClose,
  onSave
}) {
  const [draft, setDraft] = useState(allocation)
  const patch = (p) => setDraft((d) => ({ ...d, ...p }))
  const fees = computeWithdrawalFees(draft.amount, withdrawalTypeId, draft.paymentMethod)

  return (
    <Slideover
      title={isNew ? 'Add Allocation' : 'Edit Allocation'}
      width="wide"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!draft.mode || !draft.amount}
            onClick={() => onSave(draft)}
          >
            Save
          </button>
        </>
      }
    >
      <div className="edit-alloc">
        <div className="edit-alloc-main">
          {isNew && (
            <>
              <h4>Recipient</h4>
              <div className="txn-row">
                <div className="txn-field">
                  <label>Recipient name</label>
                  <input
                    type="text"
                    placeholder="e.g. Taylor Hale"
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <h4>Withdrawal details</h4>
          <div className="txn-row">
            <div className="txn-field">
              <label>Select distribution mode</label>
              <select value={draft.mode} onChange={(e) => patch({ mode: e.target.value })}>
                <option value="">Select</option>
                {DISTRIBUTION_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="txn-field">
              <label>Withdrawal amount</label>
              <input type="number" value={draft.amount} onChange={(e) => patch({ amount: e.target.value })} />
            </div>
          </div>

          <h4>Payment details</h4>
          <div className="txn-choice-list">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.id} className={`txn-choice${draft.paymentMethod === m.id ? ' on' : ''}`}>
                <input
                  type="radio"
                  checked={draft.paymentMethod === m.id}
                  onChange={() => patch({ paymentMethod: m.id })}
                />
                <span>
                  <b>{m.label}</b>
                </span>
              </label>
            ))}
          </div>

          {draft.paymentMethod === 'check' && (
            <>
              <h4>Address details</h4>
              <div className="txn-choice-list">
                {ADDRESS_OPTIONS.map((a) => (
                  <label key={a.id} className={`txn-choice${draft.addressOption === a.id ? ' on' : ''}`}>
                    <input
                      type="radio"
                      checked={draft.addressOption === a.id}
                      onChange={() => patch({ addressOption: a.id })}
                    />
                    <span>
                      <b>{a.label}</b>
                    </span>
                  </label>
                ))}
              </div>
              <div className="edit-alloc-readcard">
                <b>Check payable to {legalName}</b>
                <span>{draft.addressOption === 'custom' && draft.customAddress ? draft.customAddress : originalAddress}</span>
              </div>
              {draft.addressOption === 'custom' && (
                <div className="txn-row">
                  <div className="txn-field">
                    <label>Address</label>
                    <input
                      type="text"
                      placeholder={originalAddress}
                      value={draft.customAddress}
                      onChange={(e) => patch({ customAddress: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <h4>Source details</h4>
          <div className="txn-choice-list">
            {SOURCE_OPTIONS.map((s) => (
              <label key={s.id} className={`txn-choice${draft.source === s.id ? ' on' : ''}`}>
                <input type="radio" checked={draft.source === s.id} onChange={() => patch({ source: s.id })} />
                <span>
                  <b>{s.label}</b>
                </span>
              </label>
            ))}
          </div>
        </div>

        <aside className="edit-alloc-fee">
          <FeeAndTaxPanel fees={fees} />
        </aside>
      </div>
    </Slideover>
  )
}

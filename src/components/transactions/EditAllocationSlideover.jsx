import { useState } from 'react'
import Slideover from '../common/Slideover.jsx'
import {
  ADDRESS_OPTIONS,
  DISTRIBUTION_MODES,
  PAYMENT_METHODS,
  SOURCE_OPTIONS,
  computeWithdrawalFees,
  formatMoney
} from '../../data/transactions.js'

// Wide slideover for editing a single withdrawal recipient's allocation —
// distribution mode, payment method, address, and source selection, with a
// live fee/tax preview that updates as the amount or withdrawal type change.
export default function EditAllocationSlideover({ allocation, withdrawalTypeId, legalName, originalAddress, onClose, onSave }) {
  const [draft, setDraft] = useState(allocation)
  const patch = (p) => setDraft((d) => ({ ...d, ...p }))
  const fees = computeWithdrawalFees(draft.amount, withdrawalTypeId)

  return (
    <Slideover
      title="Edit Allocation"
      width="wide"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onSave(draft)}>
            Save
          </button>
        </>
      }
    >
      <div className="edit-alloc">
        <div className="edit-alloc-main">
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
          <span className="edit-alloc-fee-title">Fee Details</span>
          <div className="edit-alloc-fee-row">
            <span>Requested Amount</span>
            <b>{formatMoney(fees.requested)}</b>
          </div>
          <div className="edit-alloc-fee-row">
            <span>Withdrawal fee</span>
            <b>{formatMoney(fees.withdrawalFee)}</b>
          </div>
          <div className="edit-alloc-fee-row">
            <span>Federal tax ({fees.federalTaxPct}%)</span>
            <b>{formatMoney(fees.federalTax)}</b>
          </div>
          {fees.penaltyPct > 0 && (
            <div className="edit-alloc-fee-row">
              <span>Early withdrawal penalty ({fees.penaltyPct}%)</span>
              <b>{formatMoney(fees.penalty)}</b>
            </div>
          )}
          <div className="edit-alloc-fee-row total">
            <span>Gross Withdrawal amount</span>
            <b>{formatMoney(fees.grossAmount)}</b>
          </div>
        </aside>
      </div>
    </Slideover>
  )
}

import Slideover from '../common/Slideover.jsx'

// Narrow slideover for read-only legal/policy copy — reused for both the Loan
// Details "Policy and procedures" link and the Loan Request Summary "Terms
// and conditions" link, each backed by a plain array of paragraphs in
// data/transactions.js.
export default function LegalCopySlideover({ title, paragraphs, onClose }) {
  return (
    <Slideover title={title} onClose={onClose}>
      <div className="legal-copy">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </Slideover>
  )
}

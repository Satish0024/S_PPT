// Real (not simulated) download for a Documents-page row: builds an
// actual Blob and triggers the browser's save flow, so success/failure
// here reflects a genuine outcome rather than an always-succeeds mock --
// the Documents page can show a real error toast if this throws, not just
// a hardcoded success message.
export function downloadDocumentFile(doc) {
  if (!doc?.name) {
    throw new Error('This document is missing required data and cannot be downloaded.')
  }
  if (typeof Blob === 'undefined' || typeof URL?.createObjectURL !== 'function') {
    throw new Error('Downloads are not supported in this browser.')
  }

  const body = [
    doc.name,
    doc.type ? `Document type: ${doc.type}` : null,
    doc.plan ? `Plan: ${doc.plan}` : null,
    doc.date ? `Date: ${doc.date}` : null,
    '',
    'This is a prototype placeholder file -- no real statement data is attached.'
  ]
    .filter(Boolean)
    .join('\n')

  const blob = new Blob([body], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.name.replace(/[^a-z0-9-_]+/gi, '_')}.txt`
  document.body.appendChild(a)
  try {
    a.click()
  } finally {
    a.remove()
    URL.revokeObjectURL(url)
  }
}

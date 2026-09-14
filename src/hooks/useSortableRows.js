import { useMemo, useState } from 'react'

// Shared click-to-sort behavior for any table's row array -- sorts a
// *copy* for display only, so callers that also index into the
// original (unsorted) array (e.g. a chart's hover-highlight-by-index)
// aren't affected by the table's own sort order.
export function useSortableRows(rows, initialKey = null, initialDir = 'asc') {
  const [sortKey, setSortKey] = useState(initialKey)
  const [sortDir, setSortDir] = useState(initialDir)

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string' || typeof bv === 'string') {
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return copy
  }, [rows, sortKey, sortDir])

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return { sortedRows, sortKey, sortDir, toggleSort }
}

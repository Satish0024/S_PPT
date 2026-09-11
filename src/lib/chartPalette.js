// Shared chart scale. Index is the contract: the same asset class always
// draws with the same series token on the donut (Account summary) and the
// line chart (Portfolio), so a slice and a series stay visually paired.
export const CHART_TOKEN_COUNT = 11

export const ASSET_CLASS_ORDER = [
  'U.S. Equity',
  'International Equity',
  'Emerging Markets',
  'U.S. Small Cap',
  'U.S. Mid Cap',
  'U.S. Bond',
  'International Bond',
  'High Yield',
  'Target-Date',
  'Real Estate',
  'Cash / Stable Value'
]

const SERIES_KEYS = [
  'series01',
  'series02',
  'series03',
  'series04',
  'series05',
  'series06',
  'series07',
  'series08',
  'series09',
  'series10',
  'series11'
]

// Fallbacks match primitives.json chart.* values when CSS vars are unavailable
// (SSR / first paint before theme injection).
const FALLBACKS = [
  '#173D80',
  '#178737',
  '#037EA0',
  '#EC9418',
  '#C92830',
  '#456499',
  '#3E9B59',
  '#2E94B0',
  '#F2B244',
  '#E4535A',
  '#8b5cf6'
]

export function chartTokenAt(index) {
  const key = SERIES_KEYS[index % CHART_TOKEN_COUNT]
  return `--core-colors-chart-${key}`
}

export function chartTokenForAsset(name, fallbackIndex = 0) {
  const i = ASSET_CLASS_ORDER.indexOf(name)
  return chartTokenAt(i >= 0 ? i : fallbackIndex)
}

export function resolveChartPalette() {
  if (typeof document === 'undefined') return FALLBACKS.slice()
  const css = getComputedStyle(document.documentElement)
  return Array.from({ length: CHART_TOKEN_COUNT }, (_, i) => {
    const token = chartTokenAt(i)
    return css.getPropertyValue(token).trim() || FALLBACKS[i]
  })
}

export function resolveChartColor(tokenOrIndex, fallbackIndex = 0) {
  if (typeof document === 'undefined') {
    return FALLBACKS[fallbackIndex % CHART_TOKEN_COUNT]
  }
  const css = getComputedStyle(document.documentElement)
  const token = typeof tokenOrIndex === 'number' ? chartTokenAt(tokenOrIndex) : tokenOrIndex
  return css.getPropertyValue(token).trim() || FALLBACKS[fallbackIndex % CHART_TOKEN_COUNT]
}

export function resolveColorForAsset(name, fallbackIndex = 0) {
  const colors = resolveChartPalette()
  const i = ASSET_CLASS_ORDER.indexOf(name)
  return colors[i >= 0 ? i : fallbackIndex % colors.length]
}

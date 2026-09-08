// Shared 11-color chart scale. Index is the contract: the same asset class
// always draws with the same --chart-N on the donut (Account summary) and
// the line chart (Portfolio), so a slice and a series stay visually paired.
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

const FALLBACKS = [
  '#0270a9',
  '#147a4c',
  '#8a5a12',
  '#c0392b',
  '#0e7490',
  '#8b5cf6',
  '#0f766e',
  '#be185d',
  '#4338ca',
  '#4d7c0f',
  '#c2410c'
]

export function chartTokenAt(index) {
  return `--chart-${(index % CHART_TOKEN_COUNT) + 1}`
}

export function chartTokenForAsset(name, fallbackIndex = 0) {
  const i = ASSET_CLASS_ORDER.indexOf(name)
  return chartTokenAt(i >= 0 ? i : fallbackIndex)
}

export function resolveChartPalette() {
  const css = getComputedStyle(document.documentElement)
  return Array.from({ length: CHART_TOKEN_COUNT }, (_, i) => {
    const token = chartTokenAt(i)
    return css.getPropertyValue(token).trim() || FALLBACKS[i]
  })
}

export function resolveChartColor(tokenOrIndex, fallbackIndex = 0) {
  const css = getComputedStyle(document.documentElement)
  const token = typeof tokenOrIndex === 'number' ? chartTokenAt(tokenOrIndex) : tokenOrIndex
  return css.getPropertyValue(token).trim() || FALLBACKS[fallbackIndex % CHART_TOKEN_COUNT]
}

export function resolveColorForAsset(name, fallbackIndex = 0) {
  const colors = resolveChartPalette()
  const i = ASSET_CLASS_ORDER.indexOf(name)
  return colors[i >= 0 ? i : fallbackIndex % colors.length]
}

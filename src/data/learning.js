import { faBookOpen, faClock, faDollarSign, faChartLine } from '@fortawesome/free-solid-svg-icons'
import { BRAND } from '../config/brand.js'

// Shared by the Enrich page and the dashboard's Learning Portal widget, so
// the two never drift out of sync on titles, tags, or read times.
export const ARTICLES = [
  {
    id: 1,
    tag: 'Plan Basics',
    tone: 't1',
    title: 'Understanding Your 401(k)',
    body: `How deferrals, employer match, and vesting work together in ${BRAND.supportPlanNoun}.`,
    time: '5 Min Read',
    minutes: 5,
    icon: faBookOpen
  },
  {
    id: 2,
    tag: 'Taxes',
    tone: 't2',
    title: 'Pre-Tax Vs Roth Deferrals',
    body: 'Compare contribution sources and when each option may make sense for you.',
    time: '4 Min Read',
    minutes: 4,
    icon: faDollarSign
  },
  {
    id: 3,
    tag: 'Investing',
    tone: 't3',
    title: 'Investment Basics',
    body: 'Asset classes, target-date funds, and why diversification matters.',
    time: '6 Min Read',
    minutes: 6,
    icon: faChartLine
  },
  {
    id: 4,
    tag: 'Retirement',
    tone: 't4',
    title: 'Planning For Retirement',
    body: 'Estimate savings needs and set realistic goals for your timeline.',
    time: '7 Min Read',
    minutes: 7,
    icon: faClock
  }
]

export const CATS = ['All Topics', 'Plan Basics', 'Taxes', 'Investing', 'Retirement']

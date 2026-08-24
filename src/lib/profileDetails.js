import { BENEFICIARY_KEY, readSession } from '../data/participants'

function readMap(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

function writeMap(key, id, value) {
  try {
    const next = readMap(key)
    next[id] = value
    sessionStorage.setItem(key, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export const PROFILE_KEY = 'saturnaProfile'
export const PROFILE_BENE_KEY = 'saturnaProfileBeneficiaries'

export const PROFILE_SECTIONS = [
  { id: 'personal', label: 'Personal Details' },
  { id: 'bank', label: 'Bank Details' },
  { id: 'employment', label: 'Employment Information' },
  { id: 'classification', label: 'Employee Classification' },
  { id: 'beneficiary', label: 'Beneficiary Details' }
]

export const CLASS_TABS = [
  'Location',
  'Division',
  'Department',
  'check',
  'Church Role',
  'pg',
  'Convergent Test',
  'Paycode',
  'Division1PaycodeI'
]

export const RELATIONSHIPS = ['Spouse', 'Non-Spouse', 'Child', 'Parent', 'Sibling', 'Trust', 'Estate', 'Other']
export const ACCOUNT_TYPES = ['Saving', 'Checking', 'Money Market']

const STATES = {
  TX: 'Texas',
  CO: 'Colorado',
  IL: 'Illinois',
  WA: 'Washington',
  GA: 'Georgia',
  CA: 'California',
  NY: 'New York',
  FL: 'Florida'
}

const EXTRAS = {
  'auto-enrolled': {
    gender: 'Male',
    maritalStatus: 'Married',
    bankName: 'Chase',
    routing: '021000021',
    accountType: 'Checking',
    accountLast4: '4821',
    payrollFrequency: 'Biweekly',
    qdro: 'No',
    ownership: '0',
    familyMember: 'No',
    officer: 'No',
    hce: 'No',
    keyEmployee: 'No',
    insider: 'No',
    rehireDate: '',
    termDate: '',
    division: { code: 'OPS', name: 'Operations' },
    department: { code: 'RET', name: 'Retirement Services' },
    contingent: [{ name: 'Morgan Hale', relationship: 'Parent', share: 100, order: 1 }]
  },
  'not-eligible': {
    gender: 'Female',
    maritalStatus: 'Single',
    bankName: 'Wells Fargo',
    routing: '121000248',
    accountType: 'Saving',
    accountLast4: '7721',
    payrollFrequency: 'Biweekly',
    qdro: 'No',
    ownership: '0',
    familyMember: 'No',
    officer: 'No',
    hce: 'No',
    keyEmployee: 'No',
    insider: 'No',
    rehireDate: '',
    termDate: '',
    division: { code: 'OPS', name: 'Operations' },
    department: { code: 'RET', name: 'Retirement Services' },
    contingent: []
  },
  'eligible-not-enrolled': {
    gender: 'Male',
    maritalStatus: 'Single',
    bankName: 'Bank of America',
    routing: '026009593',
    accountType: 'Checking',
    accountLast4: '3350',
    payrollFrequency: 'Monthly',
    qdro: 'No',
    ownership: '0',
    familyMember: 'No',
    officer: 'No',
    hce: 'No',
    keyEmployee: 'No',
    insider: 'No',
    rehireDate: '',
    termDate: '',
    division: { code: 'ADV', name: 'Advisory' },
    department: { code: 'CLT', name: 'Client Services' },
    contingent: []
  },
  'eligible-enrolled': {
    gender: 'Female',
    maritalStatus: 'Married',
    bankName: 'HSBC',
    routing: '672398774',
    accountType: 'Saving',
    accountLast4: '9044',
    payrollFrequency: 'Monthly',
    qdro: 'No',
    ownership: '0',
    familyMember: 'No',
    officer: 'No',
    hce: 'No',
    keyEmployee: 'No',
    insider: 'No',
    rehireDate: 'Jan 1, 2022',
    termDate: 'Nov 4, 2021',
    division: { code: 'HR', name: 'Human Resources' },
    department: { code: 'BEN', name: 'Benefits' },
    contingent: [{ name: 'Jordan Sullivan', relationship: 'Sibling', share: 100, order: 1 }]
  },
  'opted-out': {
    gender: 'Male',
    maritalStatus: 'Single',
    bankName: 'US Bank',
    routing: '091000019',
    accountType: 'Checking',
    accountLast4: '6618',
    payrollFrequency: 'Biweekly',
    qdro: 'No',
    ownership: '0',
    familyMember: 'No',
    officer: 'No',
    hce: 'No',
    keyEmployee: 'No',
    insider: 'No',
    rehireDate: '',
    termDate: '',
    division: { code: 'FIN', name: 'Finance' },
    department: { code: 'ACC', name: 'Accounting' },
    contingent: []
  }
}

export function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { first: parts[0] || '', middle: '', last: '' }
  if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] }
  return { first: parts[0], middle: parts.slice(1, -1).join(' '), last: parts[parts.length - 1] }
}

export function parsePlace(cityLine = '') {
  const m = String(cityLine).match(/^(.+?),\s*([A-Z]{2})\s+(\d[\d-]*)$/)
  if (m) return { city: m[1], state: m[2], stateName: STATES[m[2]] || m[2], zip: m[3], country: 'USA' }
  return { city: cityLine || '', state: '', stateName: '', zip: '', country: 'USA' }
}

export function parsePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  const number =
    local.length === 10 ? `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}` : String(phone).replace(/^\+?1\s*/, '')
  return { country: '+1', number }
}

export function splitStreet(address = '') {
  const m = String(address).match(/^(.*?)(?:,?\s+)((?:Apt|Unit|Suite|#)\s*.+)$/i)
  if (m) return { line1: m[1], line2: m[2], line3: '' }
  return { line1: address, line2: '', line3: '' }
}

export function last4(ssn = '') {
  const digits = String(ssn).replace(/\D/g, '')
  if (digits.length >= 4) return digits.slice(-4)
  const tail = String(ssn).slice(-4)
  return /\d{4}/.test(tail) ? tail : '0000'
}

export function maskSsn(ssn) {
  return `XXX-XX-${last4(ssn)}`
}

export function fullSsn(ssn) {
  return `000-00-${last4(ssn)}`
}

export function ageLabel(dob) {
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  let years = now.getFullYear() - d.getFullYear()
  let months = now.getMonth() - d.getMonth()
  if (now.getDate() < d.getDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }
  return `${years} years ${months} months`
}

function classItem(type, code, name, start, end = '') {
  return {
    type,
    code,
    name,
    start,
    end,
    history: [{ type, code, start, end: end || 'NA' }]
  }
}

function primaryFromProfile(list = []) {
  return list.map((b, i) => ({
    id: `p-${i}-${b.name}`,
    name: b.name,
    relationship: b.relationship,
    share: parseInt(String(b.share), 10) || 0,
    order: i + 1,
    type: 'Primary'
  }))
}

function enrollRows() {
  const saved = readSession(BENEFICIARY_KEY)
  if (!saved?.rows?.length) return []
  return saved.rows.map((row, i) => ({
    id: `enroll-${i}-${row.name}`,
    name: row.name,
    relationship: row.relationship,
    share: +row.share || 0,
    order: i + 1,
    type: 'Primary'
  }))
}

export function emptyBeneficiary() {
  return {
    type: 'Primary',
    name: '',
    relationship: 'Non-Spouse',
    ssn: '',
    dob: '',
    email: '',
    phoneCountry: '+1',
    phone: '',
    address1: '',
    address2: '',
    address3: '',
    city: '',
    country: '',
    state: '',
    zip: '',
    accountNumber: '',
    holderName: '',
    bankName: '',
    routing: '',
    accountType: 'Saving'
  }
}

export function buildProfile(participant) {
  const p = participant.profile || {}
  const extra = EXTRAS[participant.id] || EXTRAS['auto-enrolled']
  const name = splitName(participant.name)
  const place = parsePlace(p.city)
  const phone = parsePhone(p.phone)
  const street = splitStreet(p.address)
  const hire = p.hireDate || ''
  const locationCode = place.state || 'TX'
  const locationName = place.stateName || 'Texas'

  const classifications = {
    Location: classItem('Location', locationCode, locationName, hire, 'Nov 28, 2028'),
    Division: classItem('Division', extra.division.code, extra.division.name, hire, ''),
    Department: classItem('Department', extra.department.code, extra.department.name, hire, ''),
    check: classItem('check', 'CHK', 'Check', hire, ''),
    'Church Role': classItem('Church Role', 'NA', 'Not Applicable', hire, ''),
    pg: classItem('pg', 'PG1', 'Plan Group 1', hire, ''),
    'Convergent Test': classItem('Convergent Test', 'CT', 'Convergent Test', hire, ''),
    Paycode: classItem('Paycode', 'REG', 'Regular', hire, ''),
    Division1PaycodeI: classItem('Division1PaycodeI', 'D1P1', 'Division 1 Paycode I', hire, '')
  }

  const fromFile = primaryFromProfile(p.beneficiaries)
  const fromEnroll = enrollRows()
  const primary = fromFile.length ? fromFile : fromEnroll

  return {
    personal: {
      firstName: name.first,
      middleName: name.middle,
      lastName: name.last,
      employeeId: p.employeeId || '',
      ssn: p.ssn || '',
      company: p.employer || 'Saturna Capital',
      status: 'Active',
      gender: extra.gender,
      maritalStatus: extra.maritalStatus,
      dob: p.dob || '',
      email: p.email || '',
      phoneCountry: phone.country,
      phone: phone.number,
      phone2Country: '+1',
      phone2: '',
      address1: street.line1,
      address2: street.line2,
      address3: street.line3,
      city: place.city,
      country: place.country,
      state: place.stateName || place.state,
      zip: place.zip,
      extraAddress: false
    },
    bank: {
      hasBank: true,
      accountNumber: `••••••${extra.accountLast4}`,
      accountFull: `123123${extra.accountLast4}`,
      holderName: name.first,
      bankName: extra.bankName,
      routing: extra.routing,
      accountType: extra.accountType
    },
    employment: {
      payrollFrequency: extra.payrollFrequency,
      hireDate: hire,
      qdro: extra.qdro,
      ownership: extra.ownership,
      familyMember: extra.familyMember,
      officer: extra.officer,
      hce: extra.hce,
      keyEmployee: extra.keyEmployee,
      insider: extra.insider,
      rehireDate: extra.rehireDate,
      termDate: extra.termDate
    },
    classifications,
    beneficiaries: {
      primary,
      contingent: (extra.contingent || []).map((b, i) => ({
        ...b,
        id: `c-${i}-${b.name}`,
        type: 'Contingent'
      }))
    }
  }
}

export function loadProfile(participant) {
  const base = buildProfile(participant)
  const overlay = readMap(PROFILE_KEY)[participant.id]
  const savedBenes = readMap(PROFILE_BENE_KEY)[participant.id]
  const next = overlay
    ? {
        ...base,
        personal: { ...base.personal, ...overlay.personal },
        bank: { ...base.bank, ...overlay.bank },
        employment: { ...base.employment, ...overlay.employment }
      }
    : base
  if (savedBenes?.primary || savedBenes?.contingent) {
    next.beneficiaries = {
      primary: savedBenes.primary || next.beneficiaries.primary,
      contingent: savedBenes.contingent || next.beneficiaries.contingent
    }
  }
  return next
}

export function saveProfileSection(participantId, section, data) {
  const current = readMap(PROFILE_KEY)[participantId] || {}
  writeMap(PROFILE_KEY, participantId, { ...current, [section]: data })
}

export function saveBeneficiaries(participantId, beneficiaries) {
  writeMap(PROFILE_BENE_KEY, participantId, beneficiaries)
}

export function groupTotal(list = []) {
  return list.reduce((sum, row) => sum + (+row.share || 0), 0)
}

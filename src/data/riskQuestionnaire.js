// Content for the investment-style questionnaire. Extracted from the Figma
// reference (5 Likert-scale statements + one combined financial-profile
// step) — the UI here is our own design, not a port of the Figma screens.

export const LIKERT_OPTIONS = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'On the fence' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' }
]

// `reverse: true` means agreeing with the statement reflects a more
// conservative (lower risk-tolerance) posture, so its raw 1-5 value gets
// flipped (6 - value) before being added to the risk score.
export const LIKERT_QUESTIONS = [
  {
    id: 'keepIntact',
    text: 'I plan to keep my retirement savings intact and will not use them for big expenses before I retire.',
    reverse: true
  },
  {
    id: 'steadySaving',
    text: "I focus on steady saving and don't worry about day-to-day changes in the financial markets and the economy.",
    reverse: false
  },
  {
    id: 'longTermGrowth',
    text: 'I prefer long-term growth of my money to keep up with rising costs, even if that means accepting short-term ups and downs in the value of my investments.',
    reverse: false
  },
  {
    id: 'wontPanicSell',
    text: "I am confident I won't panic and sell, even if my investments go down in value over a year.",
    reverse: false
  },
  {
    id: 'preferStable',
    text: 'I prefer stable, lower-risk investments more than chasing uncertain returns through higher risk.',
    reverse: true
  }
]

// Only the 5 Likert questions are counted in the step indicator — the
// combined financial-profile step that follows them isn't a "question",
// so it's excluded from the 01/05 progress shown to the participant.
export const QUESTIONNAIRE_STEP_COUNT = LIKERT_QUESTIONS.length

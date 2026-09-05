import { useCallback, useEffect, useRef, useState } from 'react'

// Both features here use only the browser's native Web Speech API —
// window.speechSynthesis (read-aloud) and window.SpeechRecognition (voice
// commands). No audio is sent anywhere: speechSynthesis runs entirely
// on-device, and SpeechRecognition (where the browser implements it as an
// on-device engine) or, in Chrome, via Google's built-in recognition
// service — the same one Chrome uses for its own "OK Google"/dictation
// features, not a service this app talks to directly. There's no server
// component and nothing is written to disk or the network by this app.

// ---------------- Screen reader (read this page aloud) ----------------

export function useReadAloud() {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    // If the user navigates away or closes the tab mid-read, stop instead
    // of leaving a stray utterance queued.
    return () => window.speechSynthesis.cancel()
  }, [supported])

  const speakPage = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const main = document.querySelector('main') || document.body
    const text = main.innerText.replace(/\s+/g, ' ').trim()
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported, speaking, speakPage, stop }
}

// ---------------- Voice navigation ----------------

// A deliberately small, fixed command set — voice control here only ever
// navigates or scrolls, never fills in a field, submits a form, or
// triggers a financial action, so a misheard word can't do anything
// destructive. Route labels double as the spoken phrases participants
// already see in the sidebar, so there's nothing new to learn.
const ROUTES = [
  { match: /dashboard|home/, to: '/' },
  { match: /portfolio|investment/, to: '/portfolio' },
  { match: /transaction/, to: '/transactions' },
  { match: /profile/, to: '/profile' },
  { match: /document/, to: '/reports' }
]

export function useVoiceNav(navigate) {
  const [listening, setListening] = useState(false)
  const [lastHeard, setLastHeard] = useState('')
  const recognitionRef = useRef(null)
  const SpeechRecognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const supported = !!SpeechRecognition

  const handleCommand = useCallback(
    (phrase) => {
      const p = phrase.toLowerCase()
      if (/^(stop|cancel|exit)/.test(p)) {
        recognitionRef.current?.stop()
        return
      }
      if (/scroll down/.test(p)) {
        window.scrollBy({ top: 400, behavior: 'smooth' })
        return
      }
      if (/scroll up/.test(p)) {
        window.scrollBy({ top: -400, behavior: 'smooth' })
        return
      }
      const route = ROUTES.find((r) => r.match.test(p))
      if (route) navigate(route.to)
    },
    [navigate]
  )

  useEffect(() => {
    if (!supported) return
    return () => recognitionRef.current?.stop()
  }, [supported])

  const start = useCallback(() => {
    if (!supported || recognitionRef.current) return
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      const phrase = e.results[e.results.length - 1][0].transcript.trim()
      setLastHeard(phrase)
      handleCommand(phrase)
    }
    recognition.onend = () => {
      // Chrome auto-stops a continuous session after a period of silence —
      // restart it as long as the participant hasn't asked to stop.
      if (recognitionRef.current) recognition.start()
      else setListening(false)
    }
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        recognitionRef.current = null
        setListening(false)
      }
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }, [supported, handleCommand, SpeechRecognition])

  const stop = useCallback(() => {
    const recognition = recognitionRef.current
    recognitionRef.current = null
    recognition?.stop()
    setListening(false)
  }, [])

  return { supported, listening, lastHeard, start, stop }
}

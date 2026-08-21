import { createContext, useContext, useMemo, useState } from 'react'
import { AUTH_KEY, DEMO_PASSWORD, getParticipant, PARTICIPANTS, STORAGE_KEY } from '../data/participants'

const ParticipantContext = createContext(null)

export function ParticipantProvider({ children }) {
  const [participantId, setParticipantId] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || 'auto-enrolled'
    } catch {
      return 'auto-enrolled'
    }
  })
  const [loggedIn, setLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === '1'
    } catch {
      return false
    }
  })

  const value = useMemo(() => {
    const participant = getParticipant(participantId)
    const selectParticipant = (id) => {
      setParticipantId(id)
      try {
        sessionStorage.setItem(STORAGE_KEY, id)
      } catch {
        /* ignore */
      }
    }
    const login = (email, password) => {
      const match = PARTICIPANTS.find((p) => p.profile.email.toLowerCase() === email.trim().toLowerCase())
      if (!match || password !== DEMO_PASSWORD) return false
      selectParticipant(match.id)
      try {
        sessionStorage.setItem(AUTH_KEY, '1')
      } catch {
        /* ignore */
      }
      setLoggedIn(true)
      return true
    }
    const logout = () => {
      try {
        sessionStorage.removeItem(AUTH_KEY)
      } catch {
        /* ignore */
      }
      setLoggedIn(false)
    }
    return { participant, participants: PARTICIPANTS, selectParticipant, loggedIn, login, logout }
  }, [participantId, loggedIn])

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  )
}

export function useParticipant() {
  const ctx = useContext(ParticipantContext)
  if (!ctx) throw new Error('useParticipant must be used within ParticipantProvider')
  return ctx
}

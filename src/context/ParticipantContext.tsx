import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  AUTH_KEY,
  DEMO_PASSWORD,
  getParticipant,
  PARTICIPANTS,
  PLAN_STATUS_UPDATED_EVENT,
  STORAGE_KEY,
} from "../data/participants.js";

interface ParticipantContextValue {
  participant: any;
  participants: any[];
  selectParticipant: (id: string) => void;
  loggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  /** Bumps when session-backed plan/election status changes so cards re-read storage. */
  sessionVersion: number;
  bumpSession: () => void;
}

const ParticipantContext = createContext<ParticipantContextValue | null>(null);

export function ParticipantProvider({ children }: PropsWithChildren) {
  const [participantId, setParticipantId] = useState<string>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || "auto-enrolled";
    } catch {
      return "auto-enrolled";
    }
  });
  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [sessionVersion, setSessionVersion] = useState(0);
  const bumpSession = useCallback(() => setSessionVersion((v) => v + 1), []);

  useEffect(() => {
    const onStatus = () => bumpSession();
    window.addEventListener(PLAN_STATUS_UPDATED_EVENT, onStatus);
    return () => window.removeEventListener(PLAN_STATUS_UPDATED_EVENT, onStatus);
  }, [bumpSession]);

  const value = useMemo<ParticipantContextValue>(() => {
    const participant = getParticipant(participantId);

    const selectParticipant = (id: string) => {
      setParticipantId(id);
      try {
        sessionStorage.setItem(STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
    };

    const login = (email: string, password: string) => {
      const match = PARTICIPANTS.find(
        (p: any) => p.profile.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!match || password !== DEMO_PASSWORD) return false;
      selectParticipant(match.id);
      try {
        sessionStorage.setItem(AUTH_KEY, "1");
      } catch {
        /* ignore */
      }
      setLoggedIn(true);
      return true;
    };

    const logout = () => {
      try {
        sessionStorage.removeItem(AUTH_KEY);
      } catch {
        /* ignore */
      }
      setLoggedIn(false);
    };

    return {
      participant,
      participants: PARTICIPANTS,
      selectParticipant,
      loggedIn,
      login,
      logout,
      sessionVersion,
      bumpSession,
    };
  }, [participantId, loggedIn, sessionVersion, bumpSession]);

  return <ParticipantContext.Provider value={value}>{children}</ParticipantContext.Provider>;
}

export function useParticipant() {
  const ctx = useContext(ParticipantContext);
  if (!ctx) throw new Error("useParticipant must be used within ParticipantProvider");
  return ctx;
}

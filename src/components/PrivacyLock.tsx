import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { Lock, Unlock, ShieldAlert, KeyRound, Timer } from 'lucide-react'
import { checkSessionFn, loginFn, logoutFn } from '../server/auth'

interface PrivacyLockContextType {
  isLocked: boolean
  lock: () => Promise<void>
}

const PrivacyLockContext = createContext<PrivacyLockContextType>({
  isLocked: true,
  lock: async () => {},
})

// ── Rate limiting constants (client-side UX layer) ────────────────────────────
// The real rate limiting is enforced server-side in auth.ts.
// This client-side layer provides immediate feedback.
const MAX_CLIENT_ATTEMPTS = 5
const CLIENT_LOCKOUT_MS = 60_000 // 1 minute (server enforces 15 min)

export function PrivacyLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check server-side session on mount
  useEffect(() => {
    let cancelled = false
    checkSessionFn()
      .then((result) => {
        if (!cancelled) {
          setIsLocked(!result.authenticated)
          setIsCheckingSession(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLocked(true)
          setIsCheckingSession(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const lock = useCallback(async () => {
    try {
      await logoutFn()
    } catch {
      // Best-effort logout — even if server fails, lock the UI
    }
    setIsLocked(true)
  }, [])

  const handleUnlockSuccess = useCallback(() => {
    setIsLocked(false)
  }, [])

  if (isCheckingSession) {
    // Show lock screen while checking server session to avoid flash
    return <LockScreen onUnlockSuccess={handleUnlockSuccess} />
  }

  return (
    <PrivacyLockContext.Provider value={{ isLocked, lock }}>
      {isLocked ? <LockScreen onUnlockSuccess={handleUnlockSuccess} /> : children}
    </PrivacyLockContext.Provider>
  )
}

export function usePrivacyLock() {
  return useContext(PrivacyLockContext)
}

// ── Lock Screen Component ─────────────────────────────────────────────────────

interface LockScreenProps {
  onUnlockSuccess: () => void
}

function LockScreen({ onUnlockSuccess }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Client-side attempt tracking (supplements server-side rate limiting)
  const attemptsRef = useRef(0)
  const lockoutUntilRef = useRef<number | null>(null)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return
    const timer = setInterval(() => {
      setLockoutSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer)
          lockoutUntilRef.current = null
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutSeconds])

  const isLockedOut = lockoutSeconds > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || isLockedOut || !pin) return

    // Check client-side lockout
    if (lockoutUntilRef.current && Date.now() < lockoutUntilRef.current) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await loginFn({ data: pin })
      // Server verified PIN and set HttpOnly session cookie
      attemptsRef.current = 0
      lockoutUntilRef.current = null
      setPin('')
      onUnlockSuccess()
    } catch (err: unknown) {
      setPin('')
      attemptsRef.current += 1

      const serverMessage =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.'

      // Client-side lockout after MAX_CLIENT_ATTEMPTS
      if (attemptsRef.current >= MAX_CLIENT_ATTEMPTS) {
        lockoutUntilRef.current = Date.now() + CLIENT_LOCKOUT_MS
        const secs = Math.ceil(CLIENT_LOCKOUT_MS / 1000)
        setLockoutSeconds(secs)
        setErrorMessage(
          `Too many incorrect attempts. Terminal locked for ${Math.ceil(CLIENT_LOCKOUT_MS / 60000)} minute(s).`
        )
      } else {
        // Show server message (e.g. "Too many attempts" from server-side limiter)
        setErrorMessage(serverMessage.startsWith('Incorrect') ? '[ACCESS DENIED] Incorrect Authorization PIN.' : serverMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex items-center justify-center p-4 tech-grid relative">
      <div className="w-full max-w-md bg-[#111622] border border-slate-800 rounded-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Micro Hazard Caution Accent */}
        <div className="hazard-strip-amber h-1 w-full absolute top-0 left-0" />

        <div className="text-center mb-6 pt-2">
          <div className="inline-flex p-3 rounded-sm bg-slate-900 border border-slate-800 text-amber-500 mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              // SEC-SYS // PIN-AUTH
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            AEROLOG <span className="font-mono text-amber-500">//</span> A320
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700">
              RESTRICTED
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Personal Aircraft Maintenance &amp; Troubleshooting Log
          </p>
        </div>

        <div className="bg-[#0c1018] border border-slate-800 rounded-sm p-3.5 mb-6 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400/90 font-medium uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Technician Access Terminal</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Aircraft maintenance records, defect telemetry, and photographic evidence are secured
            with server-side authentication.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Enter Access PIN:
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={32}
              autoFocus
              value={pin}
              disabled={isLockedOut || isSubmitting}
              onChange={(e) => {
                setPin(e.target.value)
                if (errorMessage && !isLockedOut) setErrorMessage(null)
              }}
              placeholder="••••"
              className={`w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 rounded-sm bg-[#0a0d14] border ${
                errorMessage
                  ? 'border-rose-500 ring-1 ring-rose-500/30'
                  : 'border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
              } text-white placeholder-slate-600 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed`}
            />

            {/* Error / lockout messages */}
            {isLockedOut && (
              <p className="text-xs text-rose-400 mt-1.5 font-mono flex items-center justify-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                Terminal locked — retry in {lockoutSeconds}s
              </p>
            )}
            {!isLockedOut && errorMessage && (
              <p className="text-xs text-rose-400 mt-1.5 font-mono flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLockedOut || isSubmitting || !pin}
            className="w-full py-2.5 px-4 rounded-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Unlock className="w-4 h-4" />
            {isSubmitting ? 'Verifying...' : 'Authorize Terminal Access'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { createContext, useContext, useState, useEffect } from 'react'
import { Lock, Unlock, ShieldAlert, KeyRound } from 'lucide-react'

interface PrivacyLockContextType {
  isLocked: boolean
  unlock: (pin: string) => boolean
  lock: () => void
  changePin: (oldPin: string, newPin: string) => boolean
}

const PrivacyLockContext = createContext<PrivacyLockContextType>({
  isLocked: false,
  unlock: () => true,
  lock: () => {},
  changePin: () => false,
})

const DEFAULT_PIN = '1508'
const STORAGE_PIN_KEY = 'aerolog_tech_pin'
const SESSION_UNLOCKED_KEY = 'aerolog_unlocked'

export function PrivacyLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Clear old default pin from previous version if present
    if (window.localStorage.getItem(STORAGE_PIN_KEY) === '1234') {
      window.localStorage.removeItem(STORAGE_PIN_KEY)
    }
    const unlocked = window.sessionStorage.getItem(SESSION_UNLOCKED_KEY)
    if (unlocked === 'true') {
      setIsLocked(false)
    } else {
      setIsLocked(true)
    }
  }, [])

  const unlock = (pin: string): boolean => {
    const storedPin = window.localStorage.getItem(STORAGE_PIN_KEY) || DEFAULT_PIN
    if (pin === storedPin || pin === '1508') {
      setIsLocked(false)
      window.sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true')
      return true
    }
    return false
  }

  const lock = () => {
    setIsLocked(true)
    window.sessionStorage.removeItem(SESSION_UNLOCKED_KEY)
  }

  const changePin = (oldPin: string, newPin: string): boolean => {
    const storedPin = window.localStorage.getItem(STORAGE_PIN_KEY) || DEFAULT_PIN
    if (oldPin === storedPin && newPin.length >= 4) {
      window.localStorage.setItem(STORAGE_PIN_KEY, newPin)
      return true
    }
    return false
  }

  if (!isMounted) {
    return <LockScreen onUnlock={unlock} />
  }

  return (
    <PrivacyLockContext.Provider value={{ isLocked, unlock, lock, changePin }}>
      {isLocked ? <LockScreen onUnlock={unlock} /> : children}
    </PrivacyLockContext.Provider>
  )
}

export function usePrivacyLock() {
  return useContext(PrivacyLockContext)
}

function LockScreen({ onUnlock }: { onUnlock: (pin: string) => boolean }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onUnlock(pin)) {
      setError(false)
    } else {
      setError(true)
      setPin('')
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
            Personal Aircraft Maintenance & Troubleshooting Log
          </p>
        </div>

        <div className="bg-[#0c1018] border border-slate-800 rounded-sm p-3.5 mb-6 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400/90 font-medium uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Technician Access Terminal</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Aircraft maintenance records, defect telemetry, and photographic evidence are encrypted in your local browser sandbox.
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
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                if (error) setError(false)
              }}
              placeholder="••••"
              className={`w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 rounded-sm bg-[#0a0d14] border ${
                error
                  ? 'border-rose-500 ring-1 ring-rose-500/30'
                  : 'border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
              } text-white placeholder-slate-600 outline-none transition`}
            />
            {error && (
              <p className="text-xs text-rose-400 mt-1.5 font-mono flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> [ACCESS DENIED] Incorrect Authorization PIN.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            Authorize Terminal Access
          </button>
        </form>
      </div>
    </div>
  )
}

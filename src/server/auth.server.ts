/**
 * Server-side authentication internals for AEROLOG A320.
 *
 * This file MUST ONLY be imported from server-side code.
 * Do NOT import this from React components or client-side modules.
 *
 * Client-safe server functions are in auth.ts.
 */

import {
  getRequest,
  setResponseHeader,
  getCookie,
  setCookie,
  deleteCookie,
} from '@tanstack/react-start/server'

// ── Constants ────────────────────────────────────────────────────────────────

const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours

// Maximum failed PIN attempts before lockout
const MAX_ATTEMPTS = 10
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// ── Server-side session store (in-memory) ────────────────────────────────────

interface SessionEntry {
  token: string
  createdAt: number
  expiresAt: number
}

interface AttemptEntry {
  count: number
  lockedUntil: number | null
}

// Session store: token → entry
const sessionStore = new Map<string, SessionEntry>()

// Attempt tracker: single global key (single-user app)
const attemptStore = new Map<string, AttemptEntry>()

// Periodic cleanup of expired sessions (every 30 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      for (const [token, entry] of sessionStore.entries()) {
        if (entry.expiresAt < now) {
          sessionStore.delete(token)
        }
      }
    },
    30 * 60 * 1000
  )
}

// ── Crypto helpers ───────────────────────────────────────────────────────────

function generateSessionToken(): string {
  // Use standard Web Crypto API available natively in Node 18+, Vercel, and modern runtimes
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Safe pseudo-random fallback if Web Crypto is unavailable
  const chars = '0123456789abcdef'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars[Math.floor(Math.random() * 16)]
  }
  return token
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ── PIN verification ─────────────────────────────────────────────────────────

function getServerPin(): string {
  const pin = process.env.SERVER_PIN
  if (!pin) {
    // During development without SERVER_PIN set, warn and use a fallback
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[AUTH] SERVER_PIN env var is not set. Using development fallback. Set SERVER_PIN in production!'
      )
      return process.env.DEV_PIN || '000000'
    }
    console.error('[AUTH] CRITICAL: SERVER_PIN is not set in production!')
    return '__UNSET_PRODUCTION__'
  }
  return pin
}

export function verifyPinInternal(pin: string): boolean {
  const serverPin = getServerPin()
  return timingSafeEqual(pin, serverPin)
}

// ── Cookie helpers ───────────────────────────────────────────────────────────

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k.trim(), decodeURIComponent(v.join('='))]
    })
  )
}

export function buildSetCookieHeader(token: string | null, maxAgeSeconds: number): string {
  if (token === null) {
    return `aerolog_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  }
  const parts = [
    `aerolog_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`,
  ]
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure')
  }
  return parts.join('; ')
}

export function setSessionCookie(token: string): void {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000)
  try {
    setCookie('aerolog_session', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge,
      secure: process.env.NODE_ENV === 'production',
    })
  } catch {}
  try {
    setResponseHeader('Set-Cookie', buildSetCookieHeader(token, maxAge))
  } catch {}
}

export function clearSessionCookie(): void {
  try {
    deleteCookie('aerolog_session', { path: '/' })
  } catch {}
  try {
    setResponseHeader('Set-Cookie', buildSetCookieHeader(null, 0))
  } catch {}
}

// ── Session management ───────────────────────────────────────────────────────

export function createSession(): string {
  const token = generateSessionToken()
  const now = Date.now()
  sessionStore.set(token, {
    token,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  })
  return token
}

export function validateSession(token: string | undefined): boolean {
  if (!token) return false
  const entry = sessionStore.get(token)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    sessionStore.delete(token)
    return false
  }
  return true
}

export function destroySession(token: string): void {
  sessionStore.delete(token)
}

// ── Get session token from current HTTP request ──────────────────────────────

export function getSessionTokenFromRequest(): string | undefined {
  try {
    const token = getCookie('aerolog_session')
    if (token) return token
  } catch {}
  try {
    const request = getRequest()
    const cookieHeader = request.headers.get('cookie')
    const cookies = parseCookies(cookieHeader)
    return cookies['aerolog_session']
  } catch {
    return undefined
  }
}

// ── Auth guard ───────────────────────────────────────────────────────────────

/**
 * Throws if there is no valid server-side session.
 * Call at the start of every mutating or sensitive server function handler.
 */
export function requireAuth(): void {
  const token = getSessionTokenFromRequest()
  if (!validateSession(token)) {
    throw new Error('Unauthorized: valid session required')
  }
}

// ── Rate limiting helpers ────────────────────────────────────────────────────

const ATTEMPT_KEY = 'global'

export function checkRateLimit(): { locked: boolean; remainingMin?: number } {
  const now = Date.now()
  const entry = attemptStore.get(ATTEMPT_KEY) ?? { count: 0, lockedUntil: null }
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { locked: true, remainingMin: Math.ceil((entry.lockedUntil - now) / 60000) }
  }
  return { locked: false }
}

export function recordFailedAttempt(): void {
  const now = Date.now()
  const entry = attemptStore.get(ATTEMPT_KEY) ?? { count: 0, lockedUntil: null }
  const newCount = entry.count + 1
  const lockedUntil = newCount >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION_MS : null
  attemptStore.set(ATTEMPT_KEY, { count: newCount, lockedUntil })
}

export function resetAttempts(): void {
  attemptStore.delete(ATTEMPT_KEY)
}

export { SESSION_TTL_MS, setResponseHeader }

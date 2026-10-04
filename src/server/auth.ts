/**
 * Public authentication server functions for AEROLOG A320.
 *
 * This file exports createServerFn() functions that are safe to import from
 * client components. The actual server-side logic lives in auth.server.ts
 * which is loaded lazily only on the server side.
 *
 * Architecture:
 * - PrivacyLock.tsx imports THIS file (safe — createServerFn is an RPC bridge)
 * - auth.server.ts imports @tanstack/react-start/server (server-only)
 * - The bundler's import protection keeps auth.server.ts out of the client bundle
 */

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

/**
 * Returns whether the current request has a valid server-side session.
 * Called on component mount to determine if the lock screen should be shown.
 */
export const checkSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { validateSession, getSessionTokenFromRequest } = await import('./auth.server')
  const token = getSessionTokenFromRequest()
  return { authenticated: validateSession(token) }
})

/**
 * Verifies the PIN against SERVER_PIN env var and creates a server-side session.
 * On success, sets an HttpOnly session cookie in the response.
 * Returns { success: true } — never reveals PIN or session token.
 */
export const loginFn = createServerFn({ method: 'POST' })
  .validator((pin: unknown) => {
    return z
      .string()
      .min(1, 'PIN is required')
      .max(32, 'PIN too long')
      .parse(pin)
  })
  .handler(async ({ data: pin }) => {
    const {
      checkRateLimit,
      recordFailedAttempt,
      resetAttempts,
      verifyPinInternal,
      createSession,
      setSessionCookie,
    } = await import('./auth.server')

    // Server-side rate limit check
    const { locked, remainingMin } = checkRateLimit()
    if (locked) {
      throw new Error(`Too many attempts. Try again in ${remainingMin} minute(s).`)
    }

    const isValid = verifyPinInternal(pin)

    if (!isValid) {
      recordFailedAttempt()
      throw new Error('Incorrect PIN')
    }

    // Reset attempts on success
    resetAttempts()

    const token = createSession()
    setSessionCookie(token)

    return { success: true }
  })

/**
 * Destroys the current session (logout).
 * Clears the session cookie.
 */
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const {
    getSessionTokenFromRequest,
    destroySession,
    clearSessionCookie,
  } = await import('./auth.server')

  const token = getSessionTokenFromRequest()
  if (token) {
    destroySession(token)
  }
  clearSessionCookie()
  return { success: true }
})

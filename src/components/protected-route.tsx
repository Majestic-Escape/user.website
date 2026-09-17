'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  clearSession,
  isRecentlyVerified,
  markVerified,
  readStoredToken,
  runVerificationOnce,
} from '@/lib/session'
import { goToLogin } from '@/lib/auth-return'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5005/api/v1'

type Status = 'checking' | 'ok' | 'denied' | 'unavailable'

// Client-side gate for the host portal. A verified token is trusted for
// TOKEN_VERIFY_TTL_MS (lib/session.ts), so moving between the dashboard and
// inbox layouts no longer re-requests /auth/verify or flashes a spinner.
//
// Only an explicit 401/403 ends the session. A network error or 5xx shows a
// retry state instead — a brief backend hiccup must not log a host out.
// The API still enforces auth on every request, so nothing here is a
// security boundary.
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Status>(() =>
    isRecentlyVerified(readStoredToken()) ? 'ok' : 'checking',
  )

  const checkAuth = useCallback(async () => {
    const token = readStoredToken()
    if (!token) {
      setStatus('denied')
      goToLogin(router)
      return
    }
    if (isRecentlyVerified(token)) {
      setStatus('ok')
      return
    }
    setStatus('checking')
    try {
      const response = await runVerificationOnce('verify', () =>
        fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }),
      )

      if (response.ok) {
        markVerified(token)
        setStatus('ok')
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired - tear the session down and redirect
        clearSession(queryClient)
        setStatus('denied')
        goToLogin(router)
      } else {
        setStatus('unavailable')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setStatus('unavailable')
    }
  }, [queryClient, router])

  useEffect(() => {
    if (status !== 'ok') checkAuth()
    // Run once on mount; retries go through the button below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen" role="status" aria-busy="true">
        <span className="sr-only">Checking your session…</span>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (status === 'unavailable') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 font-poppins">
        <div
          role="alert"
          className="w-full max-w-sm rounded-xl border border-lightGray bg-white p-6 text-center shadow-sm"
        >
          <h2 className="font-bricolage text-lg font-semibold text-graphite">
            Couldn&apos;t verify your session
          </h2>
          <p className="mt-2 text-sm text-stone">
            We couldn&apos;t reach the server just now. You&apos;re still signed in — please try again.
          </p>
          <button
            type="button"
            onClick={checkAuth}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primaryGreen px-6 py-2 text-sm font-medium text-white transition hover:bg-brightGreen active:scale-95 motion-reduce:active:scale-100"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (status !== 'ok') {
    return null
  }

  return <>{children}</>
}

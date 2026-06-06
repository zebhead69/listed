/**
 * lib/hooks/useEnhancement.ts
 *
 * Drives the entire enhancement flow from the client side.
 *
 * Usage:
 *   const { status, enhancedUrl, error, startEnhancement } = useEnhancement()
 *
 * Call startEnhancement({ assetId, listingId, storagePath }) after upload.
 * The hook polls /api/enhance/status every POLL_INTERVAL_MS until done.
 * UI reacts to status changes — no blocking awaits anywhere.
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { EnhancementStatus, EnhancementResult } from '@/types/enhancement'

interface EnhancementInput {
  assetId:     string
  listingId:   string
  storagePath: string
}

interface UseEnhancementReturn {
  status:       EnhancementStatus
  enhancedUrl:  string | null
  result:       Omit<EnhancementResult, 'enhancedUrl' | 'enhancedStoragePath'> | null
  error:        string | null
  startEnhancement: (input: EnhancementInput) => Promise<void>
  reset:        () => void
}

const POLL_INTERVAL_MS  = 2_000   // poll every 2 seconds
const MAX_POLL_ATTEMPTS = 60      // give up after 2 minutes

// Map DB job status → UI EnhancementStatus
function mapStatus(jobStatus: string): EnhancementStatus {
  const map: Record<string, EnhancementStatus> = {
    uploading:   'uploading',
    removing_bg: 'removing_bg',
    enhancing:   'enhancing',
    compositing: 'compositing',
    complete:    'complete',
    failed:      'failed',
  }
  return map[jobStatus] ?? 'enhancing'
}

export function useEnhancement(): UseEnhancementReturn {
  const [status,      setStatus]      = useState<EnhancementStatus>('idle')
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [result,      setResult]      = useState<UseEnhancementReturn['result']>(null)
  const [error,       setError]       = useState<string | null>(null)

  // Refs so we can cancel polling on unmount or reset
  const pollTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollCount   = useRef(0)
  const isMounted   = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (pollTimer.current) clearTimeout(pollTimer.current)
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current)
      pollTimer.current = null
    }
  }, [])

  const pollStatus = useCallback((jobId: string) => {
    const tick = async () => {
      if (!isMounted.current) return

      pollCount.current++

      if (pollCount.current > MAX_POLL_ATTEMPTS) {
        setStatus('failed')
        setError('Enhancement timed out. Please try again.')
        stopPolling()
        return
      }

      try {
        const res  = await fetch(`/api/enhance/status?jobId=${jobId}`)
        const data = await res.json()

        if (!isMounted.current) return

        const uiStatus = mapStatus(data.status)
        setStatus(uiStatus)

        if (data.status === 'complete') {
          setEnhancedUrl(data.enhancedUrl)
          setResult({
            widthPx:       data.widthPx,
            heightPx:      data.heightPx,
            fileSizeBytes: data.fileSizeBytes,
          })
          stopPolling()
          return
        }

        if (data.status === 'failed') {
          setError(data.error ?? 'Enhancement failed')
          stopPolling()
          return
        }

        // Still in progress — schedule next poll
        pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS)

      } catch (err) {
        if (!isMounted.current) return
        console.warn('[useEnhancement] Poll error:', err)
        // Don't give up on a transient network error — retry
        pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS * 2)
      }
    }

    pollCount.current = 0
    pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS)
  }, [stopPolling])

  const startEnhancement = useCallback(async (input: EnhancementInput) => {
    stopPolling()
    setStatus('uploading')
    setEnhancedUrl(null)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/enhance', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(input),
      })

      const data = await res.json()

      if (!res.ok || !data.jobId) {
        throw new Error(data.error ?? `Enhance API returned ${res.status}`)
      }

      // Start polling — UI will update as the job progresses
      setStatus('removing_bg')
      pollStatus(data.jobId)

    } catch (err) {
      if (!isMounted.current) return
      const message = err instanceof Error ? err.message : 'Failed to start enhancement'
      setStatus('failed')
      setError(message)
    }
  }, [pollStatus, stopPolling])

  const reset = useCallback(() => {
    stopPolling()
    setStatus('idle')
    setEnhancedUrl(null)
    setResult(null)
    setError(null)
    pollCount.current = 0
  }, [stopPolling])

  return { status, enhancedUrl, result, error, startEnhancement, reset }
}

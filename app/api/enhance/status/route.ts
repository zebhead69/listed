/**
 * app/api/enhance/status/route.ts
 *
 * GET /api/enhance/status?jobId=xxx
 * ──────────────────────────────────
 * Polling endpoint. Client calls this every 2s after POST /api/enhance
 * until status === 'complete' or 'failed'.
 *
 * Returns the job status and, on completion, the enhanced image URL.
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'jobId query param is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: job, error } = await supabase
    .from('enhancement_jobs')
    .select('id, status, result_path, result_url, result_width_px, result_height_px, result_bytes, error_message, updated_at')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // If complete, generate a fresh signed URL
  // (the one stored in the DB may be stale if the job finished a while ago)
  let enhancedUrl = job.result_url
  if (job.status === 'complete' && job.result_path) {
    const { data: signed } = await supabase.storage
      .from('assets')
      .createSignedUrl(job.result_path, 3600)  // fresh 1-hour URL

    if (signed?.signedUrl) {
      enhancedUrl = signed.signedUrl
    }
  }

  return NextResponse.json({
    jobId:        job.id,
    status:       job.status,
    updatedAt:    job.updated_at,
    // Only present on success
    ...(job.status === 'complete' && {
      enhancedUrl,
      widthPx:      job.result_width_px,
      heightPx:     job.result_height_px,
      fileSizeBytes: job.result_bytes,
    }),
    // Only present on failure
    ...(job.status === 'failed' && {
      error: job.error_message,
    }),
  })
}

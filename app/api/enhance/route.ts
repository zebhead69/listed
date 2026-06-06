/**
 * app/api/enhance/route.ts
 *
 * POST /api/enhance
 * ─────────────────
 * Creates an enhancement job and returns a jobId immediately.
 * The pipeline runs in the background.
 * The client polls GET /api/enhance/status?jobId=xxx for progress.
 *
 * This keeps the UI non-blocking — no waiting for a 20s API response.
 */

export const runtime    = 'nodejs'  // Sharp requires Node.js runtime
export const maxDuration = 60       // Safety net — background jobs should finish well within this

import { NextRequest, NextResponse } from 'next/server'
import { z }                         from 'zod'
import { createServerClient }        from '@/lib/supabase/server'
import { runJobInBackground }        from '@/lib/image/enhancementQueue'

const bodySchema = z.object({
  assetId:     z.string().uuid(),
  listingId:   z.string().uuid(),
  storagePath: z.string().min(1),
})

export async function POST(req: NextRequest) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { assetId, listingId, storagePath } = parsed.data
  const supabase = createServerClient()

  // ── Create job row ────────────────────────────────────────────────────────
  const { data: job, error: jobError } = await supabase
    .from('enhancement_jobs')
    .insert({
      asset_id:    assetId,
      listing_id:  listingId,
      status:      'uploading',
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    })
    .select('id')
    .single()

  if (jobError || !job) {
    console.error('[enhance] Failed to create job row:', jobError?.message)
    return NextResponse.json(
      { error: 'Failed to create enhancement job' },
      { status: 500 }
    )
  }

  // ── Kick off pipeline — non-blocking ──────────────────────────────────────
  runJobInBackground({
    jobId:       job.id,
    assetId,
    listingId,
    storagePath,
  })

  // ── Return jobId immediately — client polls /api/enhance/status ───────────
  return NextResponse.json(
    {
      jobId:   job.id,
      status:  'uploading',
      message: 'Enhancement started. Poll /api/enhance/status?jobId=' + job.id,
    },
    { status: 202 }  // 202 Accepted — processing has started, not complete
  )
}

/**
 * lib/image/enhancementQueue.ts
 *
 * Runs enhancement jobs in the background.
 * The API route returns a jobId immediately.
 * The client polls /api/enhance/status?jobId=xxx until complete.
 *
 * At MVP scale this works fine in a single serverless process.
 * At volume: replace runJobInBackground with a proper queue
 * (Supabase Edge Functions + pg_cron, Inngest, or Trigger.dev).
 */

import { enhanceProductPhoto } from '@/lib/image/enhance'
import { createServerClient }  from '@/lib/supabase/server'

export interface EnhancementJobInput {
  jobId:       string
  assetId:     string
  listingId:   string
  storagePath: string
}

// ─── Run one job, update DB at each stage ─────────────────────────────────────

export async function runEnhancementJob(input: EnhancementJobInput): Promise<void> {
  const supabase = createServerClient()

  const updateJob = async (
    status: string,
    extra: Record<string, unknown> = {}
  ) => {
    await supabase
      .from('enhancement_jobs')
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq('id', input.jobId)
  }

  const updateAsset = async (fields: Record<string, unknown>) => {
    await supabase
      .from('uploaded_assets')
      .update(fields)
      .eq('id', input.assetId)
  }

  try {
    // Generate a fresh signed URL for the source — don't rely on one
    // created at upload time, it may have expired by now
    await updateJob('removing_bg')
    await updateAsset({ upload_status: 'processing' })

    const { data: urlData, error: urlError } = await supabase.storage
      .from('assets')
      .createSignedUrl(input.storagePath, 600)  // 10 min — plenty for the pipeline

    if (urlError || !urlData?.signedUrl) {
      throw new Error('Could not generate signed URL for source asset')
    }

    const result = await enhanceProductPhoto(urlData.signedUrl, input.listingId)

    await updateJob('complete', {
      result_path:       result.enhancedStoragePath,
      result_url:        result.enhancedUrl,
      result_width_px:   result.widthPx,
      result_height_px:  result.heightPx,
      result_bytes:      result.fileSizeBytes,
    })

    await updateAsset({
      bg_removed_path: result.enhancedStoragePath,
      upload_status:   'ready',
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown enhancement error'
    console.error(`[enhancement-job:${input.jobId}]`, message)

    await updateJob('failed', { error_message: message }).catch(() => {
      // Don't throw if the status update itself fails — we've already logged
      console.error('[enhancement-job] Failed to update job status to failed')
    })

    await updateAsset({ upload_status: 'failed' }).catch(() => {})
  }
}

// ─── Fire-and-forget wrapper ──────────────────────────────────────────────────
//
// Kicks off the job without awaiting it.
// The API route returns immediately; the client polls for status.
//
// Note: In serverless environments (Vercel), Node.js processes may be
// torn down once the response is sent. For jobs > ~10s, use a proper
// background runner (see top of file).

export function runJobInBackground(input: EnhancementJobInput): void {
  runEnhancementJob(input).catch(err => {
    // Already logged inside runEnhancementJob — this is a last-resort catch
    console.error('[enhancement-queue] Unhandled background job error:', err)
  })
}

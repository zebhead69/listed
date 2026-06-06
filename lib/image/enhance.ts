/**
 * lib/image/enhance.ts
 *
 * Full studio enhancement pipeline:
 *   1. Fetch raw buffer
 *   2. Normalise + colour correct + sharpen + upscale (Sharp)
 *   3. Remove background (Replicate rembg) — with retry
 *   4. Composite on white canvas (Sharp)
 *   5. Upload to Supabase, return signed URL + metadata
 *
 * Runs server-side only. Never import this in client components.
 * All API routes using this must declare: export const runtime = 'nodejs'
 */

import sharp from 'sharp'
import Replicate from 'replicate'
import type { EnhancementResult } from '@/types/enhancement'

// Lazy-init so tests/non-enhancement routes don't pay the startup cost
let _replicate: Replicate | null = null
function getReplicate(): Replicate {
  if (!_replicate) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set')
    }
    _replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
  }
  return _replicate
}

// ─── Step 1: Fetch raw image buffer ──────────────────────────────────────────

export async function fetchImageBuffer(
  url: string,
  timeoutMs = 15_000
): Promise<Buffer> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } finally {
    clearTimeout(timer)
  }
}

// ─── Steps 2: Normalise, colour-correct, sharpen, upscale ────────────────────

export async function applyStudioEnhancements(inputBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(inputBuffer).metadata()

  if (!meta.width || !meta.height) {
    throw new Error('Cannot read image dimensions — file may be corrupt')
  }

  const shortEdge = Math.min(meta.width, meta.height)

  // Build pipeline — Sharp is lazy and chains without intermediate allocations
  let pipeline = sharp(inputBuffer)
    .normalise()                                        // stretch tonal range 0-255
    .modulate({ brightness: 1.03, saturation: 1.12 })  // lift + warm
    .sharpen({ sigma: 1.2, m1: 0.5, m2: 0.7, x1: 2, y2: 10, y3: 20 })
    .toColorspace('srgb')

  if (shortEdge < 800) {
    const scale = Math.ceil(800 / shortEdge)
    pipeline = pipeline.resize({
      width:  meta.width  * scale,
      height: meta.height * scale,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
  }

  return pipeline.png().toBuffer()
}

// ─── Step 3: Remove background (Replicate rembg) — with retry ────────────────
//
// rembg cold-starts in 3-8s and occasionally times out.
// We retry up to MAX_ATTEMPTS times with exponential backoff.
// On persistent failure we throw — callers should mark the job as failed.

const REMBG_VERSION =
  'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad658b4c190b5c7a47d3ec659'

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = [2_000, 5_000, 10_000]

export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  const base64  = imageBuffer.toString('base64')
  const dataUri = `data:image/png;base64,${base64}`

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const replicate = getReplicate()
      const output = await replicate.run(REMBG_VERSION, {
        input: {
          image:                               dataUri,
          alpha_matting:                       true,
          alpha_matting_foreground_threshold:  240,
          alpha_matting_background_threshold:  10,
          alpha_matting_erode_size:            10,
          only_mask:                           false,
        },
      }) as unknown as string  // returns a data URI

      if (!output || !output.includes(',')) {
        throw new Error('rembg returned an unexpected response format')
      }

      const base64Result = output.split(',')[1]
      return Buffer.from(base64Result, 'base64')

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(`[enhance] rembg attempt ${attempt + 1} failed:`, lastError.message)

      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS[attempt]))
      }
    }
  }

  throw new Error(`Background removal failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`)
}

// ─── Step 4: Composite subject on pure white canvas ───────────────────────────

export async function compositeOnWhite(
  rgbaBuffer: Buffer
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const meta = await sharp(rgbaBuffer).metadata()
  const w = meta.width  ?? 1000
  const h = meta.height ?? 1000

  // 6% padding on each side — standard for marketplace product photos
  const padX    = Math.round(w * 0.06)
  const padY    = Math.round(h * 0.06)
  const canvasW = w + padX * 2
  const canvasH = h + padY * 2

  // White canvas
  const whiteCanvas = await sharp({
    create: {
      width:      canvasW,
      height:     canvasH,
      channels:   3,
      background: { r: 255, g: 255, b: 255 },
    },
  }).png().toBuffer()

  // Flatten semi-transparent edges onto white before compositing
  // (avoids dark fringing when the subject has AA edges)
  const flattenedSubject = await sharp(rgbaBuffer)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer()

  const finalBuffer = await sharp(whiteCanvas)
    .composite([{
      input: flattenedSubject,
      left:  padX,
      top:   padY,
      blend: 'over',
    }])
    .jpeg({
      quality:           92,
      chromaSubsampling: '4:4:4',  // no chroma subsampling — keeps edge detail
      mozjpeg:           true,     // smaller file, same perceptual quality
    })
    .toBuffer()

  return { buffer: finalBuffer, width: canvasW, height: canvasH }
}

// ─── Step 5: Upload to Supabase Storage, return signed URL ───────────────────
//
// We generate a fresh signed URL here rather than caching one from earlier
// in the pipeline — URLs generated >5 min ago may have expired by now.

export async function uploadEnhanced(
  buffer: Buffer,
  listingId: string
): Promise<EnhancementResult> {
  // Dynamic import keeps this file importable in test environments
  // that don't have Supabase configured
  const { createServerClient } = await import('@/lib/supabase/server')
  const supabase = createServerClient()

  const filename    = `${Date.now()}-enhanced.jpg`
  const storagePath = `processed/listings/${listingId}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from('assets')
    .upload(storagePath, buffer, {
      contentType:  'image/jpeg',
      cacheControl: '3600',
      upsert:       false,
    })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`)
  }

  // Generate a fresh 1-hour signed URL
  const { data: signedData, error: signError } = await supabase.storage
    .from('assets')
    .createSignedUrl(storagePath, 3600)

  if (signError || !signedData?.signedUrl) {
    throw new Error('Failed to generate signed URL for enhanced image')
  }

  const meta = await sharp(buffer).metadata()

  return {
    enhancedStoragePath: storagePath,
    enhancedUrl:         signedData.signedUrl,
    widthPx:             meta.width  ?? 0,
    heightPx:            meta.height ?? 0,
    fileSizeBytes:       buffer.byteLength,
  }
}

// ─── Main export: full pipeline ───────────────────────────────────────────────

export async function enhanceProductPhoto(
  sourceUrl: string,
  listingId: string
): Promise<EnhancementResult> {
  // Each step throws on failure — callers catch and mark the job accordingly
  const rawBuffer      = await fetchImageBuffer(sourceUrl)
  const enhancedBuffer = await applyStudioEnhancements(rawBuffer)
  const rgbaBuffer     = await removeBackground(enhancedBuffer)
  const { buffer }     = await compositeOnWhite(rgbaBuffer)
  return uploadEnhanced(buffer, listingId)
}

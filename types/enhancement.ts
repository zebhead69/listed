export type EnhancementStatus =
  | 'idle'
  | 'uploading'
  | 'removing_bg'
  | 'enhancing'
  | 'compositing'
  | 'complete'
  | 'failed'

export interface EnhancedPhoto {
  id: string
  originalUrl: string
  enhancedUrl: string | null
  status: EnhancementStatus
  error?: string
}

export interface EnhancementResult {
  enhancedStoragePath: string
  enhancedUrl: string
  widthPx: number
  heightPx: number
  fileSizeBytes: number
}

// Job stored in DB so the client can poll for it
export interface EnhancementJob {
  id: string           // job UUID
  assetId: string
  listingId: string
  status: EnhancementStatus
  result: EnhancementResult | null
  error: string | null
  createdAt: string
  updatedAt: string
}

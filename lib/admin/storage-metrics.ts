import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { StorageBucketMetric, StorageMetrics } from '@/lib/admin/storage-types'

interface StorageListItem {
  id: string | null
  metadata: {
    size?: number
  } | null
  name: string
}

interface BucketCandidate {
  id: string
  name: string
}

const KNOWN_BUCKETS: BucketCandidate[] = [
  { id: 'wound-images', name: 'wound-images' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeRpcMetrics(payload: unknown): StorageMetrics | null {
  if (Array.isArray(payload)) {
    return payload.length > 0 ? normalizeRpcMetrics(payload[0]) : null
  }

  if (!isRecord(payload)) {
    return null
  }

  const buckets = Array.isArray(payload.buckets) ? payload.buckets : []
  const tables = Array.isArray(payload.tables) ? payload.tables : []

  return {
    buckets: buckets
      .filter(isRecord)
      .map((bucket) => ({
        bucket_id: String(bucket.bucket_id ?? bucket.name ?? ''),
        name: String(bucket.name ?? bucket.bucket_id ?? ''),
        object_count: Number(bucket.object_count ?? 0),
        size_bytes: Number(bucket.size_bytes ?? 0),
      }))
      .filter((bucket) => bucket.bucket_id.length > 0),
    database_metrics_available: true,
    database_size_bytes: Number(payload.database_size_bytes ?? 0),
    source: 'rpc',
    storage_metrics_available: true,
    storage_size_bytes: Number(payload.storage_size_bytes ?? 0),
    tables: tables
      .filter(isRecord)
      .map((table) => ({
        table_name: String(table.table_name ?? ''),
        size_bytes: Number(table.size_bytes ?? 0),
      }))
      .filter((table) => table.table_name.length > 0),
    warnings: [],
  }
}

async function listFolderEntries(
  supabase: SupabaseClient,
  bucketId: string,
  folderPath: string
) {
  const allEntries: StorageListItem[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(bucketId).list(folderPath, {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      throw error
    }

    const entries = (data ?? []) as StorageListItem[]
    allEntries.push(...entries)

    if (entries.length < 100) {
      return allEntries
    }

    offset += entries.length
  }
}

async function summarizeFolder(
  supabase: SupabaseClient,
  bucketId: string,
  folderPath = ''
): Promise<{ objectCount: number; sizeBytes: number }> {
  const entries = await listFolderEntries(supabase, bucketId, folderPath)

  let objectCount = 0
  let sizeBytes = 0

  for (const entry of entries) {
    const isFolder = entry.id === null || entry.metadata === null

    if (isFolder) {
      const childPath = folderPath ? `${folderPath}/${entry.name}` : entry.name
      const childSummary = await summarizeFolder(supabase, bucketId, childPath)
      objectCount += childSummary.objectCount
      sizeBytes += childSummary.sizeBytes
      continue
    }

    const metadata = entry.metadata

    objectCount += 1
    sizeBytes += metadata?.size ?? 0
  }

  return { objectCount, sizeBytes }
}

async function getBucketCandidates(
  supabase: SupabaseClient,
  warnings: string[]
) {
  const bucketMap = new Map<string, BucketCandidate>(
    KNOWN_BUCKETS.map((bucket) => [bucket.id, bucket])
  )

  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    warnings.push('Nao foi possivel listar buckets automaticamente. Usando buckets conhecidos do sistema.')
    return Array.from(bucketMap.values())
  }

  for (const bucket of data ?? []) {
    const id = bucket.id ?? bucket.name
    const name = bucket.name ?? bucket.id ?? 'bucket'

    if (!id) {
      continue
    }

    bucketMap.set(id, { id, name })
  }

  return Array.from(bucketMap.values())
}

async function summarizeBucket(
  supabase: SupabaseClient,
  bucket: BucketCandidate
): Promise<StorageBucketMetric | null> {
  try {
    const summary = await summarizeFolder(supabase, bucket.id)

    return {
      bucket_id: bucket.id,
      name: bucket.name,
      object_count: summary.objectCount,
      size_bytes: summary.sizeBytes,
    }
  } catch {
    return null
  }
}

export async function getStorageMetrics(supabase: SupabaseClient): Promise<StorageMetrics> {
  const warnings: string[] = []

  try {
    const { data, error } = await supabase.rpc('get_storage_metrics')

    if (error) {
      throw error
    }

    const normalized = normalizeRpcMetrics(data)

    if (normalized) {
      return normalized
    }

    warnings.push('O RPC retornou um formato inesperado. Aplicando fallback de producao.')
  } catch {
    warnings.push('Metricas avancadas do banco nao estao disponiveis neste ambiente. Aplicando fallback de producao.')
  }

  const bucketCandidates = await getBucketCandidates(supabase, warnings)
  const bucketMetrics = (
    await Promise.all(bucketCandidates.map((bucket) => summarizeBucket(supabase, bucket)))
  ).filter((bucket): bucket is StorageBucketMetric => bucket !== null)

  bucketMetrics.sort((left, right) => right.size_bytes - left.size_bytes)

  return {
    buckets: bucketMetrics,
    database_metrics_available: false,
    database_size_bytes: 0,
    source: 'fallback',
    storage_metrics_available: true,
    storage_size_bytes: bucketMetrics.reduce((total, bucket) => total + bucket.size_bytes, 0),
    tables: [],
    warnings,
  }
}

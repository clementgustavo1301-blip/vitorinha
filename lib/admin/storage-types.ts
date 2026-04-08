export interface StorageBucketMetric {
  bucket_id: string
  name: string
  object_count: number
  size_bytes: number
}

export interface StorageTableMetric {
  table_name: string
  size_bytes: number
}

export interface StorageMetrics {
  buckets: StorageBucketMetric[]
  database_metrics_available: boolean
  database_size_bytes: number
  source: 'rpc' | 'fallback'
  storage_metrics_available: boolean
  storage_size_bytes: number
  tables: StorageTableMetric[]
  warnings: string[]
}

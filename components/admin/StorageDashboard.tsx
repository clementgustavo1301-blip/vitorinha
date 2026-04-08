"use client"

import { useState } from 'react'
import { Activity, ChevronRight, Database, FolderOpen, HardDrive, Layers } from 'lucide-react'

import StorageFileExplorer from './StorageFileExplorer'
import type { StorageMetrics } from '@/lib/admin/storage-types'

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes || bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

interface StorageDashboardProps {
  data: StorageMetrics
  fetchMetrics?: () => void
}

export default function StorageDashboard({ data, fetchMetrics }: StorageDashboardProps) {
  const DB_LIMIT_BYTES = 500 * 1024 * 1024
  const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024

  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)

  const storagePercentage = data.storage_metrics_available
    ? (data.storage_size_bytes / STORAGE_LIMIT_BYTES) * 100
    : 0
  const dbPercentage = data.database_metrics_available
    ? (data.database_size_bytes / DB_LIMIT_BYTES) * 100
    : 0

  const formatPercent = (percentage: number) => {
    if (percentage === 0) {
      return '0%'
    }

    if (percentage < 0.1) {
      return '< 0.1%'
    }

    return `${percentage.toFixed(1)}%`
  }

  if (selectedBucket) {
    return (
      <StorageFileExplorer
        bucketId={selectedBucket}
        onClose={() => setSelectedBucket(null)}
        onDeleteSuccess={() => fetchMetrics?.()}
      />
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="neumorph-card group relative overflow-hidden border-l-4 border-[#A58079]/40 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-[#6B5C59]">Banco de Dados</p>
              <h3 className="text-2xl font-bold text-[#2D2422]">
                {data.database_metrics_available ? formatBytes(data.database_size_bytes) : 'Nao disponivel'}
              </h3>
            </div>
            <div className="rounded-2xl bg-[#A58079]/10 p-3 text-[#A58079]">
              <Database className="h-6 w-6" />
            </div>
          </div>

          {data.database_metrics_available ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#6B5C59]">
                <span>Uso do Plano Free (500MB)</span>
                <span className={dbPercentage > 80 ? 'font-bold text-red-500' : ''}>{formatPercent(dbPercentage)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E8DCDA]/40">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${dbPercentage > 80 ? 'bg-red-400' : 'bg-[#A58079]'}`}
                  style={{ width: `${Math.max(dbPercentage, 1)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="max-w-sm text-xs leading-relaxed text-[#6B5C59]">
              O tamanho detalhado do banco depende do RPC `get_storage_metrics`. Quando ele estiver disponivel no ambiente, este card volta a mostrar os valores completos.
            </p>
          )}

          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-[#A58079]/5 blur-2xl transition-colors group-hover:bg-[#A58079]/10" />
        </div>

        <div className="neumorph-card group relative overflow-hidden border-l-4 border-emerald-500/40 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-[#6B5C59]">Armazenamento de Arquivos</p>
              <h3 className="text-2xl font-bold text-[#2D2422]">
                {data.storage_metrics_available ? formatBytes(data.storage_size_bytes) : 'Nao disponivel'}
              </h3>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
              <HardDrive className="h-6 w-6" />
            </div>
          </div>

          {data.storage_metrics_available ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#6B5C59]">
                <span>Uso do Plano Free (1GB)</span>
                <span className={storagePercentage > 80 ? 'font-bold text-red-500' : ''}>{formatPercent(storagePercentage)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E8DCDA]/40">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${storagePercentage > 80 ? 'bg-red-400' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.max(storagePercentage, 1)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="max-w-sm text-xs leading-relaxed text-[#6B5C59]">
              As metricas de arquivos nao puderam ser calculadas neste momento.
            </p>
          )}

          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-colors group-hover:bg-emerald-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 px-2">
            <Layers className="h-5 w-5 text-[#A58079]" />
            <h4 className="text-lg font-bold text-[#2D2422]">Buckets de Armazenamento</h4>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.buckets.map((bucket) => (
              <div
                key={bucket.bucket_id}
                onClick={() => setSelectedBucket(bucket.bucket_id)}
                className="neumorph-card group flex cursor-pointer items-start justify-between border-[#A58079]/10 p-5 transition-all hover:border-[#A58079]/40 active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[#A58079]/10 p-3 text-[#A58079] shadow-inner transition-all group-hover:bg-[#A58079] group-hover:text-white">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#2D2422]">{bucket.name}</h4>
                    <p className="mt-1 text-xs font-medium text-[#6B5C59]">{bucket.object_count} arquivos no total</p>
                    <div className="mt-3 flex w-fit items-center gap-2 rounded-full bg-[#A58079]/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#A58079] transition-colors group-hover:bg-[#A58079]/10">
                      <HardDrive className="h-3 w-3" />
                      {formatBytes(bucket.size_bytes)}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#F9F7F6] p-2 text-[#A58079]/40 transition-all group-hover:text-[#A58079]">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}

            {data.buckets.length === 0 && (
              <div className="neumorph-card col-span-full border-dashed py-12 text-center italic text-[#6B5C59]">
                Nenhum bucket de armazenamento encontrado.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Activity className="h-5 w-5 text-[#A58079]" />
            <h4 className="text-lg font-bold text-[#2D2422]">Tabelas Maiores</h4>
          </div>

          <div className="neumorph-card space-y-4 border border-[#A58079]/10 bg-white/50 p-5">
            {data.tables.map((table, index) => (
              <div key={table.table_name} className="flex items-center justify-between border-b border-[#A58079]/5 py-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="w-4 text-[10px] font-bold italic tracking-tighter text-[#A58079]/40">#{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="max-w-[120px] truncate text-sm font-semibold text-[#2D2422]">{table.table_name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B5C59]">Postgres</span>
                  </div>
                </div>
                <span className="rounded-lg bg-[#A58079]/10 px-2.5 py-1 text-[11px] font-bold text-[#A58079]">
                  {formatBytes(table.size_bytes)}
                </span>
              </div>
            ))}

            {data.tables.length === 0 && (
              <div className="py-6 text-center text-xs italic text-[#6B5C59]">
                {data.database_metrics_available
                  ? 'Nenhuma tabela retornada para este ambiente.'
                  : 'Os detalhes de tabelas nao estao disponiveis enquanto o fallback estiver ativo.'}
              </div>
            )}

            <div className="border-t border-[#A58079]/5 pt-4">
              <div className="rounded-xl bg-[#A58079]/5 p-3">
                <p className="text-center text-[10px] leading-relaxed text-[#6B5C59]">
                  Os tamanhos refletem o espaco total em disco, incluindo dados, indices e tabelas TOAST.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

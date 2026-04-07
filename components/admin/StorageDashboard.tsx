"use client"

import React, { useState } from 'react'
import { Database, HardDrive, Image as ImageIcon, Activity, Layers, ChevronRight, FolderOpen } from 'lucide-react'
import StorageFileExplorer from './StorageFileExplorer'

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

interface StorageDashboardProps {
  data: {
    database_size_bytes: number
    storage_size_bytes: number
    buckets: Array<{
      bucket_id: string
      name: string
      size_bytes: number
      object_count: number
    }>
    tables: Array<{
      table_name: string
      size_bytes: number
    }>
  }
  fetchMetrics?: () => void
}

export default function StorageDashboard({ data, fetchMetrics }: StorageDashboardProps) {
  // Free plan limits (approximate for Supabase Free Tier)
  const DB_LIMIT_BYTES = 500 * 1024 * 1024 // 500MB
  const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024 // 1GB

  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)

  const storagePercentage = (data.storage_size_bytes / STORAGE_LIMIT_BYTES) * 100
  const dbPercentage = (data.database_size_bytes / DB_LIMIT_BYTES) * 100

  // Format percent for display
  const formatPercent = (pct: number) => {
    if (pct === 0) return '0%'
    if (pct < 0.1) return '< 0.1%'
    return pct.toFixed(1) + '%'
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Card */}
        <div className="neumorph-card p-6 border-l-4 border-[#A58079]/40 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#6B5C59] text-sm font-medium mb-1">Banco de Dados</p>
              <h3 className="text-2xl font-bold text-[#2D2422]">{formatBytes(data.database_size_bytes)}</h3>
            </div>
            <div className="p-3 bg-[#A58079]/10 rounded-2xl text-[#A58079]">
              <Database className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#6B5C59]">
              <span>Uso do Plano Free (500MB)</span>
              <span className={dbPercentage > 80 ? 'text-red-500 font-bold' : ''}>{formatPercent(dbPercentage)}</span>
            </div>
            <div className="h-2 bg-[#E8DCDA]/40 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${dbPercentage > 80 ? 'bg-red-400' : 'bg-[#A58079]'}`}
                style={{ width: `${Math.max(dbPercentage, 1)}%` }}
              />
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#A58079]/5 rounded-full blur-2xl group-hover:bg-[#A58079]/10 transition-colors" />
        </div>

        {/* File Storage Card */}
        <div className="neumorph-card p-6 border-l-4 border-emerald-500/40 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#6B5C59] text-sm font-medium mb-1">Armazenamento de Arquivos</p>
              <h3 className="text-2xl font-bold text-[#2D2422]">{formatBytes(data.storage_size_bytes)}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
              <HardDrive className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#6B5C59]">
              <span>Uso do Plano Free (1GB)</span>
              <span className={storagePercentage > 80 ? 'text-red-500 font-bold' : ''}>{formatPercent(storagePercentage)}</span>
            </div>
            <div className="h-2 bg-[#E8DCDA]/40 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${storagePercentage > 80 ? 'bg-red-400' : 'bg-emerald-500'}`}
                style={{ width: `${Math.max(storagePercentage, 1)}%` }}
              />
            </div>
          </div>
          
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Buckets Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Layers className="w-5 h-5 text-[#A58079]" />
            <h4 className="text-lg font-bold text-[#2D2422]">Buckets de Armazenamento</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.buckets.map((bucket) => (
              <div 
                key={bucket.name} 
                onClick={() => setSelectedBucket(bucket.bucket_id)}
                className="neumorph-card p-5 border-[#A58079]/10 hover:border-[#A58079]/40 transition-all group flex items-start justify-between cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#A58079]/10 rounded-2xl text-[#A58079] shadow-inner group-hover:bg-[#A58079] group-hover:text-white transition-all">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2D2422] uppercase tracking-wider">{bucket.name}</h4>
                    <p className="text-xs text-[#6B5C59] mt-1 font-medium">{bucket.object_count} arquivos no total</p>
                    <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-[#A58079] uppercase tracking-widest px-2 py-0.5 bg-[#A58079]/5 rounded-full w-fit group-hover:bg-[#A58079]/10 transition-colors">
                       <HardDrive className="w-3 h-3" />
                       {formatBytes(bucket.size_bytes)}
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#F9F7F6] text-[#A58079]/40 group-hover:text-[#A58079] transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
            
            {data.buckets.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#6B5C59] italic neumorph-card border-dashed">
                Nenhum bucket de armazenamento encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Database Tables Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Activity className="w-5 h-5 text-[#A58079]" />
            <h4 className="text-lg font-bold text-[#2D2422]">Tabelas Maiores</h4>
          </div>
          
          <div className="neumorph-card p-5 space-y-4 bg-white/50 border border-[#A58079]/10">
            {data.tables.map((table, idx) => (
              <div key={table.table_name} className="flex items-center justify-between py-2 border-b border-[#A58079]/5 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#A58079]/40 w-4 tracking-tighter italic">#{idx + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#2D2422] truncate max-w-[120px]">{table.table_name}</span>
                    <span className="text-[9px] text-[#6B5C59] uppercase tracking-widest font-bold">Postgres</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#A58079] bg-[#A58079]/10 px-2.5 py-1 rounded-lg">
                  {formatBytes(table.size_bytes)}
                </span>
              </div>
            ))}
            
            {data.tables.length === 0 && (
              <div className="py-6 text-center text-[#6B5C59] text-xs italic">
                Dados de tabelas não disponíveis.
              </div>
            )}
            
            <div className="pt-4 border-t border-[#A58079]/5">
              <div className="bg-[#A58079]/5 p-3 rounded-xl">
                 <p className="text-[10px] text-[#6B5C59] leading-relaxed text-center">
                  Os tamanhos refletem o espaço total em disco, incluindo **dados, índices e tabelas TOAST**.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

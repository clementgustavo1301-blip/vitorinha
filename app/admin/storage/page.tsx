"use client"

import { useCallback, useEffect, useState } from 'react'
import { Activity, AlertCircle, HardDrive, RefreshCw } from 'lucide-react'

import StorageDashboard from '@/components/admin/StorageDashboard'
import { useRole } from '@/components/layout/RoleContext'
import type { StorageMetrics } from '@/lib/admin/storage-types'

async function requestStorageMetrics() {
  const response = await fetch('/api/admin/storage', {
    cache: 'no-store',
  })

  const payload = (await response.json()) as StorageMetrics | { error?: string }

  if (!response.ok) {
    throw new Error('error' in payload ? payload.error || 'Falha ao carregar metricas.' : 'Falha ao carregar metricas.')
  }

  return payload as StorageMetrics
}

export default function StorageManagementPage() {
  const [data, setData] = useState<StorageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { role } = useRole()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const metrics = await requestStorageMetrics()
      setData(metrics)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar metricas de armazenamento.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (role === 'admin') {
      void fetchData()
      return
    }

    setLoading(false)
    setData(null)
  }, [fetchData, role])

  if (role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[40px] border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#2D2422]">Acesso Negado</h2>
        <p className="mt-2 max-w-md text-[#6B5C59]">
          Esta pagina e restrita a usuarios com perfil de Gestor ou Administrador.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1514]">Gerenciamento de Armazenamento</h1>
          <p className="mt-1 flex items-center gap-2 text-[#6B5C59]">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Monitoramento de Infraestrutura</span>
          </p>
        </div>

        <button
          onClick={() => void fetchData()}
          disabled={loading}
          className="neumorph-button group flex items-center gap-2 whitespace-nowrap"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : 'transition-transform duration-500 group-active:rotate-180'}`} />
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {data?.warnings.length ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-900 shadow-sm">
          <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-widest text-amber-700">
            <AlertCircle className="h-4 w-4" />
            Modo de compatibilidade
          </div>
          <p>{data.warnings.join(' ')}</p>
        </div>
      ) : null}

      {error ? (
        <div className="neumorph-card border-red-100 bg-red-50/30 p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-lg font-bold text-red-800">Erro de Conexao</h3>
          <p className="mb-6 mt-2 text-red-700/70">{error}</p>
          <button onClick={() => void fetchData()} className="neumorph-button-outline px-8">Tentar Novamente</button>
        </div>
      ) : loading && !data ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-24">
          <div className="relative">
            <Activity className="h-12 w-12 animate-spin text-[#A58079] opacity-20" />
            <HardDrive className="absolute inset-0 m-auto h-6 w-6 animate-pulse text-[#A58079] opacity-80" />
          </div>
          <p className="animate-pulse text-sm font-bold uppercase tracking-wide text-[#A58079]">Calculando armazenamento...</p>
        </div>
      ) : data ? (
        <StorageDashboard data={data} fetchMetrics={() => void fetchData()} />
      ) : null}

      <div className="border-t border-[#A58079]/5 py-6 text-center">
        <p className="mx-auto max-w-xl px-4 text-[10px] font-bold uppercase tracking-widest leading-relaxed text-[#6B5C59]/60">
          {data?.source === 'fallback'
            ? 'Este ambiente esta exibindo metricas de producao com fallback seguro. O detalhamento completo do banco volta automaticamente quando o RPC get_storage_metrics existir no Supabase.'
            : 'Os dados apresentados sao sincronizados diretamente com o cluster do Supabase. O uso de armazenamento e atualizado conforme novos registros e arquivos sao adicionados ao sistema.'}
        </p>
      </div>
    </div>
  )
}

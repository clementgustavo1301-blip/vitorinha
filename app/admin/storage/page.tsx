"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/layout/RoleContext'
import { HardDrive, Activity, RefreshCw, AlertCircle } from 'lucide-react'
import StorageDashboard from '@/components/admin/StorageDashboard'

export default function StorageManagementPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { role } = useRole()
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: metrics, error: rpcError } = await supabase.rpc('get_storage_metrics')
      
      if (rpcError) throw rpcError
      setData(metrics)
    } catch (err: any) {
      console.error('Error fetching storage metrics:', err)
      setError(err.message || 'Erro ao carregar métricas de armazenamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (role === 'admin') {
      fetchData()
    }
  }, [role])

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-[40px] border border-red-100 shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#2D2422]">Acesso Negado</h2>
        <p className="text-[#6B5C59] mt-2 max-w-md">
          Esta página é restrita a usuários com perfil de **Gestor/Administrador**.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1514] tracking-tight">Gerenciamento de Armazenamento</h1>
          <p className="text-[#6B5C59] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-bold">Monitoramento de Infraestrutura</span>
          </p>
        </div>
        
        <button 
          onClick={fetchData}
          disabled={loading}
          className="neumorph-button flex items-center gap-2 group whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-active:rotate-180 transition-transform duration-500'}`} />
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {error ? (
        <div className="p-12 text-center neumorph-card border-red-100 bg-red-50/30">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800">Erro de Conexão</h3>
          <p className="text-red-700/70 mt-2 mb-6">{error}</p>
          <button onClick={fetchData} className="neumorph-button-outline px-8">Tentar Novamente</button>
        </div>
      ) : loading && !data ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="relative">
            <Activity className="w-12 h-12 text-[#A58079] animate-spin opacity-20" />
            <HardDrive className="w-6 h-6 text-[#A58079] opacity-80 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-[#A58079] font-bold text-sm animate-pulse tracking-wide uppercase">Calculando armazenamento...</p>
        </div>
      ) : data ? (
        <StorageDashboard data={data} fetchMetrics={fetchData} />
      ) : null}
      
      {/* Footer info */}
      <div className="text-center py-6 border-t border-[#A58079]/5">
        <p className="text-[10px] text-[#6B5C59]/60 max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-bold px-4">
          Os dados apresentados são sincronizados diretamente com o cluster do Supabase. 
          O uso de armazenamento é atualizado conforme novos registros e arquivos são adicionados ao sistema.
        </p>
      </div>
    </div>
  )
}

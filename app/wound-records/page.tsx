"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, FileText, Search, Activity, ArrowRight, User, Plus } from 'lucide-react'

export default function WoundRecordsPage() {
  const supabase = createClient()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('wound_records')
        .select(`
          id,
          created_at,
          location,
          pain_level,
          tissue_type,
          exudate,
          patient_id,
          patients (full_name)
        `)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRecords(data)
      }
      setLoading(false)
    }

    fetchRecords()
  }, [supabase])

  const filteredRecords = records.filter(record => {
    const searchLower = search.toLowerCase()
    const patientName = record.patients?.full_name?.toLowerCase() || ''
    const locationName = record.location?.toLowerCase() || ''
    return patientName.includes(searchLower) || locationName.includes(searchLower)
  })

  return (
    <div className="space-y-5 md:space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1514]">Evoluções Globais</h1>
          <p className="text-sm md:text-base text-[#6B5C59] mt-0.5">Busca rápida em todos os prontuários ativos.</p>
        </div>
        <Link href="/patients" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-5 md:px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm md:text-base active:scale-95 md:active:scale-100">
          <User className="h-4 w-4" /> 
          <span className="hidden sm:inline">Buscar Paciente</span>
          <span className="sm:hidden">Novo Registro</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-[#A58079]/10 shadow-sm space-y-5 md:space-y-6 text-center md:text-left">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A58079] group-focus-within:scale-110 transition-transform" />
          <input
            type="text"
            placeholder="Nome do paciente ou local da lesão..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl py-4 pl-12 pr-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5 transition-all font-sans shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <Activity className="w-10 h-10 md:w-12 md:h-12 text-[#A58079]/20 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-bold text-[#2D2422]">Nenhum registro encontrado</h3>
            <p className="text-xs md:text-sm text-[#6B5C59] mt-2">Tente buscar por termos mais genéricos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredRecords.map((record) => {
              const date = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
              const patientName = record.patients?.full_name || 'Paciente'
              const initials = patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

              return (
                <Link 
                  key={record.id} 
                  href={`/patients/${record.patient_id}`}
                  className="bg-[#F9F7F6] rounded-2xl md:rounded-3xl border border-[#A58079]/10 p-4 md:p-5 hover:shadow-lg hover:border-[#A58079]/40 transition-all group flex flex-col justify-between h-full active:scale-[0.98] md:active:scale-100"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#A58079] border border-[#A58079]/20 shadow-sm uppercase tracking-wider">
                        {date}
                      </span>
                      {record.pain_level > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                          Dor: {record.pain_level}/10
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#A58079] text-white flex items-center justify-center font-bold text-xs md:text-sm shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        {initials}
                      </div>
                      <h3 className="font-bold text-[#2D2422] truncate text-sm md:text-base">{patientName}</h3>
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-sm font-bold text-[#1A1514] truncate ">{record.location}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {record.tissue_type && <span className="text-[9px] md:text-xs px-2 py-0.5 bg-white rounded-md text-[#6B5C59] border border-[#A58079]/10 font-bold uppercase tracking-tight">{record.tissue_type}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#A58079]/10 flex items-center justify-between text-[11px] md:text-xs font-bold text-[#A58079] uppercase tracking-wide group-hover:text-[#8C6A63] transition-colors">
                    Ver Prontuário Completo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

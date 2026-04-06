"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, FileText, Search, Activity, ArrowRight, User } from 'lucide-react'

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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1514]">Evoluções Globais</h1>
          <p className="text-[#6B5C59] mt-1">Busque rapidamente por qualquer prontuário recente.</p>
        </div>
        <Link href="/patients" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2">
          <User className="h-4 w-4" /> Buscar Paciente Específico
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#A58079]/10 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A58079]/60" />
          <input
            type="text"
            placeholder="Buscar por nome do paciente ou local da lesão..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl py-4 pl-12 pr-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-[#A58079]/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#2D2422]">Nenhuma evolução encontrada</h3>
            <p className="text-[#6B5C59] mt-2">Nenhum prontuário corresponde à sua busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecords.map((record) => {
              const date = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
              const patientName = record.patients?.full_name || 'Paciente Não Encontrado'
              const initials = patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

              return (
                <div key={record.id} className="bg-[#F9F7F6] rounded-3xl border border-[#A58079]/10 p-5 hover:shadow-md hover:border-[#A58079]/30 transition-all group flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#A58079] border border-[#A58079]/20 shadow-sm">
                        {date}
                      </span>
                      <div className="flex gap-1">
                        {record.pain_level > 0 && (
                          <span title="Nível de Dor" className="text-[10px] font-bold text-[#A58079]/80 bg-red-100/50 px-2 py-0.5 rounded-md">
                            Dor: {record.pain_level}/10
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#A58079] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                        {initials}
                      </div>
                      <h3 className="font-bold text-[#2D2422] truncate">{patientName}</h3>
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-sm font-semibold text-[#1A1514]">{record.location}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {record.tissue_type && <span className="text-[10px] px-2 py-0.5 bg-white rounded text-[#6B5C59] border border-[#A58079]/10">{record.tissue_type}</span>}
                        {record.exudate && <span className="text-[10px] px-2 py-0.5 bg-white rounded text-[#6B5C59] border border-[#A58079]/10">{record.exudate}</span>}
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/patients/${record.patient_id}`} 
                    className="mt-4 pt-3 border-t border-[#A58079]/10 flex items-center justify-between text-sm font-semibold text-[#A58079] group-hover:text-[#8C6A63] transition-colors"
                  >
                    Ver Linha do Tempo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

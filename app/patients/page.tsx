"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, MapPin, Phone, Loader2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PatientsPage() {
  const supabase = createClient()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setPatients(data || [])
      setLoading(false)
    }
    fetchPatients()
  }, [supabase])

  const filtered = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.cpf?.includes(search.replace(/\D/g, ''))
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1514]">Pacientes e Prontuários</h1>
          <p className="text-[#6B5C59] mt-0.5 text-sm md:text-base">Gerencie históricos de saúde e evoluções.</p>
        </div>
        <Link 
          href="/attendances/new" 
          className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-5 md:px-6 py-2.5 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2 text-sm md:text-base active:scale-95 md:active:scale-100"
        >
          <Plus className="h-4 w-4" /> Novo Atendimento
        </Link>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-[#A58079]/10 shadow-sm">
        <div className="relative w-full md:max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A58079]" />
          <input 
            type="text" 
            placeholder="Buscar por nome, telefone ou CPF..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-full pl-11 pr-4 py-3 md:py-2 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 md:py-12">
            <Users className="w-10 h-10 md:w-12 md:h-12 text-[#A58079]/20 mx-auto mb-4" />
            <h2 className="text-base md:text-lg font-bold text-[#2D2422]">{search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}</h2>
            <p className="text-xs md:text-sm text-[#6B5C59] mt-2">{search ? 'Refine sua busca.' : 'Cadastre pacientes através do agendamento.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filtered.map(patient => {
              const initials = patient.full_name
                ? patient.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : '??'
              return (
                <Link key={patient.id} href={`/patients/${patient.id}`} className="block border border-[#A58079]/10 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-[#F9F7F6] hover:bg-white transition-all shadow-sm active:scale-[0.98] md:active:scale-100 hover:shadow-md">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#A58079]/10 flex flex-shrink-0 items-center justify-center font-bold text-[#A58079] text-base md:text-lg">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#2D2422] text-base md:text-lg leading-tight truncate">{patient.full_name}</h3>
                      {patient.date_of_birth && (
                        <p className="text-[11px] md:text-sm text-[#6B5C59] mt-0.5">Nasc: {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}</p>
                      )}
                      <div className="mt-2.5 md:mt-3 space-y-1 md:space-y-1.5">
                        {patient.phone && (
                          <div className="flex items-center gap-2 text-[11px] md:text-sm text-[#6B5C59]">
                            <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#A58079]" />
                            <span className="truncate">{patient.phone}</span>
                          </div>
                        )}
                        {patient.address && (
                          <div className="flex items-start gap-2 text-[11px] md:text-sm text-[#6B5C59]">
                            <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#A58079] flex-shrink-0 mt-0.5" />
                            <span className="truncate">{patient.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
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

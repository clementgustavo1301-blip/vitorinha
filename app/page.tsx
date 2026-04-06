"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserPlus, Activity, CalendarCheck, TrendingUp, Loader2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import HybridCalendar from '@/components/calendar/HybridCalendar'

export default function Dashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({ todayAppts: 0, totalPatients: 0, totalRecords: 0 })
  const [nextAppts, setNextAppts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      const now = new Date()
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

      const [apptToday, patientsAll, recordsAll, upcoming] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('scheduled_at', todayStart.toISOString()).lte('scheduled_at', todayEnd.toISOString()),
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('wound_records').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('*, patients (full_name, address)').gte('scheduled_at', todayStart.toISOString()).order('scheduled_at', { ascending: true }).limit(5)
      ])

      setStats({
        todayAppts: apptToday.count || 0,
        totalPatients: patientsAll.count || 0,
        totalRecords: recordsAll.count || 0,
      })
      setNextAppts(upcoming.data || [])
      setLoading(false)
    }
    fetchDashboard()
  }, [supabase])

  const statCards = [
    { label: 'Consultas Hoje', value: String(stats.todayAppts), icon: CalendarCheck, color: 'text-[#A58079]' },
    { label: 'Pacientes Cadastrados', value: String(stats.totalPatients), icon: UserPlus, color: 'text-[#2D2422]' },
    { label: 'Evoluções Registradas', value: String(stats.totalRecords), icon: Activity, color: 'text-[#A58079]' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1514]">Olá 👋</h1>
          <p className="text-[#6B5C59] mt-1">Aqui está o resumo dos seus atendimentos.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-[#A58079]/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#6B5C59] font-medium text-sm">{stat.label}</span>
                  <div className={`p-2 rounded-xl bg-[#F9F7F6] border border-[#A58079]/10 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-3xl font-bold text-[#2D2422]">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#A58079]/10 shadow-sm">
              <h2 className="text-lg font-bold text-[#1A1514] mb-4">Próximos Atendimentos</h2>
              
              {nextAppts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-[#A58079]/20 mx-auto mb-3" />
                  <p className="text-[#6B5C59] font-medium">Nenhum atendimento agendado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nextAppts.map((appt) => {
                    const dateTime = new Date(appt.scheduled_at)
                    const time = dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    const date = dateTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    const name = appt.patients?.full_name || 'Paciente'
                    const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    const isHome = appt.type === 'home'

                    return (
                      <Link 
                        href={`/patients/${appt.patient_id}?new=true&appointment_id=${appt.id}`}
                        key={appt.id} 
                        className={`p-4 rounded-2xl bg-[#F9F7F6] border ${isHome ? 'border-[#2D2422]/20' : 'border-[#A58079]/20'} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer block`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full ${isHome ? 'bg-[#2D2422]/10 text-[#2D2422] border-[#2D2422]/20' : 'bg-[#A58079]/10 text-[#A58079] border-[#A58079]/20'} flex items-center justify-center font-bold border group-hover:scale-105 transition`}>{initials}</div>
                          <div>
                            <h3 className="font-semibold text-[#2D2422] group-hover:text-[#A58079] transition-colors">{name}</h3>
                            <p className="text-sm text-[#6B5C59]">{appt.notes || (isHome ? 'Domiciliar' : 'Clínica')} ({date} às {time})</p>
                          </div>
                        </div>
                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${isHome ? 'bg-[#2D2422]/10 text-[#2D2422] border-[#2D2422]/20' : 'bg-[#A58079]/10 text-[#A58079] border-[#A58079]/20'} border`}>
                          {isHome ? 'Domiciliar' : 'Clínica'}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 relative overflow-hidden border border-[#A58079]/10 shadow-sm">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#A58079]/10 rounded-full blur-2xl"></div>
              <h2 className="text-lg font-bold text-[#1A1514] mb-4">Calendário Rápido</h2>
              <HybridCalendar />
              <Link href="/calendar" className="block text-center mt-4 text-sm font-semibold text-[#A58079] hover:underline">
                Ver agenda completa &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

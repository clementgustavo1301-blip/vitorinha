"use client"
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Calendar, Clock, Plus } from 'lucide-react'
import HybridCalendar from '@/components/calendar/HybridCalendar'
import AppointmentBadge from '@/components/calendar/AppointmentBadge'

export default function CalendarPage() {
  const supabase = createClient()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
      const fetchAppointments = async () => {
      setLoading(true)
      const targetDate = selectedDate || new Date()
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients (full_name, address)')
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .order('scheduled_at', { ascending: true })

      if (!error) setAppointments(data || [])
      setLoading(false)
    }
    fetchAppointments()
  }, [supabase, selectedDate])

  const dateText = selectedDate 
    ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    : 'Selecione uma data'

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1514]">Agenda Híbrida</h1>
          <p className="text-[#6B5C59] mt-0.5 text-sm hidden sm:block">Gerencie consultas em clínica e domicílio.</p>
        </div>
        <Link 
          href="/appointments/new" 
          className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-4 md:px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-1.5 text-sm md:text-base shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <HybridCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-[#A58079]/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
            <h2 className="text-base md:text-lg font-bold text-[#1A1514]">Atendimentos do Dia</h2>
            <span className="text-xs md:text-sm font-semibold text-[#A58079] bg-[#A58079]/10 px-3 py-1 rounded-full capitalize self-start sm:self-auto">{dateText}</span>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 md:py-12">
              <Clock className="w-10 h-10 md:w-12 md:h-12 text-[#A58079]/20 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-bold text-[#2D2422]">Nenhum atendimento hoje</h3>
              <p className="text-[#6B5C59] mt-1.5 md:mt-2 text-sm">Agende um novo atendimento para começar.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {appointments.map((appt) => {
                const time = new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const patientName = appt.patients?.full_name || 'Paciente'
                const initials = patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                const isHome = appt.type === 'home'

                return (
                  <div 
                    key={appt.id} 
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F9F7F6] border ${isHome ? 'border-[#2D2422]/20' : 'border-[#A58079]/20'} flex items-center gap-3 md:gap-4 transition hover:shadow-md active:scale-[0.98] md:active:scale-100 md:hover:-translate-y-0.5 group relative`}
                  >
                    {/* Attendance Link (Background) */}
                    <Link 
                      href={`/patients/${appt.patient_id}?new=true&appointment_id=${appt.id}`}
                      className="absolute inset-0 z-0 rounded-xl md:rounded-2xl"
                      title="Registrar Atendimento"
                    />

                    {/* Time / Type Link */}
                    <Link 
                      href={`/patients/${appt.patient_id}?new=true&appointment_id=${appt.id}`}
                      className={`relative z-10 w-11 h-11 md:w-14 md:h-14 rounded-full ${isHome ? 'bg-[#2D2422]/10 text-[#2D2422] border-[#2D2422]/20' : 'bg-[#A58079]/10 text-[#A58079] border-[#A58079]/20'} flex flex-col items-center justify-center font-bold border transition hover:scale-110 shrink-0 shadow-sm`}
                      title="Registrar Atendimento"
                    >
                      <span className="text-xs md:text-sm">{time}</span>
                    </Link>

                    <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                      <Link 
                        href={`/patients/${appt.patient_id}`}
                        className="pointer-events-auto inline-block max-w-full"
                        title="Ver Prontuário"
                      >
                        <h3 className="font-semibold text-[#2D2422] hover:text-[#A58079] transition-colors text-sm md:text-base truncate">{patientName}</h3>
                      </Link>
                      {appt.notes && <p className="text-xs md:text-sm text-[#6B5C59] mt-0.5 truncate">{appt.notes}</p>}
                      {isHome && appt.patients?.address && (
                        <p className="text-xs text-[#6B5C59] mt-0.5 truncate">{appt.patients.address}</p>
                      )}
                    </div>

                    <div className="shrink-0 hidden sm:block relative z-10">
                      <AppointmentBadge type={appt.type} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

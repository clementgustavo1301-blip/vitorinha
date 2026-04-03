import HybridCalendar from '@/components/calendar/HybridCalendar'
import AppointmentBadge from '@/components/calendar/AppointmentBadge'
import Link from 'next/link'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1514]">Agenda Híbrida</h1>
          <p className="text-[#6B5C59] mt-1">Gerencie consultas em clínica e domicílio.</p>
        </div>
        <Link 
          href="/appointments/new" 
          className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2"
        >
          + Novo Agendamento
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HybridCalendar />
        </div>
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#A58079]/10 shadow-sm">
          <h2 className="text-lg font-bold text-[#1A1514] mb-6">Atendimentos do Dia</h2>
          
          <div className="space-y-4">
            {/* Example List */}
            <div className="p-4 rounded-2xl bg-[#F9F7F6] border border-[#A58079]/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#A58079]/10 flex flex-col items-center justify-center font-bold text-[#A58079] border border-[#A58079]/20">
                  <span className="text-sm">14:00</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2422]">Maria Silva</h3>
                  <p className="text-sm text-[#6B5C59] mt-1">Primeira Consulta - Úlcera</p>
                </div>
              </div>
              <AppointmentBadge type="clinic" />
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F7F6] border border-[#2D2422]/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2D2422]/10 flex flex-col items-center justify-center font-bold text-[#2D2422] border border-[#2D2422]/20">
                  <span className="text-sm">16:30</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2422]">João Oliveira</h3>
                  <p className="text-sm text-[#6B5C59] mt-1">Troca de curativo</p>
                  <p className="text-xs text-[#6B5C59] flex items-center gap-1 mt-1">
                    <span className="truncate max-w-[200px] inline-block">R. das Flores, 123</span>
                  </p>
                </div>
              </div>
              <AppointmentBadge type="home" />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Calendar } from 'lucide-react'

export default function AppointmentsPage() {
  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-[#1A1514]">Agendamentos Consolidados</h1>
        <Link href="/calendar" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm md:text-base active:scale-95">
          <Calendar className="w-4 h-4" /> Ver Calendário
        </Link>
      </div>
      <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 text-center text-[#6B5C59] flex flex-col items-center border border-[#A58079]/10 shadow-sm space-y-2">
        <span className="font-bold text-[#1A1514] text-lg">Histórico de Atendimentos</span>
        <span className="text-sm md:text-base">Os apontamentos e históricos consolidados estarão listados aqui.</span>
        <span className="text-xs md:text-sm opacity-70 italic font-medium">A visualização primária e detalhada já está disponível no seu Calendário Híbrido!</span>
      </div>
    </div>
  )
}

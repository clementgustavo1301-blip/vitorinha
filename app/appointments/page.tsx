import Link from 'next/link'

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1514]">Agendamentos Resolvidos</h1>
        <Link href="/calendar" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2">Ver Calendário</Link>
      </div>
      <div className="bg-white rounded-3xl p-8 text-center text-[#6B5C59] flex flex-col items-center border border-[#A58079]/10 shadow-sm">
        <span>Os apontamentos e históricos consolidados estarão listados aqui.</span>
        <span>A visualização primária já está no seu Calendário Híbrido!</span>
      </div>
    </div>
  )
}

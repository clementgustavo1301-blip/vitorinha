import { UserPlus, Activity, CalendarCheck, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import HybridCalendar from '@/components/calendar/HybridCalendar'

export default function Dashboard() {
  const stats = [
    { label: 'Consultas Hoje', value: '4', icon: CalendarCheck, color: 'text-[#A58079]' },
    { label: 'Novos Pacientes', value: '12', icon: UserPlus, color: 'text-[#2D2422]' },
    { label: 'Feridas em Cicatrização', value: '28', icon: Activity, color: 'text-[#A58079]' },
    { label: 'Taxa de Alta', value: '15%', icon: TrendingUp, color: 'text-[#1A1514]' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1514]">Olá 👋</h1>
          <p className="text-[#6B5C59] mt-1">Aqui está o resumo dos seus atendimentos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
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
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F9F7F6] border border-[#A58079]/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#A58079]/10 flex items-center justify-center font-bold text-[#A58079] border border-[#A58079]/20">MS</div>
                <div>
                  <h3 className="font-semibold text-[#2D2422]">Maria Silva</h3>
                  <p className="text-sm text-[#6B5C59]">Desbridamento de úlcera (14:00)</p>
                </div>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#A58079]/10 text-[#A58079] border border-[#A58079]/20">
                Atendimento em Clínica
              </span>
            </div>
            
            <div className="p-4 rounded-2xl bg-[#F9F7F6] border border-[#2D2422]/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2D2422]/10 flex items-center justify-center font-bold text-[#2D2422] border border-[#2D2422]/20">JO</div>
                <div>
                  <h3 className="font-semibold text-[#2D2422]">João Oliveira</h3>
                  <p className="text-sm text-[#6B5C59]">Troca de curativo (16:30)</p>
                </div>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2D2422]/10 text-[#2D2422] border border-[#2D2422]/20">
                Atendimento Domiciliar
              </span>
            </div>
          </div>
          
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
    </div>
  )
}

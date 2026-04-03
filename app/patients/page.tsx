import Link from 'next/link'
import { Plus, Search, MapPin, Phone } from 'lucide-react'

export default function PatientsPage() {
  // Mock patients for UI demonstration
  const patients = [
    { id: '1', name: 'Maria Silva', age: '68', address: 'Rua das Acácias, 123', phone: '(11) 98765-4321', nextAppt: 'Hoje, 14:00 (Clínica)' },
    { id: '2', name: 'João Oliveira', age: '54', address: 'Rua Bela Vista, 90', phone: '(11) 91234-5678', nextAppt: 'Hoje, 16:30 (Domiciliar)' },
    { id: '3', name: 'Carlos Santos', age: '72', address: 'Av. Paulista, 1000', phone: '(11) 99887-6655', nextAppt: 'Amanhã, 10:00 (Clínica)' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1514]">Pacientes</h1>
          <p className="text-[#6B5C59] mt-1">Gerencie os históricos e anamneses.</p>
        </div>
        <Link 
          href="/patients/new" 
          className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Paciente
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#A58079]/10 shadow-sm">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A58079]" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-full pl-10 pr-4 py-2 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patients.map(patient => (
            <Link key={patient.id} href={`/patients/${patient.id}`} className="block border border-[#A58079]/10 p-5 rounded-3xl bg-[#F9F7F6] hover:bg-white transition-all shadow-sm hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#A58079]/10 flex flex-shrink-0 items-center justify-center font-bold text-[#A58079] text-lg">
                  {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-[#2D2422] text-lg leading-tight">{patient.name}</h3>
                  <p className="text-sm text-[#6B5C59] mt-1">{patient.age} anos</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[#6B5C59]">
                      <Phone className="h-4 w-4 text-[#A58079]" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-[#6B5C59]">
                      <MapPin className="h-4 w-4 text-[#A58079] flex-shrink-0 mt-0.5" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#A58079]/10">
                <p className="text-xs font-semibold text-[#2D2422] uppercase tracking-wider">Próximo Atendimento</p>
                <p className="text-sm font-medium text-[#A58079] mt-1">{patient.nextAppt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

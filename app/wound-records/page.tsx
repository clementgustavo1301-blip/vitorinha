import Link from 'next/link'

export default function WoundRecordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1514]">Geral de Prontuários</h1>
        <Link href="/patients" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2">Buscar Paciente Específico</Link>
      </div>
      <div className="bg-white rounded-3xl border border-[#A58079]/10 shadow-sm p-8 text-center text-[#6B5C59] flex flex-col items-center">
        <span>Esta visualização agregada focará na pesquisa global de feridas.</span>
        <span>Recomendamos gerenciar os prontuários diretamente da página do paciente.</span>
      </div>
    </div>
  )
}

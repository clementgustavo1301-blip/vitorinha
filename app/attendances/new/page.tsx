import AppointmentForm from '@/components/appointments/AppointmentForm'

export default function SpontaneousAttendancePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1514]">Atendimento Espontâneo</h1>
        <p className="text-[#6B5C59] mt-1">Inicie um atendimento imediato (sem horário pré-agendado).</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#A58079]/10 shadow-sm">
        <AppointmentForm mode="immediate" />
      </div>
    </div>
  )
}

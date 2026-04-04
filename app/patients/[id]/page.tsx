"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, CalendarPlus, Activity, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import WoundRecordForm from '@/components/wound-records/WoundRecordForm'
import WoundTimeline from '@/components/wound-records/WoundTimeline'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const supabase = createClient()

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'historico' | 'timeline' | 'nova-evolucao'>('historico')

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (!error && data) setPatient(data)
      setLoading(false)
    }
    if (patientId) fetchPatient()
  }, [patientId, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-[#2D2422]">Paciente não encontrado</h2>
        <Link href="/patients" className="text-[#A58079] mt-4 inline-block hover:underline">Voltar para Pacientes</Link>
      </div>
    )
  }

  const initials = patient.full_name
    ? patient.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/patients" className="flex items-center gap-2 text-[#A58079] hover:text-[#8C6A63] hover:underline font-semibold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex gap-2">
          <Link href={`/appointments/new`} className="bg-[#A58079] hover:bg-[#8C6A63] text-white rounded-full px-6 py-2 text-sm flex items-center gap-2 transition-all shadow-md">
            <CalendarPlus className="h-4 w-4" /> Agendar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#A58079]/10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 rounded-full bg-[#A58079]/10 flex flex-shrink-0 items-center justify-center font-bold text-[#A58079] text-3xl shadow-inner">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1514]">{patient.full_name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#6B5C59] font-medium">
              {patient.date_of_birth && <span>Nascimento: {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}</span>}
              {patient.phone && <><span>•</span><span>Tel: {patient.phone}</span></>}
              {patient.address && <><span>•</span><span>{patient.address}</span></>}
            </div>
            {patient.notes && (
              <p className="mt-4 text-sm bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/10 text-[#2D2422]">
                <span className="font-semibold text-[#A58079]">Observações:</span> {patient.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none border-b border-[#A58079]/10">
          <button 
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'historico' 
                ? 'text-[#A58079] border-[#A58079]' 
                : 'text-[#6B5C59] border-transparent hover:text-[#2D2422]'
            }`}
          >
            Histórico de Saúde
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'timeline' 
                ? 'text-[#A58079] border-[#A58079]' 
                : 'text-[#6B5C59] border-transparent hover:text-[#2D2422]'
            }`}
          >
            Linha do Tempo (Feridas)
          </button>
          <button 
            onClick={() => setActiveTab('nova-evolucao')}
            className={`px-4 py-3 font-bold whitespace-nowrap flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'nova-evolucao' 
                ? 'text-[#1A1514] border-[#1A1514]' 
                : 'text-[#A58079] hover:text-[#8C6A63] border-transparent'
            }`}
          >
            <Activity className="h-4 w-4" /> Registrar Nova Evolução
          </button>
        </div>

        {activeTab === 'historico' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 space-y-6 border border-[#A58079]/10 shadow-sm">
            <h2 className="text-xl font-bold text-[#1A1514] mb-4 border-b border-[#A58079]/10 pb-2">Anamnese Geral / Comorbidades</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2D2422]">Doenças de Base (Diabetes, Hipertensão, etc)</label>
                <textarea className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[100px]" placeholder="Relatar condições médicas..."></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2D2422]">Alergias</label>
                <textarea className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[100px]" placeholder="Medicamentos, látex, iodo..."></textarea>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#2D2422]">Histórico Cirúrgico e Medicações em Uso</label>
                <textarea className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[100px]" placeholder="Cirurgias prévias e medicamentos contínuos..."></textarea>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-8 py-3 rounded-full font-medium shadow-md transition-all">Salvar Histórico de Saúde</button>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#A58079]/10 shadow-sm">
            <h2 className="text-xl font-bold text-[#1A1514] mb-8 text-center">Histórico Fotográfico e Clínico</h2>
            <WoundTimeline />
          </div>
        )}
        
        {activeTab === 'nova-evolucao' && (
          <div className="bg-white rounded-3xl p-6 border border-[#A58079]/10 shadow-sm">
            <h2 className="text-lg font-bold text-[#1A1514] mb-6 border-b border-[#A58079]/10 pb-4">Anamnese da Ferida (Tratamento)</h2>
            <WoundRecordForm patientId={patientId} onSaved={() => setActiveTab('timeline')} />
          </div>
        )}
      </div>
    </div>
  )
}

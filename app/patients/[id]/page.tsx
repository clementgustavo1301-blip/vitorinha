"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, CalendarPlus, Activity, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import WoundRecordForm from '@/components/wound-records/WoundRecordForm'
import WoundTimeline from '@/components/wound-records/WoundTimeline'
import ImageUploader from '@/components/wound-records/ImageUploader'

export default function PatientDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const patientId = params.id as string
  const supabase = createClient()

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'historico' | 'timeline' | 'nova-evolucao'>(
    searchParams.get('new') === 'true' ? 'nova-evolucao' : 'historico'
  )
  const [healthHistory, setHealthHistory] = useState({
    comorbidities: '',
    allergies: '',
    surgical_history: ''
  })
  const [savingHistory, setSavingHistory] = useState(false)
  const [savedHistory, setSavedHistory] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (!error && data) {
        setPatient(data)
        setHealthHistory({
          comorbidities: data.comorbidities || '',
          allergies: data.allergies || '',
          surgical_history: data.surgical_history || ''
        })
      }
      setLoading(false)
    }
    if (patientId) fetchPatient()
  }, [patientId, supabase])

  const handleSaveHealthHistory = async () => {
    setSavingHistory(true)
    setSavedHistory(false)
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          comorbidities: healthHistory.comorbidities,
          allergies: healthHistory.allergies,
          surgical_history: healthHistory.surgical_history
        })
        .eq('id', patientId)
        
      if (error) throw error
      setSavedHistory(true)
      setTimeout(() => setSavedHistory(false), 3000)
    } catch (err: any) {
      console.error('Erro ao salvar histórico:', err)
      // We can fail silently or handle error in a non-popup way, but for now we remove the alert
    } finally {
      setSavingHistory(false)
    }
  }

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
                <textarea 
                  className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[100px]" 
                  placeholder="Relatar condições médicas..."
                  value={healthHistory.comorbidities}
                  onChange={(e) => setHealthHistory(prev => ({ ...prev, comorbidities: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2D2422]">Alergias</label>
                <textarea 
                  className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[100px]" 
                  placeholder="Medicamentos, látex, iodo..."
                  value={healthHistory.allergies}
                  onChange={(e) => setHealthHistory(prev => ({ ...prev, allergies: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-[#2D2422]">Histórico Cirúrgico e Medicações em Uso</label>
                <textarea 
                  className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[100px]" 
                  placeholder="Cirurgias prévias e medicamentos contínuos..."
                  value={healthHistory.surgical_history}
                  onChange={(e) => setHealthHistory(prev => ({ ...prev, surgical_history: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveHealthHistory}
                disabled={savingHistory || savedHistory}
                className={`px-8 py-3 rounded-full font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${savedHistory ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#A58079] hover:bg-[#8C6A63] text-white'}`}
              >
                {savingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {savedHistory ? <Check className="w-4 h-4" /> : null}
                {savingHistory ? 'Salvando...' : savedHistory ? 'Salvo com Sucesso!' : 'Salvar Histórico de Saúde'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#A58079]/10 shadow-sm">
              <h2 className="text-lg font-bold text-[#1A1514] mb-4 border-b border-[#A58079]/10 pb-2">Resumo do Histórico de Saúde</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F9F7F6] rounded-2xl border border-[#A58079]/5">
                  <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Comorbidades</p>
                  <p className="text-sm text-[#2D2422]">{healthHistory.comorbidities || 'Não informado'}</p>
                </div>
                <div className="p-4 bg-[#F9F7F6] rounded-2xl border border-[#A58079]/5">
                  <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Alergias</p>
                  <p className="text-sm text-[#2D2422] font-semibold text-red-600/80">{healthHistory.allergies || 'Nenhuma informada'}</p>
                </div>
                <div className="p-4 bg-[#F9F7F6] rounded-2xl border border-[#A58079]/5">
                  <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Cid / Cirurgias / Medicações</p>
                  <p className="text-sm text-[#2D2422]">{healthHistory.surgical_history || 'Não informado'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#A58079]/10 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1514] mb-8 text-center">Evolução das Lesões</h2>
              <WoundTimeline />
            </div>
          </div>
        )}
        
        {activeTab === 'nova-evolucao' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-[#A58079]/10 shadow-sm">
              <h2 className="text-lg font-bold text-[#1A1514] mb-6 border-b border-[#A58079]/10 pb-4">Anamnese da Ferida (Tratamento)</h2>
              <WoundRecordForm patientId={patientId} onSaved={() => setActiveTab('timeline')} />
            </div>
            <div className="bg-white rounded-3xl p-6 h-fit sticky top-6 border border-[#A58079]/10 shadow-sm">
              <h2 className="text-lg font-bold text-[#1A1514] mb-6 border-b border-[#A58079]/10 pb-4">Registro Fotográfico</h2>
              <ImageUploader />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

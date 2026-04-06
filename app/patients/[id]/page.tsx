"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarPlus, Activity, Loader2, Check, Plus, ChevronDown, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/layout/RoleContext'
import WoundRecordForm from '@/components/wound-records/WoundRecordForm'
import WoundTimeline from '@/components/wound-records/WoundTimeline'

export default function PatientDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const patientId = params.id as string
  const supabase = createClient()
  const { role } = useRole()

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showNewEvolution, setShowNewEvolution] = useState(searchParams.get('new') === 'true')
  const [showAnamnese, setShowAnamnese] = useState(false)
  const [healthHistory, setHealthHistory] = useState({
    comorbidities: '',
    allergies: '',
    surgical_history: ''
  })
  const [savingHistory, setSavingHistory] = useState(false)
  const [savedHistory, setSavedHistory] = useState(false)
  const [timelineKey, setTimelineKey] = useState(0)

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
    } finally {
      setSavingHistory(false)
    }
  }

  const calculateAge = (dob: string) => {
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
      </div>
    )
  }

  if (role === 'receptionist') {
    return (
      <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1A1514] mb-2">Acesso Restrito</h2>
        <p className="text-sm md:text-base text-[#6B5C59] max-w-md mx-auto mb-6">
          Seu perfil atual de recepção não tem permissão para acessar os prontuários e o histórico clínico de pacientes.
        </p>
        <Link href="/" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2.5 rounded-full font-medium transition-colors text-sm md:text-base">
          Voltar para o Início
        </Link>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-lg md:text-xl font-bold text-[#2D2422]">Paciente não encontrado</h2>
        <Link href="/patients" className="text-[#A58079] mt-4 inline-block hover:underline text-sm md:text-base">Voltar para Pacientes</Link>
      </div>
    )
  }

  const initials = patient.full_name
    ? patient.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  const cpfFormatted = patient.cpf
    ? patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : null

  return (
    <div className="space-y-4 md:space-y-5 pb-20">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-2">
        <Link href="/patients" className="flex items-center gap-1 text-[#A58079] hover:text-[#8C6A63] hover:underline font-semibold transition-colors text-xs md:text-sm shrink-0">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Link href={`/appointments/new`} className="bg-[#A58079]/10 hover:bg-[#A58079]/20 text-[#A58079] rounded-full px-4 md:px-5 py-1.5 text-xs md:text-sm flex items-center gap-1.5 transition-all font-semibold border border-[#A58079]/20 active:scale-95">
          <CalendarPlus className="h-3.5 w-3.5 md:h-4 w-4" /> 
          <span className="hidden sm:inline">Agendar Consulta</span>
          <span className="sm:hidden">Agendar</span>
        </Link>
      </div>

      {/* PATIENT HEADER */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#A58079]/10 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#A58079] to-[#8C6A63] flex flex-shrink-0 items-center justify-center font-bold text-white text-lg md:text-xl shadow-lg ring-4 ring-[#A58079]/10">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
              <h1 className="text-lg md:text-xl font-bold text-[#1A1514] truncate">{patient.full_name}</h1>
              {patient.date_of_birth && (
                <span className="text-xs md:text-sm text-[#6B5C59] font-medium mt-0.5 sm:mt-0">
                  {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')} — {calculateAge(patient.date_of_birth)} anos
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] md:text-sm text-[#6B5C59]">
              {cpfFormatted && <span className="shrink-0">CPF: <strong className="text-[#2D2422]">{cpfFormatted}</strong></span>}
              {patient.phone && <span className="shrink-0">Tel: <strong className="text-[#2D2422]">{patient.phone}</strong></span>}
              {patient.address && <span className="truncate max-w-[200px] sm:max-w-xs">{patient.address}</span>}
            </div>
          </div>
          {/* Quick badges - hidden on extra small screens or redesigned for wrap */}
          <div className="flex flex-wrap gap-2 flex-shrink-0 mt-2 md:mt-0">
            {healthHistory.allergies && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 whitespace-nowrap animate-pulse-slow">
                ⚠ Alergias
              </span>
            )}
            {healthHistory.comorbidities && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                Comorbidades
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Anamnese */}
        <div className="border-t border-[#A58079]/10">
          <button
            onClick={() => setShowAnamnese(!showAnamnese)}
            className="w-full px-4 md:px-6 py-3.5 flex items-center justify-between text-xs md:text-sm hover:bg-[#F9F7F6] transition-colors active:bg-[#F9F7F6]"
          >
            <span className="font-bold text-[#A58079] flex items-center gap-2">
              <ChevronDown className={`w-3.5 h-3.5 md:w-4 h-4 transition-transform duration-300 ${showAnamnese ? 'rotate-180' : ''}`} />
              DADOS CLÍNICOS E ALERGIAS
            </span>
            {!showAnamnese && (
              <span className="text-[10px] md:text-xs text-[#6B5C59] font-medium">Ver detalhes</span>
            )}
          </button>

          {showAnamnese && (
            <div className="px-4 md:px-6 pb-6 space-y-4 md:space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[11px] md:text-sm font-semibold text-[#2D2422] px-1">Doenças de Base</label>
                  <textarea
                    className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[90px] resize-none"
                    placeholder="Diabetes, Hipertensão..."
                    value={healthHistory.comorbidities}
                    onChange={(e) => setHealthHistory(prev => ({ ...prev, comorbidities: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[11px] md:text-sm font-semibold text-[#2D2422] px-1">Alergias</label>
                  <textarea
                    className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[90px] resize-none"
                    placeholder="Medicamentos, látex..."
                    value={healthHistory.allergies}
                    onChange={(e) => setHealthHistory(prev => ({ ...prev, allergies: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                  <label className="text-[11px] md:text-sm font-semibold text-[#2D2422] px-1">Histórico Cirúrgico e Medicações</label>
                  <textarea
                    className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans min-h-[90px] resize-none"
                    placeholder="Cirurgias prévias e medicamentos em uso..."
                    value={healthHistory.surgical_history}
                    onChange={(e) => setHealthHistory(prev => ({ ...prev, surgical_history: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveHealthHistory}
                  disabled={savingHistory || savedHistory}
                  className={`w-full sm:w-auto px-8 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${savedHistory ? 'bg-green-600 text-white' : 'bg-[#A58079] hover:bg-[#8C6A63] text-white active:scale-95'}`}
                >
                  {savingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {savedHistory ? <><Check className="w-4 h-4" /> Informações Salvas!</> : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EVOLUTION HISTORY SECTION */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#A58079]/10 shadow-sm overflow-hidden min-h-[400px]">
        {/* Section Header */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#A58079]/10 bg-[#FDFCFB]/30">
          <div>
            <h2 className="text-base md:text-lg font-bold text-[#1A1514]">Histórico de Evoluções</h2>
            <p className="text-[10px] md:text-xs text-[#6B5C59] mt-0.5 font-medium">Acompanhamento clínico da lesão</p>
          </div>
          <button
            onClick={() => setShowNewEvolution(!showNewEvolution)}
            className="w-full sm:w-auto bg-[#A58079] hover:bg-[#8C6A63] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            {showNewEvolution ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showNewEvolution ? 'Fechar Formulário' : 'Nova Evolução'}
          </button>
        </div>

        {/* Inline New Evolution Form */}
        {showNewEvolution && (
          <div className="p-4 md:p-8 border-b border-[#A58079]/10 bg-[#FDFCFB] animate-in slide-in-from-top-4 duration-500 ease-out">
            <h3 className="text-sm font-bold text-[#1A1514] mb-5 flex items-center gap-2 bg-white w-fit px-4 py-2 rounded-full border border-[#A58079]/10 shadow-sm">
              <Activity className="w-4 h-4 text-[#A58079]" /> Registrar Nova Evolução
            </h3>
            <WoundRecordForm
              patientId={patientId}
              appointmentId={searchParams.get('appointment_id') || undefined}
              onSaved={() => {
                setShowNewEvolution(false)
                setTimelineKey(prev => prev + 1)
                // Scroll to top of timeline
                window.scrollTo({ top: 400, behavior: 'smooth' })
              }}
              onCancel={() => setShowNewEvolution(false)}
            />
          </div>
        )}

        {/* Timeline content */}
        <div className="p-4 md:p-6">
          <WoundTimeline key={timelineKey} />
        </div>
      </div>
    </div>
  )
}

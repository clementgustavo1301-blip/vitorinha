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
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1514] mb-2">Acesso Restrito</h2>
        <p className="text-[#6B5C59] max-w-md mx-auto mb-6">
          Seu perfil atual de recepção não tem permissão para acessar os prontuários e o histórico clínico de pacientes.
        </p>
        <Link href="/" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2 rounded-full font-medium transition-colors">
          Voltar para o Início
        </Link>
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

  const cpfFormatted = patient.cpf
    ? patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : null

  return (
    <div className="space-y-5 pb-20">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <Link href="/patients" className="flex items-center gap-2 text-[#A58079] hover:text-[#8C6A63] hover:underline font-semibold transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Link href={`/appointments/new`} className="bg-[#A58079]/10 hover:bg-[#A58079]/20 text-[#A58079] rounded-full px-5 py-1.5 text-sm flex items-center gap-2 transition-all font-semibold border border-[#A58079]/20">
          <CalendarPlus className="h-4 w-4" /> Agendar Consulta
        </Link>
      </div>

      {/* PATIENT HEADER - inspired by reference */}
      <div className="bg-white rounded-3xl border border-[#A58079]/10 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start md:items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A58079] to-[#8C6A63] flex flex-shrink-0 items-center justify-center font-bold text-white text-xl shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-xl font-bold text-[#1A1514]">{patient.full_name}</h1>
              {patient.date_of_birth && (
                <span className="text-sm text-[#6B5C59] font-medium">
                  {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')} — {calculateAge(patient.date_of_birth)} anos
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-sm text-[#6B5C59]">
              {cpfFormatted && <span>CPF: <strong className="text-[#2D2422]">{cpfFormatted}</strong></span>}
              {patient.phone && <span>Tel: <strong className="text-[#2D2422]">{patient.phone}</strong></span>}
              {patient.address && <span className="truncate max-w-xs">{patient.address}</span>}
            </div>
          </div>
          {/* Quick badges */}
          <div className="flex gap-2 flex-shrink-0">
            {healthHistory.allergies && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
                ⚠ Alergias
              </span>
            )}
            {healthHistory.comorbidities && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                Comorbidades
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Anamnese */}
        <div className="border-t border-[#A58079]/10">
          <button
            onClick={() => setShowAnamnese(!showAnamnese)}
            className="w-full px-5 md:px-6 py-3 flex items-center justify-between text-sm hover:bg-[#F9F7F6] transition-colors"
          >
            <span className="font-bold text-[#A58079] flex items-center gap-2">
              <ChevronDown className={`w-4 h-4 transition-transform ${showAnamnese ? 'rotate-180' : ''}`} />
              DIAGNÓSTICO, COMORBIDADES E ALERGIAS
            </span>
            {!showAnamnese && (
              <span className="text-xs text-[#6B5C59]">Clique para expandir</span>
            )}
          </button>

          {showAnamnese && (
            <div className="px-5 md:px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D2422]">Doenças de Base</label>
                  <textarea
                    className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans min-h-[80px] resize-none"
                    placeholder="Diabetes, Hipertensão..."
                    value={healthHistory.comorbidities}
                    onChange={(e) => setHealthHistory(prev => ({ ...prev, comorbidities: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D2422]">Alergias</label>
                  <textarea
                    className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans min-h-[80px] resize-none"
                    placeholder="Medicamentos, látex..."
                    value={healthHistory.allergies}
                    onChange={(e) => setHealthHistory(prev => ({ ...prev, allergies: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-[#2D2422]">Histórico Cirúrgico e Medicações</label>
                  <textarea
                    className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans min-h-[80px] resize-none"
                    placeholder="Cirurgias prévias e medicamentos..."
                    value={healthHistory.surgical_history}
                    onChange={(e) => setHealthHistory(prev => ({ ...prev, surgical_history: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveHealthHistory}
                  disabled={savingHistory || savedHistory}
                  className={`px-6 py-2 rounded-full font-medium shadow-sm transition-all flex items-center gap-2 text-sm disabled:opacity-50 ${savedHistory ? 'bg-green-600 text-white' : 'bg-[#A58079] hover:bg-[#8C6A63] text-white'}`}
                >
                  {savingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {savedHistory ? <><Check className="w-4 h-4" /> Salvo!</> : 'Salvar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EVOLUTION HISTORY SECTION */}
      <div className="bg-white rounded-3xl border border-[#A58079]/10 shadow-sm overflow-hidden">
        {/* Section Header - matches the reference */}
        <div className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#A58079]/10">
          <h2 className="text-lg font-bold text-[#1A1514]">Histórico de Evoluções</h2>
          <button
            onClick={() => setShowNewEvolution(!showNewEvolution)}
            className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Evolução
          </button>
        </div>

        {/* Inline New Evolution Form */}
        {showNewEvolution && (
          <div className="p-5 md:p-6 border-b border-[#A58079]/10 bg-[#FDFCFB]">
            <h3 className="text-sm font-bold text-[#1A1514] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#A58079]" /> Registrar Nova Evolução
            </h3>
            <WoundRecordForm
              patientId={patientId}
              appointmentId={searchParams.get('appointment_id') || undefined}
              onSaved={() => {
                setShowNewEvolution(false)
                setTimelineKey(prev => prev + 1)
              }}
            />
          </div>
        )}

        {/* Timeline content */}
        <div className="p-5 md:p-6">
          <WoundTimeline key={timelineKey} />
        </div>
      </div>
    </div>
  )
}

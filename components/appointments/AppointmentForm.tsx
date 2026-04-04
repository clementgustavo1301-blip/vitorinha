"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2, Search } from 'lucide-react'

export default function AppointmentForm() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [cpf, setCpf] = useState('')
  const [isSearchingCpf, setIsSearchingCpf] = useState(false)
  const [cpfFound, setCpfFound] = useState(false)
  const [existingPatientId, setExistingPatientId] = useState<string | null>(null)

  const [patientData, setPatientData] = useState({
    name: '',
    dob: '',
    phone: '',
    cep: '',
    address: ''
  })
  const [isSearchingCep, setIsSearchingCep] = useState(false)

  const [appointmentType, setAppointmentType] = useState<'clinic' | 'home'>('clinic')
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const handleCpfChange = (value: string) => {
    setCpf(formatCpf(value))
    setCpfFound(false)
    setExistingPatientId(null)
  }

  const handleCpfBlur = async () => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length < 11) return
    
    setIsSearchingCpf(true)
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('cpf', cleanCpf)
        .maybeSingle()

      if (!error && data) {
        setCpfFound(true)
        setExistingPatientId(data.id)
        setPatientData({
          name: data.full_name || '',
          dob: data.date_of_birth || '',
          phone: data.phone || '',
          cep: '',
          address: data.address || ''
        })
      }
    } catch (err) {
      console.error("Erro ao buscar CPF:", err)
    }
    
    setIsSearchingCpf(false)
  }

  const handleCepBlur = async () => {
    const cleanCep = patientData.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setIsSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      
      if (!data.erro) {
        setPatientData(prev => ({
          ...prev,
          address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
        }))
      }
    } catch (err) {
      console.error("Erro ao buscar CEP")
    }
    setIsSearchingCep(false)
  }

  const handleSubmit = async () => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (!cleanCpf || cleanCpf.length < 11) {
      setError('Informe o CPF do paciente.')
      return
    }
    if (!patientData.name.trim()) {
      setError('Informe o nome do paciente.')
      return
    }
    if (!scheduledAt) {
      setError('Selecione a data e hora do agendamento.')
      return
    }

    setSaving(true)
    setError('')

    try {
      let patientId = existingPatientId

      if (patientId) {
        // Update existing patient data
        await supabase
          .from('patients')
          .update({
            full_name: patientData.name.trim(),
            date_of_birth: patientData.dob || null,
            phone: patientData.phone || null,
            address: patientData.address || null,
          })
          .eq('id', patientId)
      } else {
        // Create new patient with CPF
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .insert({
            full_name: patientData.name.trim(),
            cpf: cleanCpf,
            date_of_birth: patientData.dob || null,
            phone: patientData.phone || null,
            address: patientData.address || null,
          })
          .select('id')
          .single()

        if (patientError) throw patientError
        patientId = patient.id
      }

      // Create the appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          type: appointmentType,
          scheduled_at: new Date(scheduledAt).toISOString(),
          notes: notes || null,
          status: 'scheduled'
        })

      if (appointmentError) throw appointmentError

      setSuccess(true)
      setTimeout(() => router.push('/calendar'), 1500)
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      setError(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#2D2422]">Agendamento Salvo!</h2>
        <p className="text-[#6B5C59]">Redirecionando para a agenda...</p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#A58079]/10 shadow-sm">
        <h3 className="text-lg font-bold text-[#1A1514] mb-4 border-b border-[#A58079]/10 pb-2">1. Dados do Paciente</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#2D2422] flex items-center gap-2">
              CPF *
              {isSearchingCpf && <span className="text-xs text-[#A58079] animate-pulse flex items-center gap-1"><Search className="w-3 h-3" /> Buscando na base...</span>}
              {cpfFound && <span className="text-xs text-green-600 font-bold">✓ Paciente encontrado!</span>}
            </label>
            <input 
              type="text" 
              className={`w-full bg-[#F9F7F6] border rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans ${cpfFound ? 'border-green-400 bg-green-50/50' : 'border-[#A58079]/20'}`}
              placeholder="000.000.000-00" 
              value={cpf}
              onChange={e => handleCpfChange(e.target.value)}
              onBlur={handleCpfBlur}
              maxLength={14}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#2D2422]">Nome Completo *</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              placeholder="Ex: Maria da Silva" 
              value={patientData.name}
              onChange={e => setPatientData({...patientData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422]">Data de Nascimento</label>
            <input 
              type="date" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              value={patientData.dob}
              onChange={e => setPatientData({...patientData, dob: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422]">Telefone / WhatsApp</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              placeholder="(00) 00000-0000" 
              value={patientData.phone}
              onChange={e => setPatientData({...patientData, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422] flex items-center gap-2">
              CEP
              {isSearchingCep && <span className="text-xs text-[#A58079] animate-pulse">Buscando...</span>}
            </label>
            <input 
              type="text" 
              className={`w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans ${isSearchingCep ? 'border-[#A58079]' : ''}`}
              placeholder="00000-000" 
              value={patientData.cep}
              onChange={e => setPatientData({...patientData, cep: e.target.value})}
              onBlur={handleCepBlur}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#2D2422]">Endereço Completo</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              placeholder="Rua, Número, Bairro, Cidade" 
              value={patientData.address}
              onChange={e => setPatientData({...patientData, address: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#A58079]/10 shadow-sm">
        <h3 className="text-lg font-bold text-[#1A1514] mb-4 border-b border-[#A58079]/10 pb-2">2. Dados do Agendamento</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#2D2422]">Modalidade de Atendimento</label>
            <div className="flex gap-4">
              <label className={`flex flex-1 items-center justify-center p-3 rounded-2xl border cursor-pointer transition-colors ${appointmentType === 'clinic' ? 'border-[#A58079] bg-[#A58079]/10' : 'border-[#A58079]/30 bg-[#F9F7F6] hover:bg-[#A58079]/5'}`}>
                <input type="radio" name="type" value="clinic" className="text-[#A58079] focus:ring-[#A58079] mr-2" checked={appointmentType === 'clinic'} onChange={() => setAppointmentType('clinic')} />
                <span className="font-medium text-[#2D2422]">Clínica</span>
              </label>
              <label className={`flex flex-1 items-center justify-center p-3 rounded-2xl border cursor-pointer transition-colors ${appointmentType === 'home' ? 'border-[#2D2422] bg-[#2D2422]/10' : 'border-[#2D2422]/20 bg-[#F9F7F6] hover:bg-[#2D2422]/5'}`}>
                <input type="radio" name="type" value="home" className="text-[#2D2422] focus:ring-[#2D2422] mr-2" checked={appointmentType === 'home'} onChange={() => setAppointmentType('home')} />
                <span className="font-medium text-[#6B5C59]">Domiciliar</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422]">Data e Hora *</label>
            <input 
              type="datetime-local" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <label className="text-sm font-semibold text-[#2D2422]">Motivo do Agendamento (Opcional)</label>
          <textarea 
            className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans min-h-[80px]" 
            placeholder="Primeira avaliação, troca de curativo, etc..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="border border-[#A58079] text-[#A58079] hover:bg-[#A58079] hover:text-white rounded-full px-6 py-2 transition-all font-medium"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={saving}
          className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-8 py-3 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Salvando...' : 'Finalizar Cadastro e Agendar'}
        </button>
      </div>
    </form>
  )
}

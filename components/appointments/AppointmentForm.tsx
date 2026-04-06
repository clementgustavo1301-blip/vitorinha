"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2, Calendar, Clock, MapPin, Building2, User, Check, X, Phone, ArrowLeft } from 'lucide-react'

interface AppointmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialType?: 'clinic' | 'home'
}

export default function AppointmentForm({ onSuccess, onCancel, initialType = 'clinic' }: AppointmentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form State
  const [cpf, setCpf] = useState('')
  const [patientId, setPatientId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [type, setType] = useState<'clinic' | 'home'>(initialType)
  const [notes, setNotes] = useState('')

  // CPF Formatting
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    // Auto-search when 11 digits
    if (value.length === 11 && value !== cpf.replace(/\D/g, '')) {
      searchPatient(value)
    }
    
    // Masking
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    setCpf(value)
  }

  const searchPatient = async (cleanCpf: string) => {
    setSearching(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('cpf', cleanCpf)
        .maybeSingle()

      if (data) {
        setPatientId(data.id)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setAddress(data.address || '')
      } else {
        // Reset if not found to allow new registration
        setPatientId(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let currentPatientId = patientId

      // 1. Create patient if doesn't exist
      if (!currentPatientId) {
        const { data: newPatient, error: pError } = await supabase
          .from('patients')
          .insert({
            cpf: cpf.replace(/\D/g, ''),
            full_name: fullName,
            phone: phone,
            address: address
          })
          .select('id')
          .single()

        if (pError) throw pError
        currentPatientId = newPatient.id
      } else {
        // Update existing patient info
        await supabase.from('patients').update({ full_name: fullName, phone, address }).eq('id', currentPatientId)
      }

      // 2. Create appointment
      const { error: aError } = await supabase.from('appointments').insert({
        patient_id: currentPatientId,
        scheduled_at: scheduledAt,
        type: type,
        notes: notes,
        status: 'scheduled'
      })

      if (aError) throw aError

      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) onSuccess()
        else router.push('/')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Erro ao agendar consulta. Verifique os dados.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 gap-4 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center ring-8 ring-green-50/50 shadow-inner">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1514]">Agendamento Concluído!</h2>
          <p className="text-sm md:text-base text-[#6B5C59]">O horário foi reservado com sucesso no sistema.</p>
        </div>
        <div className="mt-4 px-6 py-3 bg-[#F9F7F6] rounded-2xl border border-[#A58079]/10 text-xs font-bold text-[#A58079] uppercase tracking-wider">
          Direcionando para o Dashboard...
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4 md:space-y-6">
        {/* Type Selection - Redesigned as tabs on mobile */}
        <div className="space-y-3">
          <label className="text-xs md:text-sm font-bold text-[#2D2422] uppercase tracking-widest px-1">Modalidade de Atendimento</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('clinic')}
              className={`flex flex-col items-center gap-2 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all active:scale-[0.98] ${type === 'clinic' ? 'border-[#A58079] bg-[#A58079]/5 shadow-md shadow-[#A58079]/10' : 'border-[#A58079]/10 bg-[#F9F7F6] opacity-70'}`}
            >
              <Building2 className={`w-6 h-6 md:w-8 md:h-8 transition-transform ${type === 'clinic' ? 'scale-110 text-[#A58079]' : 'text-[#6B5C59]'}`} />
              <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${type === 'clinic' ? 'text-[#1A1514]' : 'text-[#6B5C59]'}`}>Na Clínica</span>
            </button>
            <button
              type="button"
              onClick={() => setType('home')}
              className={`flex flex-col items-center gap-2 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all active:scale-[0.98] ${type === 'home' ? 'border-[#2D2422] bg-[#2D2422]/5 shadow-md shadow-[#2D2422]/10' : 'border-[#A58079]/10 bg-[#F9F7F6] opacity-70'}`}
            >
              <MapPin className={`w-6 h-6 md:w-8 md:h-8 transition-transform ${type === 'home' ? 'scale-110 text-[#2D2422]' : 'text-[#6B5C59]'}`} />
              <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${type === 'home' ? 'text-[#1A1514]' : 'text-[#6B5C59]'}`}>Domiciliar</span>
            </button>
          </div>
        </div>

        {/* Patient Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-[#2D2422] flex items-center justify-between px-1">
              CPF do Paciente
              {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A58079]" />}
              {patientId && !searching && <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">✔ Cadastro Localizado</span>}
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A58079]/60" />
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className={`w-full bg-[#F9F7F6] border rounded-xl md:rounded-2xl py-3.5 md:py-4 pl-11 pr-4 text-sm text-[#2D2422] outline-none transition-all shadow-sm ${patientId ? 'border-green-300 focus:ring-green-100 focus:border-green-400' : 'border-[#A58079]/20 focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5'}`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-[#2D2422] px-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#A58079]" /> Nome Completo
            </label>
            <input
              type="text"
              placeholder="Digite o nome do paciente"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl py-3.5 md:py-4 px-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Contact & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-[#2D2422] px-1 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#A58079]" /> Celular / WhatsApp
            </label>
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl py-3.5 md:py-4 px-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5 transition-all shadow-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-[#2D2422] px-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#A58079]" /> Data e Hora do Atendimento
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl py-3.5 md:py-4 px-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Address & Notes */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-[#2D2422] px-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#A58079]" /> Endereço Completo
            </label>
            <input
              type="text"
              placeholder="Rua, número, bairro e cidade..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl py-3.5 md:py-4 px-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5 transition-all shadow-sm"
              required={type === 'home'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-[#2D2422] px-1 uppercase tracking-widest">Informações Adicionais</label>
            <textarea
              placeholder="Observações sobre o trajeto, sintomas relatados or motivo da consulta..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5 transition-all min-h-[100px] md:min-h-[120px] resize-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-xs font-bold animate-pulse flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#A58079] hover:bg-[#8C6A63] text-white py-4 rounded-full font-bold shadow-lg shadow-[#A58079]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
          {loading ? 'Confirmando...' : 'Finalizar Agendamento'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white border border-[#A58079]/20 text-[#6B5C59] py-4 rounded-full font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base order-2 sm:order-1"
          >
            <ArrowLeft className="w-5 h-5" /> Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

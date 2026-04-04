"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { Check, Loader2 } from 'lucide-react'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface WoundRecordFormProps {
  patientId: string
  appointmentId?: string
  onSaved?: () => void
}

export default function WoundRecordForm({ patientId, appointmentId, onSaved }: WoundRecordFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [location, setLocation] = useState('')
  const [tissueTypes, setTissueTypes] = useState<string[]>([])
  const [exudateTypes, setExudateTypes] = useState<string[]>([])
  const [exudateVolume, setExudateVolume] = useState('')
  const [odor, setOdor] = useState('')
  const [painLevel, setPainLevel] = useState<number>(5)
  const [treatment, setTreatment] = useState<string>('')
  const [observations, setObservations] = useState<string>('')

  const toggleTissue = (t: string) => {
    setTissueTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  const toggleExudate = (t: string) => {
    setExudateTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const quillModules = {
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet'}],
      ['clean']
    ],
  }

  const handleSubmit = async () => {
    if (!location.trim()) {
      setError('Informe a localização da lesão.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { error: dbError } = await supabase
        .from('wound_records')
        .insert({
          patient_id: patientId,
          appointment_id: appointmentId || null,
          location: location.trim(),
          tissue_type: tissueTypes.join(', ') || null,
          exudate: exudateTypes.join(', ') || null,
          pain_level: painLevel,
          treatment_applied: treatment || null,
          notes: observations || null,
        })

      if (dbError) throw dbError

      setSuccess(true)
      setExudateVolume('')
      setOdor('')
      if (onSaved) onSaved()
    } catch (err: any) {
      console.error('Erro ao salvar prontuário:', err)
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
        <h2 className="text-xl font-bold text-[#2D2422]">Prontuário Salvo!</h2>
        <p className="text-[#6B5C59]">A evolução foi registrada com sucesso.</p>
        <button onClick={() => { setSuccess(false); setLocation(''); setTissueTypes([]); setExudateTypes([]); setPainLevel(5); setTreatment(''); setObservations('') }} className="mt-4 text-[#A58079] font-bold hover:underline">Registrar outra evolução</button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Localização da Lesão *</label>
          <input type="text" className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans" placeholder="Ex: Calcâneo E, Região Sacral..." value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Tipo de Tecido</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {['Granulação', 'Epitelização', 'Esfacelo', 'Necrose / Escara'].map(type => (
              <label key={type} className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-colors ${tissueTypes.includes(type) ? 'border-[#A58079] bg-[#A58079]/10' : 'border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white'}`}>
                <input type="checkbox" className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded border-[#A58079]/30" checked={tissueTypes.includes(type)} onChange={() => toggleTissue(type)} />
                <span className="text-sm text-[#2D2422] font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Características do Exsudato</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {['Seroso', 'Sanguinolento', 'Purulento', 'Ausente'].map(type => (
              <label key={type} className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-colors ${exudateTypes.includes(type) ? 'border-[#A58079] bg-[#A58079]/10' : 'border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white'}`}>
                <input type="checkbox" className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded border-[#A58079]/30" checked={exudateTypes.includes(type)} onChange={() => toggleExudate(type)} />
                <span className="text-sm text-[#2D2422] font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Volume do Exsudato</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            {['Pouco', 'Médio', 'Muito'].map(type => (
              <label key={type} className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-colors ${exudateVolume === type ? 'border-[#A58079] bg-[#A58079]/10' : 'border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white'}`}>
                <input type="radio" name="volumeExsudato" value={type} className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded-full border-[#A58079]/30 cursor-pointer" checked={exudateVolume === type} onChange={() => setExudateVolume(type)} />
                <span className="text-sm text-[#2D2422] font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Odor da Ferida</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {['Ausente', 'Leve', 'Forte', 'Intenso'].map(type => (
              <label key={type} className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-colors ${odor === type ? 'border-[#A58079] bg-[#A58079]/10' : 'border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white'}`}>
                <input type="radio" name="odorFerida" value={type} className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded-full border-[#A58079]/30 cursor-pointer" checked={odor === type} onChange={() => setOdor(type)} />
                <span className="text-sm text-[#2D2422] font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-[#A58079]/10">
        <label className="text-sm font-semibold text-[#2D2422]">Avaliação da Dor</label>
        <div className="bg-white border border-[#A58079]/20 rounded-2xl p-6 shadow-sm shadow-[#A58079]/5">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-[#2D2422]">Nível de Dor (Escala EVA)</span>
            <span className="font-bold text-[#A58079] px-3 py-1.5 bg-[#A58079]/10 rounded-lg text-sm">{painLevel}/10</span>
          </div>
          <input 
            type="range" min="0" max="10" value={painLevel} 
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-[#F9F7F6] rounded-lg appearance-none cursor-pointer accent-[#A58079]" 
          />
          <div className="flex justify-between text-xs text-[#6B5C59] mt-3 font-medium">
            <span>0 (Sem dor)</span><span>5 (Moderada)</span><span>10 (Máxima)</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-[#A58079]/10">
        <label className="text-sm font-semibold text-[#2D2422]">Tratamento Aplicado (Curativo)</label>
        <div className="bg-white border border-[#A58079]/20 rounded-2xl overflow-hidden focus-within:border-[#A58079] focus-within:ring-2 focus-within:ring-[#A58079]/10 transition-all [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b-[#A58079]/20 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[120px]">
          <ReactQuill theme="snow" value={treatment} onChange={setTreatment} modules={quillModules} placeholder="Produtos utilizados, técnica..." />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#2D2422]">Observações Gerais</label>
        <div className="bg-white border border-[#A58079]/20 rounded-2xl overflow-hidden focus-within:border-[#A58079] focus-within:ring-2 focus-within:ring-[#A58079]/10 transition-all [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b-[#A58079]/20 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[120px]">
          <ReactQuill theme="snow" value={observations} onChange={setObservations} modules={quillModules} placeholder="Outras informações clínicas relevantes..." />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4 border-t border-[#A58079]/10">
        <button 
          type="submit" 
          disabled={saving}
          className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-8 py-3 rounded-full font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Salvando...' : 'Salvar Prontuário'}
        </button>
      </div>
    </form>
  )
}

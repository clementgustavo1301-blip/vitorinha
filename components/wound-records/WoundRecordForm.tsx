"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { Check, Loader2, Camera, Paperclip, X } from 'lucide-react'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface WoundRecordFormProps {
  patientId: string
  appointmentId?: string
  initialData?: any
  onSaved?: () => void
  onCancel?: () => void
}

export default function WoundRecordForm({ patientId, appointmentId, initialData, onSaved, onCancel }: WoundRecordFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [docFiles, setDocFiles] = useState<File[]>([])
  
  const [location, setLocation] = useState(initialData?.location || '')
  const [tissueTypes, setTissueTypes] = useState<string[]>(initialData?.tissue_type ? initialData.tissue_type.split(', ') : [])
  const [exudateTypes, setExudateTypes] = useState<string[]>(initialData?.exudate ? initialData.exudate.split(', ') : [])
  const [exudateVolume, setExudateVolume] = useState(initialData?.exudate_volume || '')
  const [odor, setOdor] = useState(initialData?.odor || '')
  const [painLevel, setPainLevel] = useState<number>(initialData?.pain_level ?? 5)
  const [treatment, setTreatment] = useState<string>(initialData?.treatment_applied || '')
  const [observations, setObservations] = useState<string>(initialData?.notes || '')

  const toggleTissue = (t: string) => {
    setTissueTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  const toggleExudate = (t: string) => {
    setExudateTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const quillModules = {
    toolbar: [
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
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
      const recordData: any = {
        location: location.trim(),
        tissue_type: tissueTypes.join(', ') || null,
        exudate: exudateTypes.join(', ') || null,
        exudate_volume: exudateVolume || null,
        odor: odor || null,
        pain_level: painLevel,
        treatment_applied: treatment || null,
        notes: observations || null,
      }

      let recordId = initialData?.id;
      let dbError;
      if (initialData?.id) {
        const { error } = await supabase
          .from('wound_records')
          .update(recordData)
          .eq('id', initialData.id)
        dbError = error
      } else {
        const insertData = {
          ...recordData,
          patient_id: patientId,
          appointment_id: appointmentId || null,
        }
        const { data: newRecord, error } = await supabase
          .from('wound_records')
          .insert(insertData)
          .select('id')
          .single()
        dbError = error
        if (newRecord) recordId = newRecord.id
      }

      if (dbError) throw dbError

      const allFiles = [...imageFiles, ...docFiles]
      if (allFiles.length > 0 && recordId) {
        for (const file of allFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${patientId}/${recordId}/${Math.random().toString(36).substring(2)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('wound-images')
            .upload(fileName, file)
            
          if (!uploadError) {
            await supabase.from('wound_images').insert({
              wound_record_id: recordId,
              storage_path: fileName,
              caption: 'Adicionado em ' + new Date().toLocaleDateString('pt-BR')
            })
          }
        }
      }

      setSuccess(true)
      if (onSaved) onSaved()
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      setError(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 md:py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#2D2422]">Evolução Registrada!</h2>
        <p className="text-sm md:text-base text-[#6B5C59]">O prontuário foi atualizado com sucesso.</p>
        <button onClick={() => { setSuccess(false); setLocation(''); setTissueTypes([]); setExudateTypes([]); setPainLevel(5); setTreatment(''); setObservations('') }} className="mt-2 text-[#A58079] font-bold hover:underline py-2 active:scale-95 transition-transform">Registrar nova evolução</button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-bold text-[#2D2422] flex items-center gap-2">
            Localização da Lesão <span className="text-[#A58079]">*</span>
          </label>
          <input 
            type="text" 
            className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-4 focus:ring-[#A58079]/5 transition-all font-sans shadow-sm" 
            placeholder="Ex: Calcâneo E, Região Sacral..." 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-bold text-[#2D2422]">Tipo de Tecido</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {['Granulação', 'Epitelização', 'Esfacelo', 'Necrose'].map(type => (
              <label key={type} className={`flex items-center gap-3 cursor-pointer p-3 md:p-4 rounded-xl border transition-all active:scale-[0.98] ${tissueTypes.includes(type) ? 'border-[#A58079] bg-[#A58079]/10 shadow-sm' : 'border-[#A58079]/10 bg-[#F9F7F6] hover:bg-[#F9F7F6]/50'}`}>
                <input type="checkbox" className="w-5 h-5 rounded border-[#A58079]/30 text-[#A58079] focus:ring-[#A58079] transition-all" checked={tissueTypes.includes(type)} onChange={() => toggleTissue(type)} />
                <span className="text-sm text-[#2D2422] font-semibold">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-bold text-[#2D2422]">Exsudato</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {['Seroso', 'Sanguinolento', 'Purulento', 'Ausente'].map(type => (
              <label key={type} className={`flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer p-3 rounded-xl border transition-all active:scale-[0.98] ${exudateTypes.includes(type) ? 'border-[#A58079] bg-[#A58079]/10 shadow-sm' : 'border-[#A58079]/10 bg-[#F9F7F6]'}`}>
                <input type="checkbox" className="w-5 h-5 rounded border-[#A58079]/30 text-[#A58079] focus:ring-[#A58079] transition-all" checked={exudateTypes.includes(type)} onChange={() => toggleExudate(type)} />
                <span className="text-[11px] md:text-xs text-[#2D2422] font-bold uppercase tracking-wider">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-bold text-[#2D2422]">Volume do Exsudato</label>
          <div className="flex gap-2 mt-1">
            {['Pouco', 'Médio', 'Muito'].map(type => (
              <label key={type} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${exudateVolume === type ? 'border-[#A58079] bg-[#A58079]/10 ring-2 ring-[#A58079]/5' : 'border-[#A58079]/10 bg-[#F9F7F6]'}`}>
                <input type="radio" name="volumeExsudato" value={type} className="w-4 h-4 text-[#A58079] focus:ring-[#A58079]" checked={exudateVolume === type} onChange={() => setExudateVolume(type)} />
                <span className="text-xs font-bold text-[#2D2422] mt-1">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs md:text-sm font-bold text-[#2D2422]">Odor</label>
          <div className="flex gap-2 mt-1">
            {['Ausente', 'Leve', 'Forte'].map(type => (
              <label key={type} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${odor === type ? 'border-[#A58079] bg-[#A58079]/10 ring-2 ring-[#A58079]/5' : 'border-[#A58079]/10 bg-[#F9F7F6]'}`}>
                <input type="radio" name="odorFerida" value={type} className="w-4 h-4 text-[#A58079] focus:ring-[#A58079]" checked={odor === type} onChange={() => setOdor(type)} />
                <span className="text-xs font-bold text-[#2D2422] mt-1">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="bg-white border border-[#A58079]/20 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <span className="text-xs md:text-sm font-bold text-[#2D2422]">Escala de Dor (EVA)</span>
            <span className={`font-bold px-3 py-1.5 rounded-lg text-sm transition-colors ${painLevel >= 7 ? 'bg-red-50 text-red-600' : painLevel >= 4 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              {painLevel}/10
            </span>
          </div>
          <input 
            type="range" min="0" max="10" value={painLevel} 
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="w-full h-2.5 bg-[#F9F7F6] rounded-full appearance-none cursor-pointer accent-[#A58079]" 
          />
          <div className="flex justify-between text-[10px] md:text-xs text-[#6B5C59] mt-4 font-bold uppercase tracking-wider px-1">
            <span>Sem dor</span><span>Moderada</span><span>Máxima</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <label className="text-xs md:text-sm font-bold text-[#2D2422]">Tratamento Aplicado</label>
        <div className="bg-white border border-[#A58079]/20 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-[#A58079]/5 transition-all">
          <ReactQuill 
            theme="snow" 
            value={treatment} 
            onChange={setTreatment} 
            modules={quillModules} 
            placeholder="Produtos, curativo secundário..." 
            className="quill-mobile"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs md:text-sm font-bold text-[#2D2422]">Observações</label>
        <div className="bg-white border border-[#A58079]/20 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-[#A58079]/5 transition-all">
          <ReactQuill 
            theme="snow" 
            value={observations} 
            onChange={setObservations} 
            modules={quillModules} 
            placeholder="Intercorrências, orientações..." 
            className="quill-mobile"
          />
        </div>
      </div>

      {/* MULTIMEDIA UPLOAD - Compact design for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="space-y-3 p-4 bg-[#F9F7F6] rounded-2xl border border-[#A58079]/10 shadow-inner">
          <label className="text-xs font-bold text-[#2D2422] uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-[#A58079]" /> Imagens
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {imageFiles.map((f, i) => (
              <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-[#A58079]/20 shadow-sm animate-in zoom-in duration-200">
                <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-red-500/80 text-white rounded-full p-0.5 shadow-sm"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <label className="w-16 h-16 flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-[#A58079]/30 text-[#A58079] cursor-pointer active:bg-[#A58079]/10 transition-colors">
                <input type="file" className="hidden" multiple accept="image/*" capture="environment" onChange={e => e.target.files && setImageFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Câmera</span>
              </label>
              <label className="w-16 h-16 flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-[#A58079]/30 text-[#A58079] cursor-pointer active:bg-[#A58079]/10 transition-colors">
                <input type="file" className="hidden" multiple accept="image/*" onChange={e => e.target.files && setImageFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                <span className="text-[10px] font-bold">Galeria</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-[#F9F7F6] rounded-2xl border border-[#A58079]/10 shadow-inner">
          <label className="text-xs font-bold text-[#2D2422] uppercase tracking-wider flex items-center gap-2">
            <Paperclip className="w-3.5 h-3.5 text-[#A58079]" /> Documentos
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
            {docFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#A58079]/10 shadow-sm text-[10px] animate-in slide-in-from-left duration-200">
                <span className="truncate flex-1 pr-2 font-medium">{f.name}</span>
                <button type="button" onClick={() => setDocFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <label className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border-2 border-dashed border-[#A58079]/30 text-[#A58079] cursor-pointer active:bg-[#A58079]/10 transition-colors">
              <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={e => e.target.files && setDocFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
              <Paperclip className="w-4 h-4" />
              <span className="text-xs font-bold">Inserir Arquivo</span>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-xs font-bold animate-pulse">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <button 
          type="submit" 
          disabled={saving}
          className="flex-1 bg-[#A58079] hover:bg-[#8C6A63] text-white py-4 rounded-full font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          {saving ? 'Gravando...' : initialData?.id ? 'Atualizar Prontuário' : 'Salvar Evolução Clinica'}
        </button>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white border border-[#A58079]/20 text-[#6B5C59] py-4 rounded-full font-bold hover:bg-gray-50 transition-all active:scale-95 text-sm md:text-base order-2 sm:order-1"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

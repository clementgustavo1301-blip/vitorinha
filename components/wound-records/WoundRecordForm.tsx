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
        // Update
        const { error } = await supabase
          .from('wound_records')
          .update(recordData)
          .eq('id', initialData.id)
        dbError = error
      } else {
        // Insert
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

      // HANDLE FILE UPLOADS
      const allFiles = [...imageFiles, ...docFiles]
      if (allFiles.length > 0 && recordId) {
        // Iterate files and upload
        for (const file of allFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${patientId}/${recordId}/${Math.random().toString(36).substring(2)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('wound-images')
            .upload(fileName, file)
            
          if (!uploadError) {
            // Save to wound_images table
            await supabase.from('wound_images').insert({
              wound_record_id: recordId,
              storage_path: fileName,
              caption: 'Foto adicionada durante o atendimento'
            })
          } else {
             console.error("Upload error:", uploadError)
          }
        }
      }

      setSuccess(true)
      setExudateVolume('')
      setOdor('')
      setImageFiles([])
      setDocFiles([])
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#A58079]/10">
        
        {/* IMAGES SECTION */}
        <div className="space-y-4 bg-white/60 p-4 rounded-3xl border border-[#A58079]/10">
          <label className="text-sm font-semibold text-[#2D2422]">Evidências Fotográficas</label>
          
          {imageFiles.length > 0 && (
             <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
               {imageFiles.map((f, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden shadow-sm group">
                    <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white shadow"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
               ))}
             </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="border-2 border-dashed border-[#A58079]/30 rounded-2xl p-4 flex flex-col items-center justify-center bg-[#F9F7F6] hover:bg-[#A58079]/5 transition-colors cursor-pointer group text-center h-28">
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*"
                capture="environment"
                onChange={e => e.target.files && setImageFiles(prev => [...prev, ...Array.from(e.target.files!)])}
              />
              <svg className="w-6 h-6 text-[#A58079] mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-xs font-medium text-[#2D2422]">Tirar Foto</span>
            </label>
            <label className="border-2 border-dashed border-[#A58079]/30 rounded-2xl p-4 flex flex-col items-center justify-center bg-[#F9F7F6] hover:bg-[#A58079]/5 transition-colors cursor-pointer group text-center h-28">
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={e => e.target.files && setImageFiles(prev => [...prev, ...Array.from(e.target.files!)])}
              />
              <svg className="w-6 h-6 text-[#A58079] mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-xs font-medium text-[#2D2422]">Galeria</span>
            </label>
          </div>
        </div>

        {/* DOCUMENTS SECTION */}
        <div className="space-y-4 bg-white/60 p-4 rounded-3xl border border-[#A58079]/10">
          <label className="text-sm font-semibold text-[#2D2422]">Exames e Documentos</label>
          
          {docFiles.length > 0 && (
             <div className="flex flex-col gap-2">
               {docFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#F9F7F6] border border-[#A58079]/10">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-[#A58079]/10 rounded-lg shrink-0">
                        <svg className="w-4 h-4 text-[#A58079]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <span className="text-xs text-[#2D2422] font-medium truncate">{f.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setDocFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-1 rounded-full text-[#A58079] hover:bg-[#A58079]/10"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
               ))}
             </div>
          )}

          <label className="border-2 border-dashed border-[#A58079]/30 rounded-2xl p-4 flex flex-col items-center justify-center bg-[#F9F7F6] hover:bg-[#A58079]/5 transition-colors cursor-pointer group text-center h-28">
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={e => e.target.files && setDocFiles(prev => [...prev, ...Array.from(e.target.files!)])}
            />
            <svg className="w-6 h-6 text-[#A58079] mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="text-xs font-medium text-[#2D2422]">Adicionar Documento / PDF</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4 border-t border-[#A58079]/10">
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-3 rounded-full font-medium text-[#6B5C59] hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={saving}
          className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-8 py-3 rounded-full font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Salvando...' : initialData?.id ? 'Atualizar Prontuário' : 'Salvar Prontuário'}
        </button>
      </div>
    </form>
  )
}

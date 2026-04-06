"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Loader2, FileText, ZoomIn, X, Maximize2, Edit, Camera, Paperclip, Calendar, Clock, LayoutGrid, List, ChevronRight } from 'lucide-react'
import WoundRecordForm from './WoundRecordForm'

type ViewMode = 'horizontal' | 'vertical'

export default function WoundTimeline() {
  const params = useParams()
  const patientId = params?.id as string
  const supabase = createClient()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<Record<string, any[]>>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any | null>(null)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('vertical')

  const fetchRecords = useCallback(async () => {
    if (!patientId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('wound_records')
      .select(`*, wound_images (*)`)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRecords(data)
      const imageMap: Record<string, any[]> = {}
      data.forEach(record => { imageMap[record.id] = record.wound_images || [] })
      setImages(imageMap)
    }
    setLoading(false)
  }, [patientId, supabase])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('wound-images').getPublicUrl(path)
    return data.publicUrl
  }

  const isDocFile = (path: string) => {
    const p = path.toLowerCase()
    return p.endsWith('.pdf') || p.endsWith('.doc') || p.endsWith('.docx') || p.endsWith('.xls') || p.endsWith('.xlsx')
  }

  const groupedByDate = records.reduce((acc: Record<string, any[]>, record) => {
    const dateKey = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(record)
    return acc
  }, {})
  const dateGroups = Object.entries(groupedByDate)

  const selectedRecord = selectedRecordId ? records.find(r => r.id === selectedRecordId) : null
  const selectedAttachments = selectedRecord ? (images[selectedRecord.id] || []) : []
  const selectedPhotos = selectedAttachments.filter((img: any) => !isDocFile(img.storage_path))
  const selectedDocs = selectedAttachments.filter((img: any) => isDocFile(img.storage_path))

  if (loading && records.length === 0) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#A58079] animate-spin" /></div>
  }
  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-[#A58079]/20 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#2D2422]">Nenhuma evolução registrada</h3>
        <p className="text-sm text-[#6B5C59] mt-2">Clique em &quot;+ Nova Evolução&quot; para iniciar o prontuário.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs md:text-sm text-[#6B5C59] font-medium"><span className="font-bold text-[#1A1514]">{records.length}</span> registros clínico(s)</p>
        <div className="flex bg-[#F9F7F6] rounded-xl border border-[#A58079]/10 p-1 shadow-inner">
          <button
            onClick={() => setViewMode('vertical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'vertical' ? 'bg-white text-[#1A1514] shadow-sm' : 'text-[#6B5C59]'}`}
          >
            <List className="w-3.5 h-3.5" /> Lista
          </button>
          <button
            onClick={() => setViewMode('horizontal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'horizontal' ? 'bg-white text-[#1A1514] shadow-sm' : 'text-[#6B5C59]'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
        </div>
      </div>

      {viewMode === 'vertical' && (
        <div className="space-y-4 md:space-y-6 relative before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#A58079]/40 before:to-transparent">
          {records.map((record, index) => {
            const date = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            const time = new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            const photos = (images[record.id] || []).filter((img: any) => !isDocFile(img.storage_path))
            const isSelected = selectedRecordId === record.id

            return (
              <div key={record.id} className="relative flex items-start gap-4 md:gap-0 md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#A58079] text-white shadow-md shrink-0 md:z-10 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-[10px] font-bold">
                  {index + 1}
                </div>

                <div
                  className={`flex-1 md:w-[calc(50%-2.5rem)] bg-white rounded-2xl md:rounded-3xl border p-4 md:p-5 transition-all active:scale-[0.99] md:active:scale-100 cursor-pointer ${isSelected ? 'border-[#A58079] ring-4 ring-[#A58079]/5 shadow-lg' : 'border-[#A58079]/10 shadow-sm'}`}
                  onClick={() => setSelectedRecordId(isSelected ? null : record.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A1514] text-xs md:text-sm">{date}</span>
                      <span className="text-[10px] md:text-xs text-[#A58079] font-bold px-1.5 py-0.5 bg-[#A58079]/10 rounded uppercase tracking-wider">{time}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingRecord(record) }}
                      className="p-1.5 text-[#A58079] hover:bg-[#A58079]/10 rounded-lg transition-colors border border-transparent hover:border-[#A58079]/20 shadow-none hover:shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="font-bold text-[#2D2422] text-sm md:text-base mb-3 leading-tight">{record.location}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4 px-0.5">
                    {record.tissue_type && <span className="text-[9px] md:text-xs px-2 py-0.5 bg-[#F9F7F6] rounded-full text-[#6B5C59] border border-[#A58079]/10 font-bold uppercase tracking-tight">{record.tissue_type}</span>}
                    {record.pain_level > 0 && <span className="text-[9px] md:text-xs px-2 py-0.5 bg-red-50 rounded-full text-red-600 border border-red-100 font-bold uppercase tracking-tight">Dor: {record.pain_level}/10</span>}
                  </div>

                  {photos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {photos.map((img: any) => (
                        <div
                          key={img.id}
                          className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-black/5 border border-[#A58079]/10 cursor-zoom-in shadow-inner active:scale-95 transition-transform"
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(getImageUrl(img.storage_path)) }}
                        >
                          <img src={getImageUrl(img.storage_path)} alt="Foto" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="text-white w-4 h-4 opacity-0 hover:opacity-100 drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between text-[10px] md:text-xs font-bold text-[#A58079] uppercase tracking-wider px-1">
                    <span>{isSelected ? 'Ver Resumo' : 'Abrir evolução'}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'horizontal' && (
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
          {records.map((record) => {
            const date = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            const photos = (images[record.id] || []).filter((img: any) => !isDocFile(img.storage_path))
            const isSelected = selectedRecordId === record.id
            return (
              <div 
                key={record.id} 
                className="shrink-0 w-64 md:w-72 snap-center"
                onClick={() => setSelectedRecordId(isSelected ? null : record.id)}
              >
                <div className={`h-full bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'border-[#A58079] ring-4 ring-[#A58079]/5 shadow-md' : 'border-[#A58079]/10'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#A58079] px-2 py-0.5 bg-[#A58079]/10 rounded uppercase">{date}</span>
                    <button onClick={(e) => { e.stopPropagation(); setEditingRecord(record) }} className="p-1.5 text-[#A58079] hover:bg-[#A58079]/10 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                  </div>
                  <h4 className="font-bold text-sm text-[#1A1514] mb-4 truncate">{record.location}</h4>
                  {photos.length > 0 && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 border border-[#A58079]/10 shadow-inner">
                      <img src={getImageUrl(photos[0].storage_path)} alt="" className="w-full h-full object-cover" />
                      {photos.length > 1 && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                          +{photos.length - 1} fotos
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {record.tissue_type && <span className="text-[10px] font-bold uppercase tracking-tight text-[#6B5C59]">{record.tissue_type}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedRecord && (
        <div className="mt-4 bg-white rounded-2xl md:rounded-3xl border border-[#A58079]/15 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400 ease-out">
          <div className="p-4 bg-[#F9F7F6]/80 backdrop-blur-md border-b border-[#A58079]/10 flex items-center justify-between sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-[#1A1514]"><Calendar className="w-4 h-4 text-[#A58079]" />{new Date(selectedRecord.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-[#A58079] font-bold"><Clock className="w-3.5 h-3.5" />{new Date(selectedRecord.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <button onClick={() => setSelectedRecordId(null)} className="p-2 text-[#6B5C59] hover:bg-[#A58079]/10 rounded-full transition-colors active:scale-95"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5 md:p-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 shadow-sm"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-1 tracking-widest">Local</p><p className="text-sm font-bold text-[#2D2422]">{selectedRecord.location || '—'}</p></div>
              <div className="bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 shadow-sm"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-1 tracking-widest">Dor</p><p className="text-sm font-bold text-[#2D2422]">{selectedRecord.pain_level}/10</p></div>
              {selectedRecord.tissue_type && <div className="bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 shadow-sm sm:col-span-1 col-span-2"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-1 tracking-widest">Tecido</p><p className="text-sm font-bold text-[#2D2422] truncate">{selectedRecord.tissue_type}</p></div>}
              {selectedRecord.exudate && <div className="bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 shadow-sm sm:col-span-1 col-span-2"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-1 tracking-widest">Exsudato</p><p className="text-sm font-bold text-[#2D2422] truncate">{selectedRecord.exudate}</p></div>}
            </div>
            
            {(selectedRecord.treatment_applied || selectedRecord.notes) && (
              <div className="space-y-6 bg-[#F9F7F6]/50 p-5 rounded-3xl border border-[#A58079]/5">
                {selectedRecord.treatment_applied && (
                  <div><p className="text-[10px] uppercase font-bold text-[#A58079] mb-3 tracking-widest">Tratamento Aplicado</p><div className="text-sm text-[#2D2422] leading-relaxed ql-editor-mini" dangerouslySetInnerHTML={{ __html: selectedRecord.treatment_applied }} /></div>
                )}
                {selectedRecord.notes && (
                  <div><p className="text-[10px] uppercase font-bold text-[#A58079] mb-3 tracking-widest">Observações Clinicas</p><div className="text-sm text-[#2D2422] leading-relaxed ql-editor-mini" dangerouslySetInnerHTML={{ __html: selectedRecord.notes }} /></div>
                )}
              </div>
            )}

            {selectedPhotos.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-bold text-[#A58079] tracking-widest flex items-center gap-2 mb-3"><Camera className="w-4 h-4" /> Registro de Imagens ({selectedPhotos.length})</p>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
                  {selectedPhotos.map((img: any) => (
                    <div key={img.id} onClick={() => setSelectedImage(getImageUrl(img.storage_path))} className="relative aspect-square rounded-2xl overflow-hidden cursor-zoom-in bg-black/5 ring-1 ring-black/5 shadow-inner group/photo active:scale-95 transition-all">
                      <img src={getImageUrl(img.storage_path)} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 active:bg-black/30 transition-colors flex items-center justify-center"><Maximize2 className="text-white w-6 h-6 opacity-40 shadow-lg" /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDocs.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-[#A58079] tracking-widest flex items-center gap-2 mb-3"><Paperclip className="w-4 h-4" /> Arquivos Anexos</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDocs.map((doc: any) => (
                    <a key={doc.id} href={getImageUrl(doc.storage_path)} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F9F7F6] border border-[#A58079]/10 hover:shadow-sm transition-all text-xs font-bold text-[#2D2422] animate-in zoom-in duration-300">
                      <FileText className="w-4 h-4 text-[#A58079]" /> {doc.storage_path.split('/').pop()?.slice(-15)}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-[#A58079]/10 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setEditingRecord(selectedRecord)}
                className="flex-1 bg-[#A58079] text-white py-3.5 rounded-full text-sm font-bold shadow-lg shadow-[#A58079]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Edit className="w-4 h-4" /> Editar Informações
              </button>
              <button 
                onClick={() => setSelectedRecordId(null)}
                className="flex-1 bg-white border border-[#A58079]/20 text-[#6B5C59] py-3.5 rounded-full text-sm font-bold active:scale-95 transition-all"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRecord && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-400">
            <div className="p-5 border-b border-[#A58079]/10 flex items-center justify-between bg-[#F9F7F6]/50">
              <h2 className="text-lg font-bold text-[#1A1514]">Editar Evolução</h2>
              <button onClick={() => setEditingRecord(null)} className="p-2 text-[#6B5C59] bg-white rounded-full shadow-sm hover:shadow-md transition-all active:scale-90"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 md:p-8 no-scrollbar">
              <WoundRecordForm patientId={patientId} initialData={editingRecord} onSaved={() => { fetchRecords(); setEditingRecord(null) }} onCancel={() => setEditingRecord(null)} />
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500" onClick={() => { setSelectedImage(null); setIsZoomed(false) }}>
          <button className="absolute top-8 right-8 p-3 bg-white/20 rounded-full text-white z-[130] active:scale-90"><X className="w-6 h-6" /></button>
          <div className={`relative max-w-5xl w-full h-full flex items-center justify-center transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed) }}>
            <img src={selectedImage} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </>
  )
}

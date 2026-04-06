"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Loader2, FileText, ZoomIn, X, Maximize2, Edit, Camera, Paperclip, Calendar, Clock, LayoutGrid, List } from 'lucide-react'
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

  // Group records by date
  const groupedByDate = records.reduce((acc: Record<string, any[]>, record) => {
    const dateKey = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(record)
    return acc
  }, {})
  const dateGroups = Object.entries(groupedByDate)

  // Selected record detail
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
        <p className="text-[#6B5C59] mt-2">Clique em &quot;+ Nova Evolução&quot; para iniciar o prontuário.</p>
      </div>
    )
  }

  return (
    <>
      {/* HEADER + VIEW TOGGLE */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#6B5C59]"><span className="font-bold text-[#1A1514]">{records.length}</span> evoluções</p>
        <div className="flex bg-[#F9F7F6] rounded-xl border border-[#A58079]/10 p-0.5">
          <button
            onClick={() => setViewMode('vertical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'vertical' ? 'bg-white text-[#1A1514] shadow-sm' : 'text-[#6B5C59] hover:text-[#2D2422]'}`}
          >
            <List className="w-3.5 h-3.5" /> Linha do Tempo
          </button>
          <button
            onClick={() => setViewMode('horizontal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'horizontal' ? 'bg-white text-[#1A1514] shadow-sm' : 'text-[#6B5C59] hover:text-[#2D2422]'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
        </div>
      </div>

      {/* ======================== VERTICAL TIMELINE ======================== */}
      {viewMode === 'vertical' && (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#A58079]/50 before:to-transparent">
          {records.map((record, index) => {
            const date = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            const time = new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            const allAttachments = images[record.id] || []
            const photos = allAttachments.filter((img: any) => !isDocFile(img.storage_path))
            const docs = allAttachments.filter((img: any) => isDocFile(img.storage_path))
            const isSelected = selectedRecordId === record.id

            return (
              <div key={record.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#A58079] text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm font-bold">
                  {index + 1}
                </div>

                {/* Card */}
                <div
                  className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white rounded-3xl border shadow-sm p-5 transition-all hover:shadow-md cursor-pointer ${isSelected ? 'border-[#A58079] ring-2 ring-[#A58079]/20' : 'border-[#A58079]/10'}`}
                  onClick={() => setSelectedRecordId(isSelected ? null : record.id)}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A1514] text-sm">{date}</span>
                      <span className="text-xs text-[#A58079] font-medium">{time}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingRecord(record) }}
                      className="p-1.5 text-[#A58079]/50 hover:text-[#A58079] hover:bg-[#A58079]/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="font-bold text-[#2D2422] mb-2">{record.location}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {record.tissue_type && <span className="text-[10px] px-2 py-0.5 bg-[#F9F7F6] rounded-full text-[#6B5C59] border border-[#A58079]/10">{record.tissue_type}</span>}
                    {record.exudate && <span className="text-[10px] px-2 py-0.5 bg-[#F9F7F6] rounded-full text-[#6B5C59] border border-[#A58079]/10">{record.exudate}</span>}
                    {record.pain_level > 0 && <span className="text-[10px] px-2 py-0.5 bg-red-50 rounded-full text-red-600 border border-red-100 font-bold">Dor: {record.pain_level}/10</span>}
                  </div>

                  {/* PHOTOS always visible for comparison */}
                  {photos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {photos.map((img: any) => (
                        <div
                          key={img.id}
                          className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-black/5 border border-[#A58079]/10 cursor-zoom-in group/img"
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(getImageUrl(img.storage_path)) }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getImageUrl(img.storage_path)} alt={img.caption || 'Foto'} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="text-white w-4 h-4 opacity-0 group-hover/img:opacity-100 drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Documents mini strip */}
                  {docs.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {docs.map((doc: any) => (
                        <a key={doc.id} href={getImageUrl(doc.storage_path)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-[10px] font-semibold text-[#A58079] bg-[#A58079]/5 px-2 py-1 rounded-lg border border-[#A58079]/10 hover:bg-[#A58079]/10 transition-colors">
                          <FileText className="w-3 h-3" /> {doc.storage_path.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ======================== HORIZONTAL TIMELINE ======================== */}
      {viewMode === 'horizontal' && (
        <div className="relative">
          <div className="absolute top-[52px] left-0 right-0 h-0.5 bg-gradient-to-r from-[#A58079]/40 via-[#A58079]/20 to-transparent" />
          <div className="flex gap-0 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {dateGroups.map(([dateKey, dayRecords]) => {
              const dateObj = new Date((dayRecords as any[])[0].created_at)
              const dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })
              const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
              return (
                <div key={dateKey} className="shrink-0 flex flex-col items-stretch" style={{ minWidth: '230px' }}>
                  <div className="px-3 pb-2"><p className="text-xs font-bold text-[#1A1514]">{dateKey} <span className="text-[#6B5C59] font-medium">({dayName})</span></p></div>
                  <div className="flex items-center justify-center h-6 relative z-10"><div className="w-3 h-3 rounded-full bg-[#A58079] border-2 border-white shadow-sm" /></div>
                  <div className="flex flex-col gap-3 px-2 pt-3">
                    {(dayRecords as any[]).map((record: any) => {
                      const time = new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      const attachments = images[record.id] || []
                      const photos = attachments.filter((img: any) => !isDocFile(img.storage_path))
                      const isSelected = selectedRecordId === record.id
                      return (
                        <div key={record.id} onClick={() => setSelectedRecordId(isSelected ? null : record.id)}
                          className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected ? 'bg-white border-[#A58079] shadow-md ring-2 ring-[#A58079]/20' : 'bg-white border-[#A58079]/10 hover:border-[#A58079]/30'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#A58079] bg-[#A58079]/5 px-2 py-0.5 rounded-md border border-[#A58079]/10">{time}</span>
                            <button onClick={(e) => { e.stopPropagation(); setEditingRecord(record) }} className="p-1 text-[#A58079]/40 hover:text-[#A58079] hover:bg-[#A58079]/10 rounded-md transition-colors" title="Editar"><Edit className="w-3 h-3" /></button>
                          </div>
                          <p className="font-bold text-sm text-[#1A1514] mb-1.5">Evolução</p>
                          <div className="flex flex-wrap gap-1">
                            {record.location && <span className="text-[10px] px-2 py-0.5 bg-[#A58079]/10 rounded-md text-[#A58079] font-semibold border border-[#A58079]/10">{record.location}</span>}
                          </div>
                          {photos.length > 0 && (
                            <div className="flex gap-1.5 mt-3 overflow-hidden">
                              {photos.slice(0, 3).map((img: any) => (
                                <div key={img.id} className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 border border-[#A58079]/10 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={getImageUrl(img.storage_path)} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))}
                              {photos.length > 3 && <div className="w-12 h-12 rounded-lg bg-[#F9F7F6] border border-[#A58079]/10 flex items-center justify-center text-[10px] font-bold text-[#A58079]">+{photos.length - 3}</div>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ======================== DETAIL PANEL (shared) ======================== */}
      {selectedRecord && (
        <div className="mt-6 bg-white rounded-3xl border border-[#A58079]/15 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-5 bg-[#F9F7F6] border-b border-[#A58079]/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1A1514]"><Calendar className="w-4 h-4 text-[#A58079]" />{new Date(selectedRecord.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              <div className="flex items-center gap-2 text-sm text-[#6B5C59]"><Clock className="w-4 h-4 text-[#A58079]" />{new Date(selectedRecord.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditingRecord(selectedRecord)} className="px-4 py-1.5 bg-[#A58079] text-white text-xs font-semibold rounded-full hover:bg-[#8C6A63] transition-all shadow-sm flex items-center gap-1.5"><Edit className="w-3 h-3" /> Editar</button>
              <button onClick={() => setSelectedRecordId(null)} className="p-1.5 text-[#6B5C59] hover:bg-[#A58079]/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-5 md:p-8 space-y-6">
            <div>
              <p className="text-xs uppercase font-bold text-[#A58079] mb-3 tracking-wide">Dados Clínicos</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-0.5">Local</p><p className="text-sm font-semibold text-[#2D2422]">{selectedRecord.location || '—'}</p></div>
                <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-0.5">Dor</p><p className="text-sm font-semibold text-[#2D2422]">{selectedRecord.pain_level}/10</p></div>
                {selectedRecord.tissue_type && <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-0.5">Tecido</p><p className="text-sm font-semibold text-[#2D2422]">{selectedRecord.tissue_type}</p></div>}
                {selectedRecord.exudate && <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-0.5">Exsudato</p><p className="text-sm font-semibold text-[#2D2422]">{selectedRecord.exudate}</p></div>}
                {selectedRecord.exudate_volume && <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-0.5">Volume</p><p className="text-sm font-semibold text-[#2D2422]">{selectedRecord.exudate_volume}</p></div>}
                {selectedRecord.odor && <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5"><p className="text-[10px] uppercase font-bold text-[#A58079] mb-0.5">Odor</p><p className="text-sm font-semibold text-[#2D2422]">{selectedRecord.odor}</p></div>}
              </div>
            </div>
            {selectedRecord.treatment_applied && (
              <div><p className="text-xs uppercase font-bold text-[#A58079] mb-3 tracking-wide">Tratamento Aplicado</p><div className="text-sm text-[#2D2422] bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 leading-relaxed ql-editor-mini" dangerouslySetInnerHTML={{ __html: selectedRecord.treatment_applied }} /></div>
            )}
            {selectedRecord.notes && (
              <div><p className="text-xs uppercase font-bold text-[#A58079] mb-3 tracking-wide">Observações</p><div className="text-sm text-[#2D2422] bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 leading-relaxed ql-editor-mini" dangerouslySetInnerHTML={{ __html: selectedRecord.notes }} /></div>
            )}
            {selectedDocs.length > 0 && (
              <div>
                <p className="text-xs uppercase font-bold text-[#A58079] mb-3 tracking-wide flex items-center gap-2"><Paperclip className="w-4 h-4" /> Exames e Documentos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedDocs.map((doc: any) => (
                    <a key={doc.id} href={getImageUrl(doc.storage_path)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[#F9F7F6] border border-[#A58079]/10 hover:bg-white hover:shadow-sm transition-all group/doc">
                      <div className="p-2 bg-[#A58079]/10 rounded-lg text-[#A58079] group-hover/doc:scale-110 transition-transform"><FileText className="w-5 h-5" /></div>
                      <div className="flex-1 overflow-hidden"><p className="text-sm font-semibold text-[#2D2422] truncate">{doc.storage_path.split('/').pop()}</p><p className="text-xs text-[#6B5C59]">Clique para abrir</p></div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {selectedPhotos.length > 0 && (
              <div>
                <p className="text-xs uppercase font-bold text-[#A58079] mb-3 tracking-wide flex items-center gap-2"><Camera className="w-4 h-4" /> Registro Fotográfico ({selectedPhotos.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedPhotos.map((img: any) => (
                    <div key={img.id} onClick={() => setSelectedImage(getImageUrl(img.storage_path))} className="relative aspect-square rounded-2xl overflow-hidden cursor-zoom-in bg-black/5 ring-1 ring-black/5 shadow-sm group/photo transition-all hover:shadow-md hover:ring-[#A58079]/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getImageUrl(img.storage_path)} alt={img.caption || 'Foto clínica'} className="w-full h-full object-cover transition-transform group-hover/photo:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center"><Maximize2 className="text-white w-6 h-6 opacity-0 group-hover/photo:opacity-100 transition-opacity drop-shadow-lg" /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#A58079]/10 flex items-center justify-between bg-[#F9F7F6]">
              <h2 className="text-xl font-bold text-[#1A1514]">Editar Evolução</h2>
              <button onClick={() => setEditingRecord(null)} className="p-2 text-[#6B5C59] hover:bg-[#A58079]/10 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <WoundRecordForm patientId={patientId} initialData={editingRecord} onSaved={() => { fetchRecords(); setEditingRecord(null) }} onCancel={() => setEditingRecord(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300" onClick={() => { setSelectedImage(null); setIsZoomed(false) }}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[130]" onClick={() => setSelectedImage(null)}><X className="w-6 h-6" /></button>
          <div className={`relative max-w-5xl w-full h-full flex items-center justify-center transition-all ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} alt="Preview ampliado" className={`max-w-full max-h-full object-contain transition-transform duration-500 rounded-lg ${isZoomed ? 'scale-150 rounded-none' : 'scale-100'}`} />
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm font-medium border border-white/10 flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />{isZoomed ? 'Clique para reduzir' : 'Clique para dar zoom'}
          </div>
        </div>
      )}
    </>
  )
}

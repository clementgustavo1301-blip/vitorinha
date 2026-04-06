"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Loader2, FileText, ChevronDown, ChevronUp, ZoomIn, X, Maximize2, Edit } from 'lucide-react'
import WoundRecordForm from './WoundRecordForm'

export default function WoundTimeline() {
  const params = useParams()
  const patientId = params?.id as string
  const supabase = createClient()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({})
  const [images, setImages] = useState<Record<string, any[]>>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any | null>(null)

  const fetchRecords = useCallback(async () => {
    if (!patientId) { setLoading(false); return }
    setLoading(true)

    const { data, error } = await supabase
      .from('wound_records')
      .select(`
        *,
        wound_images (*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRecords(data)
      const imageMap: Record<string, any[]> = {}
      data.forEach(record => {
        imageMap[record.id] = record.wound_images || []
      })
      setImages(imageMap)
    }
    setLoading(false)
  }, [patientId, supabase])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const toggleExpand = (id: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('wound-images').getPublicUrl(path)
    return data.publicUrl
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#A58079] animate-spin" />
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-[#A58079]/20 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#2D2422]">Nenhuma evolução registrada</h3>
        <p className="text-[#6B5C59] mt-2">Registre uma nova evolução na aba acima.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#A58079]/50 before:to-transparent">
        {records.map((record, index) => {
          const date = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          const isExpanded = !!expandedRecords[record.id]
          const recordImages = images[record.id] || []
          
          return (
            <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#A58079] text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {index + 1}
              </div>
              
              <div 
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white rounded-3xl border border-[#A58079]/10 shadow-sm p-5 transition-all hover:shadow-md cursor-pointer group/card ${isExpanded ? 'ring-2 ring-[#A58079]/20' : ''}`}
                onClick={() => toggleExpand(record.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1A1514]">{date}</span>
                    {!isExpanded && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#A58079]/10 text-[#A58079] border border-[#A58079]/20">
                        Clique para detalhes
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation()
                         setEditingRecord(record)
                       }}
                       className="p-1.5 text-[#A58079] hover:bg-[#A58079]/10 rounded-lg transition-colors"
                       title="Editar Evolução"
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                     {isExpanded ? <ChevronUp className="w-5 h-5 text-[#A58079]" /> : <ChevronDown className="w-5 h-5 text-[#A58079]" />}
                  </div>
                </div>

                <p className="font-bold text-[#2D2422] mb-1">{record.location}</p>

                {isExpanded ? (
                  <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {recordImages.length > 0 && (
                      <div className="flex gap-2 py-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {recordImages.map((img) => (
                          <div 
                            key={img.id} 
                            className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden group/img bg-black/5 border border-[#A58079]/10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedImage(getImageUrl(img.storage_path))
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={getImageUrl(img.storage_path)} alt={img.caption || 'Foto da ferida'} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="text-white w-4 h-4 drop-shadow-md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5">
                        <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Nível de Dor</p>
                        <p className="text-sm font-semibold text-[#2D2422]">{record.pain_level}/10</p>
                      </div>
                      {record.tissue_type && (
                        <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5">
                          <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Tecido</p>
                          <p className="text-sm font-semibold text-[#2D2422]">{record.tissue_type}</p>
                        </div>
                      )}
                      {record.exudate && (
                        <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5">
                          <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Tipo de Exsudato</p>
                          <p className="text-sm font-semibold text-[#2D2422]">{record.exudate}</p>
                        </div>
                      )}
                      {record.exudate_volume && (
                        <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5">
                          <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Volume do Exsudato</p>
                          <p className="text-sm font-semibold text-[#2D2422]">{record.exudate_volume}</p>
                        </div>
                      )}
                      {record.odor && (
                        <div className="bg-[#F9F7F6] p-3 rounded-2xl border border-[#A58079]/5">
                          <p className="text-[10px] uppercase font-bold text-[#A58079] mb-1">Odor</p>
                          <p className="text-sm font-semibold text-[#2D2422]">{record.odor}</p>
                        </div>
                      )}
                    </div>

                    {record.treatment_applied && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#A58079] mb-2">Tratamento Aplicado</p>
                        <div className="text-sm text-[#6B5C59] bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 ql-editor-mini" dangerouslySetInnerHTML={{ __html: record.treatment_applied }} />
                      </div>
                    )}

                    {record.notes && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#A58079] mb-2">Observações Gerais</p>
                        <div className="text-sm text-[#6B5C59] bg-[#F9F7F6] p-4 rounded-2xl border border-[#A58079]/5 ql-editor-mini" dangerouslySetInnerHTML={{ __html: record.notes }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2 overflow-hidden mask-fade-right">
                      {record.tissue_type && <span className="text-[10px] px-2 py-1 bg-[#F9F7F6] rounded-full text-[#6B5C59] border border-[#A58079]/10 whitespace-nowrap">{record.tissue_type}</span>}
                      {record.exudate && <span className="text-[10px] px-2 py-1 bg-[#F9F7F6] rounded-full text-[#6B5C59] border border-[#A58079]/10 whitespace-nowrap">{record.exudate}</span>}
                    </div>
                    {recordImages.length > 0 && (
                      <div className="flex -space-x-2">
                        {recordImages.slice(0, 3).map((img, i) => (
                           <div key={img.id} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-black/5 relative z-[3] " style={{ zIndex: 10 - i }}>
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={getImageUrl(img.storage_path)} alt="" className="w-full h-full object-cover" />
                           </div>
                        ))}
                        {recordImages.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F9F7F6] flex items-center justify-center text-[8px] font-bold text-[#A58079] relative z-0">
                            +{recordImages.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#A58079]/10 flex items-center justify-between bg-[#F9F7F6]">
              <h2 className="text-xl font-bold text-[#1A1514]">Editar Evolução</h2>
              <button 
                onClick={() => setEditingRecord(null)}
                className="p-2 text-[#6B5C59] hover:bg-[#A58079]/10 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <WoundRecordForm 
                patientId={patientId} 
                initialData={editingRecord}
                onSaved={() => {
                  fetchRecords()
                  setEditingRecord(null)
                }}
                onCancel={() => setEditingRecord(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => { setSelectedImage(null); setIsZoomed(false) }}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[130]"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className={`relative max-w-5xl w-full h-full flex items-center justify-center transition-all ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomed(!isZoomed)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selectedImage} 
              alt="Preview ampliado" 
              className={`max-w-full max-h-full object-contain transition-transform duration-500 rounded-lg ${isZoomed ? 'scale-150 rounded-none' : 'scale-100'}`} 
            />
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm font-medium border border-white/10 flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            {isZoomed ? 'Clique para reduzir' : 'Clique para dar zoom'}
          </div>
        </div>
      )}
    </>
  )
}


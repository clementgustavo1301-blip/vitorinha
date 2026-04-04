"use client"
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Loader2, FileText } from 'lucide-react'

export default function WoundTimeline() {
  const params = useParams()
  const patientId = params?.id as string
  const supabase = createClient()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      if (!patientId) { setLoading(false); return }
      setLoading(true)

      const { data, error } = await supabase
        .from('wound_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (!error) setRecords(data || [])
      setLoading(false)
    }
    fetchRecords()
  }, [patientId, supabase])

  if (loading) {
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
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#A58079]/50 before:to-transparent">
      {records.map((record, index) => {
        const date = new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        return (
          <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#A58079] text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {index + 1}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white rounded-3xl border border-[#A58079]/10 shadow-sm p-4 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#1A1514]">{date}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-[#A58079]/10 text-[#A58079] border border-[#A58079]/20">
                  Dor: {record.pain_level}/10
                </span>
              </div>
              <p className="text-sm font-semibold text-[#1A1514] mb-1">{record.location}</p>
              {record.tissue_type && <p className="text-xs text-[#6B5C59] mb-1">Tecido: {record.tissue_type}</p>}
              {record.exudate && <p className="text-xs text-[#6B5C59] mb-1">Exsudato: {record.exudate}</p>}
              {record.treatment_applied && (
                <div className="text-sm text-[#6B5C59] mt-2 bg-[#F9F7F6] p-3 rounded-xl" dangerouslySetInnerHTML={{ __html: record.treatment_applied }} />
              )}
              {record.notes && (
                <div className="text-sm text-[#6B5C59] mt-2 bg-[#F9F7F6] p-3 rounded-xl" dangerouslySetInnerHTML={{ __html: record.notes }} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

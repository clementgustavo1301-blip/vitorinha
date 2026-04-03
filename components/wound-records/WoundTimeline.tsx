"use client"
import React from 'react'

export default function WoundTimeline() {
  const records = [
    {
      id: '1', date: 'Hoje', location: 'Calcâneo Esquerdo', improvement: true,
      notes: 'Redução do exsudato, bordas com sinal de epitelização.',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: '2', date: 'Há 7 dias', location: 'Calcâneo Esquerdo', improvement: false,
      notes: 'Desbridamento realizado. Exsudato purulento moderado.',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=300'
    }
  ]

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#A58079]/50 before:to-transparent">
      {records.map((record, index) => (
        <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#A58079] text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {index + 1}
          </div>
          
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white rounded-3xl border border-[#A58079]/10 shadow-sm p-4 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#1A1514]">{record.date}</span>
              {record.improvement ? (
                <span className="text-xs font-semibold px-2 py-1 rounded bg-[#A58079]/10 text-[#A58079] border border-[#A58079]/20">Evolução</span>
              ) : (
                <span className="text-xs font-semibold px-2 py-1 rounded bg-[#F9F7F6] text-[#2D2422] border border-[#A58079]/20">Estável</span>
              )}
            </div>
            <p className="text-sm font-semibold text-[#1A1514] mb-2">{record.location}</p>
            <p className="text-sm text-[#6B5C59] mb-4">{record.notes}</p>
            
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#A58079]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={record.image} alt="Evolução" className="object-cover w-full h-full" />
              <div className="absolute top-2 right-2 bg-white/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-[#1A1514]">Foto {index + 1}</div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#A58079]/20 bg-[#F9F7F6] hover:bg-[#A58079]/10 text-sm font-medium text-[#A58079] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Gerar PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

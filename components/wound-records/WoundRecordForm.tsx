"use client"
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function WoundRecordForm() {
  const [painLevel, setPainLevel] = useState<number>(5)
  const [treatment, setTreatment] = useState<string>('')
  const [observations, setObservations] = useState<string>('')

  const quillModules = {
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet'}],
      ['clean']
    ],
  }

  return (
    <form className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Localização da Lesão *</label>
          <input type="text" className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans" placeholder="Ex: Calcâneo E, Região Sacral..." required />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Tipo de Tecido</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {['Granulação', 'Epitelização', 'Esfacelo', 'Necrose / Escara'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white transition-colors">
                <input type="checkbox" className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded border-[#A58079]/30" />
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
              <label key={type} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white transition-colors">
                <input type="checkbox" className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded border-[#A58079]/30" />
                <span className="text-sm text-[#2D2422] font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Volume do Exsudato</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            {['Pouco', 'Médio', 'Muito'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white transition-colors">
                <input type="radio" name="volumeExsudato" value={type} className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded-full border-[#A58079]/30 cursor-pointer" />
                <span className="text-sm text-[#2D2422] font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2D2422]">Odor da Ferida</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {['Ausente', 'Leve', 'Forte', 'Intenso'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-[#A58079]/10 bg-[#F9F7F6] hover:bg-white transition-colors">
                <input type="radio" name="odorFerida" value={type} className="text-[#A58079] focus:ring-[#A58079] h-4 w-4 rounded-full border-[#A58079]/30 cursor-pointer" />
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#2D2422]">Nível de Dor Avaliado (Escala EVA)</span>
              <div className="group relative flex items-center justify-center">
                <svg className="w-4 h-4 text-[#A58079] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-white border border-[#A58079]/20 shadow-lg text-xs text-[#2D2422] rounded-xl z-10 font-normal shadow-[#A58079]/10">
                  A Escala Visual Analógica (EVA) é uma ferramenta para avaliar a intensidade da dor. Selecione de 0 (ausência de dor) a 10 (pior dor imaginável).
                </div>
              </div>
            </div>
            <span className="font-bold text-[#A58079] px-3 py-1.5 bg-[#A58079]/10 rounded-lg text-sm">{painLevel}/10</span>
          </div>
          <input 
            type="range" 
            min="0" max="10" 
            value={painLevel} 
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-[#F9F7F6] rounded-lg appearance-none cursor-pointer accent-[#A58079]" 
          />
          <div className="flex justify-between text-xs text-[#6B5C59] mt-3 font-medium">
            <span>0 (Sem dor)</span>
            <span>5 (Moderada)</span>
            <span>10 (Máxima)</span>
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

      <div className="space-y-2 pt-4 border-t border-[#A58079]/10">
        <label className="text-sm font-semibold text-[#2D2422]">Anexar Documentos / Exames</label>
        <div className="border-2 border-dashed border-[#A58079]/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-[#F9F7F6] hover:bg-[#A58079]/5 transition-colors cursor-pointer group">
          <input type="file" className="hidden" id="fileUpload" multiple />
          <label htmlFor="fileUpload" className="flex flex-col items-center cursor-pointer w-full">
            <svg className="w-8 h-8 text-[#A58079] mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-[#2D2422]">Clique para fazer upload</span>
            <span className="text-xs text-[#6B5C59] mt-1">Imagens, PDFs e Exames (Max 10MB)</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-[#A58079]/10">
        <button type="button" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-8 py-3 rounded-full font-medium shadow-md transition-all">Salvar Prontuário</button>
      </div>
    </form>
  )
}

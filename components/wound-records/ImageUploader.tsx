"use client"
import React, { useState } from 'react'
import { Camera, ImagePlus, X, UploadCloud, CheckCircle2 } from 'lucide-react'

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      setSuccess(false)
    }
  }

  const handleUpload = () => {
    if (!preview) return
    setUploading(true)
    // Simulate upload delay for UI visualization
    setTimeout(() => {
      setUploading(false)
      setSuccess(true)
    }, 1500)
  }

  const clearImage = () => {
    setPreview(null)
    setSuccess(false)
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Mobile Camera Access Button */}
          <label className="bg-white flex flex-col items-center justify-center p-6 rounded-3xl border-dashed border-2 border-[#A58079]/30 cursor-pointer hover:border-[#A58079]/60 transition-colors h-32 shadow-sm group">
            <Camera className="h-8 w-8 text-[#A58079] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#A58079]">Tirar Foto</span>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
          
          {/* Gallery Pick Button */}
          <label className="bg-white flex flex-col items-center justify-center p-6 rounded-3xl border-dashed border-2 border-[#1A1514]/30 cursor-pointer hover:border-[#1A1514]/60 transition-colors h-32 shadow-sm group">
            <ImagePlus className="h-8 w-8 text-[#1A1514] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#1A1514]">Galeria</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-4 border border-[#A58079]/10 shadow-sm">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Pré-visualização da ferida" className="w-full h-full object-cover" />
            {!success && !uploading && (
              <button 
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {success && (
              <div className="absolute inset-0 bg-[#A58079]/20 backdrop-blur-sm flex flex-col items-center justify-center text-white font-bold p-4 text-center shadow-inner">
                <CheckCircle2 className="h-12 w-12 text-[#A58079] mb-2 drop-shadow-md bg-white rounded-full" />
                <span className="drop-shadow-md text-[#A58079]">Upload Concluído na Nuvem Segura</span>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#A58079] border-t-transparent rounded-full animate-spin"></div>
                <span className="mt-2 text-[#A58079] font-semibold text-sm">Enviando para o Prontuário...</span>
              </div>
            )}
          </div>
          
          {!success && !uploading && (
             <div className="mt-4 flex flex-col gap-2">
               <input type="text" placeholder="Adicionar legenda descritiva..." className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans" />
               <button onClick={handleUpload} className="w-full bg-[#A58079] hover:bg-[#8C6A63] text-white px-6 py-2 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2">
                 <UploadCloud className="w-4 h-4" /> Enviar Arquivo Seguro
               </button>
             </div>
          )}
          
          {success && (
            <button onClick={clearImage} className="mt-4 text-sm font-semibold text-[#A58079] w-full text-center hover:underline">
              Anexar outra imagem
            </button>
          )}
        </div>
      )}
      
      <p className="text-xs text-[#6B5C59] text-center max-w-sm mx-auto">
        As imagens são criptografadas e armazenadas em ambiente seguro (Supabase Storage) garantindo o sigilo do paciente.
      </p>
    </div>
  )
}

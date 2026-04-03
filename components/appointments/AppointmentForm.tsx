"use client"
import React, { useState } from 'react'

export default function AppointmentForm() {
  const [cpf, setCpf] = useState('')
  const [isSearchingCpf, setIsSearchingCpf] = useState(false)
  const [patientData, setPatientData] = useState({
    name: '',
    dob: '',
    phone: '',
    cep: '',
    address: ''
  })
  const [isSearchingCep, setIsSearchingCep] = useState(false)

  // Simulated Supabase search function
  const handleCpfBlur = async () => {
    if (cpf.length < 11) return
    
    setIsSearchingCpf(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Simulate finding a patient in the database
    if (cpf.includes('123')) {
      setPatientData({
        name: 'Maria da Silva',
        dob: '1985-05-20',
        phone: '(11) 98765-4321',
        cep: '01001-000',
        address: 'Praça da Sé, Sé, São Paulo - SP' // Manual / Pre-filled address
      })
    }
    
    setIsSearchingCpf(false)
  }

  // ViaCEP search function
  const handleCepBlur = async () => {
    const cleanCep = patientData.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setIsSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      
      if (!data.erro) {
        setPatientData(prev => ({
          ...prev,
          address: `${data.logradouro}, , ${data.bairro}, ${data.localidade} - ${data.uf}`
        }))
      }
    } catch (error) {
      console.error("Erro ao buscar CEP")
    }
    setIsSearchingCep(false)
  }

  return (
    <form className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#A58079]/10 shadow-sm">
        <h3 className="text-lg font-bold text-[#1A1514] mb-4 border-b border-[#A58079]/10 pb-2">1. Dados do Paciente</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#2D2422]">Nome Completo</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              placeholder="Ex: Maria da Silva" 
              value={patientData.name}
              onChange={e => setPatientData({...patientData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422] flex items-center gap-2">
              CPF 
              {isSearchingCpf && <span className="text-xs text-[#A58079] animate-pulse">Buscando na base...</span>}
            </label>
            <input 
              type="text" 
              className={`w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans ${isSearchingCpf ? 'border-[#A58079]' : ''}`}
              placeholder="Digite com números..." 
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              onBlur={handleCpfBlur}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422]">Data de Nascimento</label>
            <input 
              type="date" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              value={patientData.dob}
              onChange={e => setPatientData({...patientData, dob: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422]">Telefone / WhatsApp</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              placeholder="(00) 00000-0000" 
              value={patientData.phone}
              onChange={e => setPatientData({...patientData, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422] flex items-center gap-2">
              CEP
              {isSearchingCep && <span className="text-xs text-[#A58079] animate-pulse">Buscando...</span>}
            </label>
            <input 
              type="text" 
              className={`w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans ${isSearchingCep ? 'border-[#A58079]' : ''}`}
              placeholder="00000-000" 
              value={patientData.cep}
              onChange={e => setPatientData({...patientData, cep: e.target.value})}
              onBlur={handleCepBlur}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#2D2422]">Endereço Completo (Editável livremente)</label>
            <input 
              type="text" 
              className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" 
              placeholder="Rua, Número, Bairro, Cidade" 
              value={patientData.address}
              onChange={e => setPatientData({...patientData, address: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#A58079]/10 shadow-sm">
        <h3 className="text-lg font-bold text-[#1A1514] mb-4 border-b border-[#A58079]/10 pb-2">2. Dados do Agendamento</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#2D2422]">Modalidade de Atendimento</label>
            <div className="flex gap-4">
              <label className="flex flex-1 items-center justify-center p-3 rounded-2xl border border-[#A58079]/30 cursor-pointer hover:bg-[#A58079]/5 transition-colors bg-[#F9F7F6]">
                <input type="radio" name="type" value="clinic" className="text-[#A58079] focus:ring-[#A58079] mr-2" defaultChecked />
                <span className="font-medium text-[#2D2422]">Clínica</span>
              </label>
              <label className="flex flex-1 items-center justify-center p-3 rounded-2xl border border-[#2D2422]/20 cursor-pointer hover:bg-[#2D2422]/5 transition-colors bg-[#F9F7F6]">
                <input type="radio" name="type" value="home" className="text-[#2D2422] focus:ring-[#2D2422] mr-2" />
                <span className="font-medium text-[#6B5C59]">Domiciliar</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D2422]">Data e Hora</label>
            <input type="datetime-local" className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-3 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans" />
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <label className="text-sm font-semibold text-[#2D2422]">Motivo do Agendamento (Opcional)</label>
          <textarea className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-2xl p-4 text-sm text-[#2D2422] outline-none focus:border-[#A58079] transition-all font-sans min-h-[80px]" placeholder="Primeira avaliação, troca de curativo, etc..."></textarea>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" className="border border-[#A58079] text-[#A58079] hover:bg-[#A58079] hover:text-white rounded-full px-6 py-2 transition-all font-medium">Cancelar</button>
        <button type="button" className="bg-[#A58079] hover:bg-[#8C6A63] text-white px-8 py-3 rounded-full font-medium shadow-md transition-all flex items-center justify-center gap-2">Finalizar Cadastro e Agendar</button>
      </div>
    </form>
  )
}

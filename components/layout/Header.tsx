"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ArrowLeftRight, Bell } from 'lucide-react'

import { getPageTitle } from '@/lib/navigation'

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="relative z-10 flex h-14 flex-shrink-0 items-center justify-between border-b border-[#A58079]/20 bg-[#1A1514] px-4 md:h-16 md:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <Activity className="h-5 w-5 text-[#A58079]" />
          <span className="text-sm font-bold text-white">{getPageTitle(pathname)}</span>
        </div>

        <div className="hidden flex-1 items-center md:flex" />

        <div className="relative ml-auto flex items-center gap-2">
          <Link
            href="/role-selection"
            className="relative cursor-pointer rounded-full p-2 text-[#E8DCDA] transition-all hover:bg-[#A58079]/10 hover:text-[#A58079] md:hidden"
            title="Alterar Vinculo"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </Link>

          <button
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className="relative cursor-pointer rounded-full p-2 text-[#E8DCDA] transition-all hover:bg-[#A58079]/10 hover:text-[#A58079]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-[#1A1514] bg-[#A58079]" />
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#A58079]/10 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="border-b border-[#A58079]/10 bg-[#F9F7F6] p-4">
                  <h3 className="font-bold text-[#1A1514]">Atualizacoes Recentes</h3>
                </div>
                <div className="max-h-80 space-y-4 overflow-y-auto p-4">
                  <div className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#A58079]" />
                    <div>
                      <p className="text-sm font-semibold text-[#2D2422]">Calendario Sincronizado</p>
                      <p className="mt-0.5 text-xs text-[#6B5C59]">A agenda hibrida agora puxa todos os agendamentos diretamente do banco de dados.</p>
                      <p className="mt-2 text-[10px] font-medium text-[#A58079]">06 de Abril, 2026</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#A58079]" />
                    <div>
                      <p className="text-sm font-semibold text-[#2D2422]">Galeria com Zoom Modal</p>
                      <p className="mt-0.5 text-xs text-[#6B5C59]">As fotos das feridas na linha do tempo agora expandem e permitem visualizacao em detalhes.</p>
                      <p className="mt-2 text-[10px] font-medium text-[#A58079]">06 de Abril, 2026</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-opacity-80">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gray-300" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Historico de Saude</p>
                      <p className="mt-0.5 text-xs text-gray-500">Foi adicionada aba para salvar comorbidades e cirurgias previas integradas a evolucao.</p>
                      <p className="mt-2 text-[10px] font-medium text-gray-400">06 de Abril, 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  )
}

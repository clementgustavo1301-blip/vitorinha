"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ArrowLeftRight, Bell, Menu, X } from 'lucide-react'

import { useRole } from '@/components/layout/RoleContext'
import { getNavItems, getPageTitle, isNavItemActive } from '@/lib/navigation'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const pathname = usePathname()
  const { role } = useRole()

  const navItems = getNavItems(role)

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

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="cursor-pointer rounded-lg p-2 text-[#F9F7F6] hover:bg-[#A58079]/10 md:hidden"
          >
            <Menu className="h-5 w-5" />
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

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="flex h-full w-72 max-w-[85vw] flex-col bg-[#1A1514] text-[#F9F7F6] shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-[#A58079]/20 px-5">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#A58079]" />
                <span className="font-bold text-white">Vitoria Luz</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full p-2 text-[#A58079] hover:bg-[#A58079]/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
              {navItems.map((item) => {
                const isActive = isNavItemActive(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                      isActive
                        ? 'bg-[#A58079] text-white shadow-md'
                        : 'text-[#E8DCDA] hover:bg-[#2D2422] hover:text-[#A58079]'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-[#A58079]/20 p-4">
              <div className="flex flex-col items-center rounded-2xl border border-[#A58079]/10 bg-[#2D2422] p-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#A58079]/30 bg-[#1A1514] text-lg font-bold text-[#A58079]">
                  {role === 'admin' ? 'AD' : role === 'nurse' ? 'VL' : 'RC'}
                </div>
                <span className="text-sm font-medium text-[#F9F7F6]">
                  {role === 'admin' ? 'Administrador / Gestor' : role === 'nurse' ? 'Enf. Vitoria Luz' : 'Recepcionista'}
                </span>
                <span className="mb-3 text-xs capitalize text-[#A58079] opacity-80">
                  {role === 'admin' ? 'Gestao Geral / Clinica' : role === 'nurse' ? 'Estomaterapeuta' : 'Administrativo'}
                </span>

                <Link
                  href="/role-selection"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#A58079]/20 bg-[#1A1514] py-2.5 text-xs font-semibold text-[#E8DCDA] transition-colors hover:text-[#A58079]"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Alterar Vinculo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

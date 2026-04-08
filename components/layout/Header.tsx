"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, X, Calendar, Users, Activity, Home, ArrowLeftRight, ShieldCheck } from 'lucide-react'
import { useRole } from '@/components/layout/RoleContext'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const pathname = usePathname()
  const { role, setRole } = useRole()

  const allNavItems = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['nurse', 'receptionist', 'admin'] },
    { name: 'Agenda Híbrida', href: '/calendar', icon: Calendar, roles: ['nurse', 'receptionist', 'admin'] },
    { name: 'Pacientes & Prontuários', href: '/patients', icon: Users, roles: ['nurse', 'admin'] },
    { name: 'Homologações', href: '/admin/approvals', icon: ShieldCheck, roles: ['admin'] },
  ]
  const navItems = allNavItems.filter(item => item.roles.includes(role))

  // Page title based on path
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.startsWith('/calendar')) return 'Agenda Híbrida'
    if (pathname.startsWith('/patients')) return 'Pacientes & Prontuários'
    if (pathname.startsWith('/appointments')) return 'Novo Agendamento'
    if (pathname.startsWith('/attendances')) return 'Novo Atendimento'
    if (pathname.startsWith('/admin')) return 'Homologações'
    return 'DermaCare'
  }

  return (
    <>
    <header className="h-14 md:h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-[#1A1514] border-b border-[#A58079]/20 z-10 relative">
      {/* Mobile: Logo + Page Title */}
      <div className="flex items-center gap-3 md:hidden">
        <Activity className="h-5 w-5 text-[#A58079]" />
        <span className="font-bold text-white text-sm">{getPageTitle()}</span>
      </div>

      <div className="hidden md:flex flex-1 items-center">
        {/* Desktop: empty or search bar slot */}
      </div>

      <div className="flex items-center gap-2 ml-auto relative">
        <Link 
          href="/role-selection"
          className="p-2 text-[#E8DCDA] hover:text-[#A58079] hover:bg-[#A58079]/10 rounded-full transition-all cursor-pointer relative md:hidden"
          title="Alterar Vínculo"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </Link>

        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="p-2 text-[#E8DCDA] hover:text-[#A58079] hover:bg-[#A58079]/10 rounded-full transition-all cursor-pointer relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A58079] rounded-full border border-[#1A1514]"></span>
        </button>

        {/* Mobile: hamburger for full menu with profile & role switch */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-[#F9F7F6] hover:bg-[#A58079]/10 rounded-lg cursor-pointer md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isNotificationsOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
            <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-[#A58079]/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-[#A58079]/10 bg-[#F9F7F6]">
                <h3 className="font-bold text-[#1A1514]">Atualizações Recentes</h3>
              </div>
              <div className="max-h-80 overflow-y-auto p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A58079] mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D2422]">Calendário Sincronizado</p>
                    <p className="text-xs text-[#6B5C59] mt-0.5">A agenda híbrida agora puxa todos os agendamentos diretamente do banco de dados.</p>
                    <p className="text-[10px] text-[#A58079] mt-2 font-medium">06 de Abril, 2026</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A58079] mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-[#2D2422]">Galeria com Zoom Modal</p>
                    <p className="text-xs text-[#6B5C59] mt-0.5">As fotos das feridas na linha do tempo agora expandem e permitem visualização em detalhes.</p>
                    <p className="text-[10px] text-[#A58079] mt-2 font-medium">06 de Abril, 2026</p>
                  </div>
                </div>
                <div className="flex gap-3 text-opacity-80">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Histórico de Saúde</p>
                    <p className="text-xs text-gray-500 mt-0.5">Foi adicionada aba para salvar comorbidades e cirurgias prévias integradas à evolução.</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">06 de Abril, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>

    {/* Mobile Menu Overlay — Drawer from right with profile/role-switch */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 bg-black/50 z-50 md:hidden flex justify-end" onClick={() => setIsMobileMenuOpen(false)}>
        <div 
          className="w-72 max-w-[85vw] h-full bg-[#1A1514] text-[#F9F7F6] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" 
          onClick={e => e.stopPropagation()}
        >
          <div className="h-14 flex items-center justify-between px-5 border-b border-[#A58079]/20">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#A58079]" />
              <span className="font-bold text-white">Vitória Luz</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#A58079] hover:bg-[#A58079]/10 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-[#A58079] text-white shadow-md' 
                      : 'text-[#E8DCDA] hover:bg-[#2D2422] hover:text-[#A58079]'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-[#A58079]/20">
            <div className="p-4 flex flex-col items-center bg-[#2D2422] rounded-2xl border border-[#A58079]/10">
              <div className="w-12 h-12 rounded-full bg-[#1A1514] border-2 border-[#A58079]/30 flex items-center justify-center text-[#A58079] font-bold text-lg mb-2">
                {role === 'admin' ? 'AD' : role === 'nurse' ? 'VL' : 'RC'}
              </div>
              <span className="text-sm font-medium text-[#F9F7F6]">
                {role === 'admin' ? 'Administrador' : role === 'nurse' ? 'Enf. Vitória Luz' : 'Recepcionista'}
              </span>
              <span className="text-xs text-[#A58079] opacity-80 mb-3 capitalize">
                {role === 'admin' ? 'Gestão Geral' : role === 'nurse' ? 'Estomaterapeuta' : 'Administrativo'}
              </span>
              
              <Link 
                href="/role-selection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-full bg-[#1A1514] text-[#E8DCDA] hover:text-[#A58079] border border-[#A58079]/20 transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Alterar Vínculo
              </Link>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

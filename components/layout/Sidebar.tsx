"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, Activity, Home, UserCheck, ArrowLeftRight, ShieldCheck, ChevronRight, ChevronLeft, Menu, HardDrive } from 'lucide-react'
import { useRole } from '@/components/layout/RoleContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { role, setRole } = useRole()
  const [isExpanded, setIsExpanded] = useState(false)

  const allNavItems = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['nurse', 'receptionist', 'admin'] },
    { name: 'Agenda Híbrida', href: '/calendar', icon: Calendar, roles: ['nurse', 'receptionist', 'admin'] },
    { name: 'Pacientes & Prontuários', href: '/patients', icon: Users, roles: ['nurse', 'admin'] },
    { name: 'Homologações', href: '/admin/approvals', icon: ShieldCheck, roles: ['admin'] },
    { name: 'Gerenciamento de Dados', href: '/admin/storage', icon: HardDrive, roles: ['admin'] },
  ]
  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <aside className={`${isExpanded ? 'w-64' : 'w-[84px]'} flex-shrink-0 hidden md:flex flex-col bg-[#1A1514] text-[#F9F7F6] border-r border-[#A58079]/20 shadow-2xl z-20 transition-all duration-300 overflow-hidden`}>
      <div className={`h-16 flex items-center border-b border-[#A58079]/20 transition-all ${isExpanded ? 'px-6 justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <Activity className="h-6 w-6 text-[#A58079] flex-shrink-0" />
          {isExpanded && <span className="font-bold text-white whitespace-nowrap">Vitória Luz</span>}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-[#A58079] hover:text-white p-1 rounded-md hover:bg-[#2D2422] transition-colors"
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5 flex-shrink-0" /> : <Menu className="w-5 h-5 flex-shrink-0" />}
        </button>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isExpanded ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                isExpanded ? 'w-full' : 'w-12 h-12 justify-center mx-auto'
              } ${
                isActive 
                  ? 'bg-[#A58079] text-white shadow-[0_4px_14px_rgba(165,128,121,0.4)]' 
                  : 'text-[#E8DCDA] hover:bg-[#2D2422] hover:text-[#A58079]'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-[#A58079]/20">
        <div className={`flex ${isExpanded ? 'flex-row px-3' : 'flex-col'} items-center gap-4 py-4 justify-between transition-all`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#2D2422] border border-[#A58079]/30 flex items-center justify-center text-[#A58079] font-bold shadow-inner">
              {role === 'admin' ? 'AD' : role === 'nurse' ? 'VL' : 'RC'}
            </div>
            {isExpanded && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white whitespace-nowrap">Seu Perfil</span>
                <span className="text-xs text-[#A58079] whitespace-nowrap capitalize">{role}</span>
              </div>
            )}
          </div>
          
          <Link 
            href="/role-selection"
            title="Trocar Vínculo"
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#1A1514] text-[#E8DCDA] hover:text-[#A58079] hover:bg-[#2D2422] border border-[#A58079]/20 transition-all`}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ArrowLeftRight, ChevronLeft, Menu } from 'lucide-react'

import { useRole } from '@/components/layout/RoleContext'
import { getNavItems, isNavItemActive } from '@/lib/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  const { role } = useRole()
  const [isExpanded, setIsExpanded] = useState(false)

  const navItems = getNavItems(role)

  return (
    <aside className={`${isExpanded ? 'w-64' : 'w-[84px]'} flex-shrink-0 hidden md:flex flex-col overflow-hidden border-r border-[#A58079]/20 bg-[#1A1514] text-[#F9F7F6] shadow-2xl transition-all duration-300`}>
      <div className={`h-16 flex items-center border-b border-[#A58079]/20 transition-all ${isExpanded ? 'justify-between px-6' : 'justify-center'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <Activity className="h-6 w-6 flex-shrink-0 text-[#A58079]" />
          {isExpanded && <span className="whitespace-nowrap font-bold text-white">Vitoria Luz</span>}
        </div>
        <button
          onClick={() => setIsExpanded((current) => !current)}
          className="rounded-md p-1 text-[#A58079] transition-colors hover:bg-[#2D2422] hover:text-white"
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5 flex-shrink-0" /> : <Menu className="h-5 w-5 flex-shrink-0" />}
        </button>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 py-6">
        <div className="space-y-4">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300 ${
                  isExpanded ? 'w-full' : 'mx-auto h-12 w-12 justify-center'
                } ${
                  isActive
                    ? 'bg-[#A58079] text-white shadow-[0_4px_14px_rgba(165,128,121,0.4)]'
                    : 'text-[#E8DCDA] hover:bg-[#2D2422] hover:text-[#A58079]'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span className="overflow-hidden whitespace-nowrap text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-[#A58079]/20 p-3">
        <div className={`flex items-center justify-between gap-4 py-4 transition-all ${isExpanded ? 'flex-row px-3' : 'flex-col'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#A58079]/30 bg-[#2D2422] font-bold text-[#A58079] shadow-inner">
              {role === 'admin' ? 'AD' : role === 'nurse' ? 'VL' : 'RC'}
            </div>
            {isExpanded && (
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-sm font-bold text-white">Seu Perfil</span>
                <span className="whitespace-nowrap text-xs capitalize text-[#A58079]">{role}</span>
              </div>
            )}
          </div>

          <Link
            href="/role-selection"
            title="Alterar Vinculo"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#A58079]/20 bg-[#1A1514] text-[#E8DCDA] transition-all hover:bg-[#2D2422] hover:text-[#A58079]"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

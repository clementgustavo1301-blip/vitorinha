"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeftRight } from 'lucide-react'

import { useRole } from '@/components/layout/RoleContext'
import { getNavItems, isNavItemActive } from '@/lib/navigation'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { role } = useRole()

  const navItems = getNavItems(role)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="pointer-events-none h-6 bg-gradient-to-t from-[#F9F7F6] to-transparent" />

      <div className="border-t border-[#A58079]/20 bg-[#1A1514]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex h-16 min-w-max items-center gap-1 px-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(pathname, item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-[#E8DCDA]/60 active:scale-95'
                  }`}
                >
                  <div className={`rounded-xl p-1.5 transition-all duration-300 ${isActive ? 'bg-[#A58079] shadow-[0_2px_12px_rgba(165,128,121,0.5)]' : ''}`}>
                    <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wide transition-colors ${isActive ? 'text-[#A58079]' : ''}`}>
                    {item.mobileLabel}
                  </span>
                </Link>
              )
            })}

            <Link
              href="/role-selection"
              className="flex min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1.5 text-[#E8DCDA]/60 transition-all duration-300 active:scale-95"
              title="Alterar Vinculo"
            >
              <div className="rounded-xl p-1.5 transition-all duration-300">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">Vinculo</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

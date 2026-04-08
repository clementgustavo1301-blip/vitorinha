"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
        <div className="mx-auto flex h-16 max-w-[380px] items-center justify-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-[62px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition-all duration-300 sm:w-[70px] ${
                  isActive ? 'text-white' : 'text-[#E8DCDA]/60 active:scale-95'
                }`}
              >
                <div className={`rounded-xl p-1.5 transition-all duration-300 ${isActive ? 'bg-[#A58079] shadow-[0_2px_12px_rgba(165,128,121,0.5)]' : ''}`}>
                  <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-center text-[10px] font-semibold leading-tight tracking-wide transition-colors ${isActive ? 'text-[#A58079]' : ''}`}>
                  {item.mobileLabel}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

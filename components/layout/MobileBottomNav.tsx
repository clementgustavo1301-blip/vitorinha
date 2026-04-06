"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, Activity, ShieldCheck, ArrowLeftRight } from 'lucide-react'
import { useRole } from '@/components/layout/RoleContext'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { role } = useRole()

  const allNavItems = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['nurse', 'receptionist', 'admin'] },
    { name: 'Agenda', href: '/calendar', icon: Calendar, roles: ['nurse', 'receptionist', 'admin'] },
    { name: 'Prontuários', href: '/patients', icon: Users, roles: ['nurse', 'admin'] },
    { name: 'Evoluções', href: '/wound-records', icon: Activity, roles: ['nurse', 'admin'] },
    { name: 'Admin', href: '/admin/approvals', icon: ShieldCheck, roles: ['admin'] },
  ]
  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      {/* Gradient fade above the bar */}
      <div className="h-6 bg-gradient-to-t from-[#F9F7F6] to-transparent pointer-events-none" />
      
      <div className="bg-[#1A1514]/95 backdrop-blur-xl border-t border-[#A58079]/20 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 min-w-[56px] ${
                  isActive
                    ? 'text-white'
                    : 'text-[#E8DCDA]/60 active:scale-95'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-[#A58079] shadow-[0_2px_12px_rgba(165,128,121,0.5)]' : ''
                }`}>
                  <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  isActive ? 'text-[#A58079]' : ''
                }`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
          
          <Link
            href="/role-selection"
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 min-w-[56px] text-[#E8DCDA]/60 active:scale-95"
            title="Trocar Vínculo"
          >
            <div className="p-1.5 rounded-xl transition-all duration-300">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold tracking-wide">Trocar</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

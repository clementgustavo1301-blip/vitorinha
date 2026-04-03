"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Search, X, Calendar, Users, Activity, Home, UserCheck } from 'lucide-react'
import { useRole } from '@/components/layout/RoleContext'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { role, setRole } = useRole()

  const allNavItems = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['nurse', 'receptionist'] },
    { name: 'Agenda Híbrida', href: '/calendar', icon: Calendar, roles: ['nurse', 'receptionist'] },
    { name: 'Pacientes', href: '/patients', icon: Users, roles: ['nurse'] },
    { name: 'Prontuários', href: '/wound-records', icon: Activity, roles: ['nurse'] },
  ]
  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <>
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-[#1A1514] border-b border-[#A58079]/20 z-10 relative">
      <div className="flex items-center md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-[#F9F7F6] hover:bg-[#A58079]/10 rounded-lg cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      
      <div className="hidden md:flex flex-1 items-center">
        {/* Search bar removed as requested */}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 text-[#E8DCDA] hover:text-[#A58079] hover:bg-[#A58079]/10 rounded-full transition-all cursor-pointer relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A58079] rounded-full border border-[#1A1514]"></span>
        </button>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 bg-black/50 z-50 md:hidden flex" onClick={() => setIsMobileMenuOpen(false)}>
        <div className="w-64 h-full bg-[#1A1514] text-[#F9F7F6] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#A58079]/20">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-[#A58079] mr-2" />
              <span className="font-serif font-bold text-xl tracking-wide text-[#F9F7F6]">DermaCare</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#A58079] hover:bg-[#A58079]/10 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-[#A58079] text-white shadow-md' 
                      : 'text-[#E8DCDA] hover:bg-[#2D2422] hover:text-[#A58079]'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium tracking-wide text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-[#A58079]/20">
            <div className="p-4 flex flex-col items-center bg-[#2D2422] rounded-3xl border border-[#A58079]/10">
              <div className="w-10 h-10 rounded-full bg-[#1A1514] border border-[#A58079]/30 flex items-center justify-center text-[#A58079] font-bold mb-2">
                {role === 'nurse' ? 'VL' : 'RC'}
              </div>
              <span className="text-sm font-medium text-[#F9F7F6]">
                {role === 'nurse' ? 'Enf. Vitória Luz' : 'Recepcionista'}
              </span>
              <span className="text-xs text-[#A58079] opacity-80 mb-3">
                {role === 'nurse' ? 'Estomaterapeuta' : 'Administrativo'}
              </span>
              
              <button 
                onClick={() => {
                  setRole(role === 'nurse' ? 'receptionist' : 'nurse')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold rounded-full bg-[#1A1514] text-[#E8DCDA] hover:text-[#A58079] border border-[#A58079]/20 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Visto como {role === 'nurse' ? 'Recepção' : 'Enfermeira'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

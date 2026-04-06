"use client"
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { useRole } from '@/components/layout/RoleContext'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useRole()
  const isRoleSelection = pathname === '/role-selection'
  const isLogin = pathname === '/login'

  useEffect(() => {
    if (!loading && !user && !isLogin) {
      router.push('/login')
    }
  }, [user, loading, isLogin, router])

  if (loading) return null
  if (isLogin) return <>{children}</>

  if (isRoleSelection) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

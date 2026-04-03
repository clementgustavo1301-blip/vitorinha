"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'

export type Role = 'nurse' | 'receptionist' | 'admin'

interface RoleContextType {
  role: Role
  clinicId: string | null
  setRole: (role: Role) => void
  setClinicId: (id: string | null) => void
  user: any
  loading: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('nurse')
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = require('@/lib/supabase/client').createClient()
    
    // Check session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    const savedRole = localStorage.getItem('dermacare-role') as Role
    const savedClinic = localStorage.getItem('dermacare-clinic')
    if (savedRole) setRole(savedRole)
    if (savedClinic) setClinicId(savedClinic)

    return () => subscription.unsubscribe()
  }, [])

  const handleSetRole = (r: Role) => {
    setRole(r)
    localStorage.setItem('dermacare-role', r)
  }

  const handleSetClinic = (id: string | null) => {
    setClinicId(id)
    if (id) localStorage.setItem('dermacare-clinic', id)
    else localStorage.removeItem('dermacare-clinic')
  }

  // if (loading) return null // Removed to allow children to handle loading state

  return (
    <RoleContext.Provider value={{ role, clinicId, setRole: handleSetRole, setClinicId: handleSetClinic, user, loading }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

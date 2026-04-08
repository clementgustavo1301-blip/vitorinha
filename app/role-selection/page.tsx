"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Building2,
  ClipboardList,
  Clock,
  LogOut,
  Plus,
  Shield,
  Stethoscope,
  X,
} from 'lucide-react'

import CustomSelect from '@/components/ui/CustomSelect'
import { createClient } from '@/lib/supabase/client'
import { Role, useRole } from '@/components/layout/RoleContext'

interface Clinic {
  id: string
  name: string
}

interface ClinicRelation {
  name: string
}

type ClinicJoin = ClinicRelation[] | null

interface UserRoleRecord {
  clinic_id: string
  clinics: ClinicJoin
  id: string
  role: Role
}

interface PendingRoleRecord {
  clinic_id: string
  clinics: ClinicJoin
  id: string
  role: Role
}

type TransitionPhase = 'idle' | 'opening' | 'closing'

const TRANSITION_DURATION_MS = 220

const roleDefinitions = [
  {
    description: 'Acesso completo ao sistema e gerenciamento.',
    icon: Shield,
    iconBg: 'bg-amber-100 text-amber-700',
    id: 'admin' as Role,
    title: 'Administrador / Gestor',
  },
  {
    description: 'Prontuarios e evolucao de feridas.',
    icon: Stethoscope,
    iconBg: 'bg-[#A58079]/10 text-[#A58079]',
    id: 'nurse' as Role,
    title: 'Enfermeiro(a)',
  },
  {
    description: 'Agendamentos e cadastro de pacientes.',
    icon: ClipboardList,
    iconBg: 'bg-[#6B5C59]/10 text-[#6B5C59]',
    id: 'receptionist' as Role,
    title: 'Recepcao',
  },
]

export default function RoleSelectionPage() {
  const router = useRouter()
  const { setRole, setClinicId, user } = useRole()
  const supabase = useRef(createClient()).current

  const [clinics, setClinics] = useState<Clinic[]>([])
  const [userRoles, setUserRoles] = useState<UserRoleRecord[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRoleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle')
  const [formClinic, setFormClinic] = useState('')
  const [formRole, setFormRole] = useState<Role | ''>('')
  const [formCoren, setFormCoren] = useState('')
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      setLoading(true)

      const [clinicsRes, rolesRes, requestsRes] = await Promise.all([
        supabase.from('clinics').select('id, name'),
        supabase.from('user_clinic_roles').select('id, role, clinic_id, clinics(name)').eq('user_id', user.id),
        supabase.from('role_requests').select('id, role, clinic_id, clinics(name)').eq('user_id', user.id).eq('status', 'pending'),
      ])

      setClinics((clinicsRes.data ?? []) as Clinic[])
      setUserRoles((rolesRes.data ?? []) as UserRoleRecord[])
      setPendingRequests((requestsRes.data ?? []) as PendingRoleRecord[])
      setLoading(false)
    }

    void fetchData()
  }, [router, supabase, user])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const scheduleTransition = (callback: () => void) => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    transitionTimeoutRef.current = setTimeout(() => {
      callback()
      transitionTimeoutRef.current = null
    }, TRANSITION_DURATION_MS)
  }

  const resetForm = () => {
    setFormClinic('')
    setFormRole('')
    setFormCoren('')
  }

  const openForm = () => {
    if (showForm || transitionPhase !== 'idle') return

    setTransitionPhase('opening')

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    scheduleTransition(() => {
      setShowForm(true)
      setTransitionPhase('idle')
    })
  }

  const closeForm = () => {
    if (!showForm || transitionPhase !== 'idle') return

    setTransitionPhase('closing')

    scheduleTransition(() => {
      setShowForm(false)
      setTransitionPhase('idle')
      resetForm()
    })
  }

  const handleRequestRole = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formClinic || !formRole || !user) return

    if (formRole === 'nurse' && !formCoren.trim()) {
      alert('Por favor, informe seu COREN.')
      return
    }

    setRequesting(true)

    try {
      const { error } = await supabase.from('role_requests').insert({
        clinic_id: formClinic,
        coren: formRole === 'nurse' ? formCoren : null,
        role: formRole,
        status: 'pending',
        user_id: user.id,
      })

      if (error) {
        throw error
      }

      const { data } = await supabase
        .from('role_requests')
        .select('id, role, clinic_id, clinics(name)')
        .eq('user_id', user.id)
        .eq('status', 'pending')

      setPendingRequests((data ?? []) as PendingRoleRecord[])
      setShowForm(false)
      setTransitionPhase('idle')
      resetForm()
      alert('Solicitacao enviada com sucesso! Aguarde a homologacao do administrador.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel enviar a solicitacao.'
      alert(message)
    } finally {
      setRequesting(false)
    }
  }

  const handleEnter = (role: Role, clinicId: string) => {
    setRole(role)
    setClinicId(clinicId)
    router.push('/')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Activity className="h-10 w-12 animate-pulse text-[#A58079]" />
        <p className="font-medium text-[#6B5C59]">Carregando seus vinculos...</p>
      </div>
    )
  }

  const getRoleDef = (roleId: Role) => roleDefinitions.find((roleDefinition) => roleDefinition.id === roleId)
  const getClinicName = (clinicJoin: ClinicJoin) => clinicJoin?.[0]?.name || 'Clinica sem nome'
  const showListPanel = !showForm || transitionPhase === 'opening'
  const showFormPanel = showForm || transitionPhase === 'closing'
  const isSwitching = transitionPhase !== 'idle'

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      <div className="mb-12 flex items-start justify-between">
        <div className="flex-1 text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl border border-[#A58079]/20 bg-white p-3 shadow-sm">
              <Activity className="h-8 w-8 text-[#A58079]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1A1514]">
                Vitoria <span className="text-[#A58079]">Luz</span>
              </h1>
              <p className="text-sm italic text-[#6B5C59]">Gestao Dermatologica Especializada</p>
            </div>
          </div>
          <p className="mt-2 max-w-md text-sm text-[#6B5C59] md:text-base">
            Ola, <span className="font-bold text-[#2D2422]">{user?.user_metadata?.full_name || user?.email}</span>.
            {' '}Meus Vinculos:
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-2xl border border-red-100 bg-white p-3 text-red-500 shadow-sm transition-colors hover:bg-red-50"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="relative">
        {showListPanel && (
          <div
            className={`space-y-8 transition-all duration-200 ${
              !showForm ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : ''
            } ${
              transitionPhase === 'opening'
                ? 'pointer-events-none translate-y-4 scale-[0.985] opacity-0 blur-[2px]'
                : 'translate-y-0 scale-100 opacity-100 blur-0'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2D2422]">Meus Vinculos</h2>
              <button
                onClick={openForm}
                disabled={isSwitching}
                className="flex items-center gap-2 rounded-2xl bg-[#A58079] px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-none disabled:cursor-wait disabled:opacity-70"
              >
                <Plus className="h-5 w-5" /> Novo Vinculo
              </button>
            </div>

            {userRoles.length === 0 && pendingRequests.length === 0 ? (
              <div className="rounded-[40px] border border-[#A58079]/10 bg-white p-12 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-[#A58079]/30" />
                <h3 className="text-lg font-bold text-[#2D2422]">Nenhum vinculo encontrado</h3>
                <p className="mt-2 text-[#6B5C59]">Clique em Novo Vinculo para solicitar acesso a uma clinica.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userRoles.map((userRole) => {
                  const roleDefinition = getRoleDef(userRole.role)

                  if (!roleDefinition) {
                    return null
                  }

                  return (
                    <div key={userRole.id} className="flex h-full flex-col rounded-3xl border border-[#A58079]/20 bg-white p-6 shadow-md">
                      <div className="mb-4 flex items-start justify-between">
                        <div className={`rounded-2xl p-3 ${roleDefinition.iconBg}`}>
                          <roleDefinition.icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Ativo</span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-[#2D2422]">{roleDefinition.title}</h3>
                      <p className="mb-4 flex flex-1 items-center gap-1 text-sm font-medium text-[#A58079]">
                        <Building2 className="h-4 w-4" /> {getClinicName(userRole.clinics)}
                      </p>
                      <button
                        onClick={() => handleEnter(userRole.role, userRole.clinic_id)}
                        className="mt-auto w-full rounded-2xl bg-[#2D2422] py-3 font-bold text-[#F9F7F6] transition-colors hover:bg-[#1A1514]"
                      >
                        Acessar Unidade
                      </button>
                    </div>
                  )
                })}

                {pendingRequests.map((request) => {
                  const roleDefinition = getRoleDef(request.role)

                  if (!roleDefinition) {
                    return null
                  }

                  return (
                    <div key={request.id} className="flex h-full cursor-not-allowed flex-col rounded-3xl border border-dashed border-[#A58079]/10 bg-[#F9F7F6] p-6 opacity-70">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="rounded-2xl bg-gray-200 p-3 text-gray-500">
                          <roleDefinition.icon className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                          <Clock className="h-3 w-3" /> Pendente
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-[#2D2422]">{roleDefinition.title}</h3>
                      <p className="mb-4 flex flex-1 items-center gap-1 text-sm font-medium text-[#A58079]">
                        <Building2 className="h-4 w-4" /> {getClinicName(request.clinics)}
                      </p>
                      <div className="mt-auto w-full rounded-2xl border border-[#A58079]/10 bg-white py-3 text-center text-sm font-medium text-[#6B5C59]">
                        Aguardando Homologacao...
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {showFormPanel && (
          <div
            className={`rounded-[40px] border border-[#A58079]/20 bg-white p-8 shadow-xl transition-all duration-200 md:p-12 ${
              showForm ? 'animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300' : ''
            } ${
              transitionPhase === 'closing'
                ? 'pointer-events-none -translate-y-4 scale-[0.985] opacity-0 blur-[2px]'
                : 'translate-y-0 scale-100 opacity-100 blur-0'
            }`}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2D2422]">Solicitar Novo Vinculo</h2>
              <button
                onClick={closeForm}
                disabled={isSwitching}
                className="rounded-full p-2 text-[#6B5C59] transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleRequestRole} className="mx-auto max-w-xl space-y-6">
              <CustomSelect
                label="Selecione a Clinica"
                placeholder="Selecione uma clinica..."
                options={clinics.map((clinic) => ({ label: clinic.name, value: clinic.id }))}
                value={formClinic}
                onChange={setFormClinic}
                rounded="!rounded-[28px]"
                className="!py-0"
              />

              <CustomSelect
                label="Selecione o seu Perfil"
                placeholder="Selecione um perfil..."
                options={roleDefinitions.map((roleDefinition) => ({
                  description: roleDefinition.description,
                  label: roleDefinition.title,
                  value: roleDefinition.id,
                }))}
                value={formRole}
                onChange={(value) => setFormRole(value as Role)}
                rounded="!rounded-[28px]"
                className="!py-0 mt-4"
              />

              {formRole === 'nurse' && (
                <div className="animate-in slide-in-from-top-2 space-y-2 pt-4">
                  <label className="ml-4 text-sm font-bold text-[#2D2422]">COREN (Obrigatorio)</label>
                  <input
                    type="text"
                    value={formCoren}
                    onChange={(event) => setFormCoren(event.target.value)}
                    placeholder="Digite seu numero do COREN..."
                    className="w-full rounded-[28px] border border-[#A58079]/20 bg-[#F9F7F6] px-6 py-4 font-sans text-[#2D2422] transition-all focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10"
                    required
                  />
                </div>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={!formClinic || !formRole || (formRole === 'nurse' && !formCoren.trim()) || requesting}
                  className="w-full rounded-full bg-[#2D2422] py-4 font-bold text-[#F9F7F6] shadow-lg transition-colors hover:bg-[#1A1514] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {requesting ? 'Enviando...' : 'Confirmar Solicitacao'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/layout/RoleContext'

type ManagedRole = 'admin' | 'nurse' | 'receptionist'

interface ClinicRelation {
  name: string
}

type ClinicJoin = ClinicRelation[] | null

interface RoleRequestRecord {
  clinic_id: string
  clinics: ClinicJoin
  coren: string | null
  id: string
  role: ManagedRole
  user_id: string
}

interface ActiveRoleRecord {
  clinic_id: string
  clinics: ClinicJoin
  coren: string | null
  id: string
  role: ManagedRole
  user_id: string
}

export default function AdminApprovalsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending')
  const [requests, setRequests] = useState<RoleRequestRecord[]>([])
  const [activeRoles, setActiveRoles] = useState<ActiveRoleRecord[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const { user, role, clinicId, setClinicId } = useRole()
  const supabase = useRef(createClient()).current

  const fetchUserNames = useCallback(async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)]

    if (uniqueIds.length === 0) {
      return {}
    }

    const response = await fetch('/api/admin/users/names', {
      body: JSON.stringify({ userIds: uniqueIds }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const payload = (await response.json()) as {
      error?: string
      names?: Record<string, string>
    }

    if (!response.ok) {
      throw new Error(payload.error || 'Nao foi possivel carregar os nomes dos usuarios.')
    }

    const names: Record<string, string> = {}
    Object.assign(names, payload.names ?? {})
    return names
  }, [])

  useEffect(() => {
    if (role !== 'admin') {
      return
    }

    const fetchData = async () => {
      setLoading(true)

      const [pendingResponse, activeResponse] = await Promise.all([
        supabase
          .from('role_requests')
          .select('id, role, user_id, clinic_id, coren, clinics(name)')
          .eq('status', 'pending'),
        supabase
          .from('user_clinic_roles')
          .select('id, role, user_id, clinic_id, coren, clinics(name)'),
      ])

      const pendingItems = (pendingResponse.data ?? []) as RoleRequestRecord[]
      const activeItems = (activeResponse.data ?? []) as ActiveRoleRecord[]

      setRequests(pendingItems)
      setActiveRoles(activeItems)

      const names = await fetchUserNames([
        ...pendingItems.map((item) => item.user_id),
        ...activeItems.map((item) => item.user_id),
      ])

      setUserNames(names)
      setLoading(false)
    }

    void fetchData()
  }, [clinicId, fetchUserNames, role, supabase])

  const getUserName = (userId: string) => {
    if (userId === user?.id) {
      return user.user_metadata?.full_name || user.email || `Usuario ${userId.slice(0, 5)}...`
    }

    return userNames[userId] || `Usuario ${userId.slice(0, 5)}...`
  }
  const getClinicName = (clinicJoin: ClinicJoin) => clinicJoin?.[0]?.name || 'Clinica sem nome'

  const getRoleLabel = (roleName: ManagedRole) => {
    if (roleName === 'admin') return 'Gestor'
    if (roleName === 'nurse') return 'Enfermeiro(a)'
    return 'Recepcao'
  }

  const handleAction = async (
    requestId: string,
    status: 'approved' | 'rejected',
    userId: string,
    selectedClinicId: string,
    roleRequested: ManagedRole,
    coren: string | null
  ) => {
    try {
      if (status === 'approved') {
        const { error: roleError } = await supabase.from('user_clinic_roles').insert({
          clinic_id: selectedClinicId,
          coren,
          role: roleRequested,
          user_id: userId,
        })

        if (roleError) {
          throw roleError
        }
      }

      const { error: requestError } = await supabase
        .from('role_requests')
        .update({ status })
        .eq('id', requestId)

      if (requestError) {
        throw requestError
      }

      setRequests((current) => current.filter((request) => request.id !== requestId))

      if (status === 'approved') {
        const { data } = await supabase
          .from('user_clinic_roles')
          .select('id, role, user_id, clinic_id, coren, clinics(name)')

        setActiveRoles((data ?? []) as ActiveRoleRecord[])
      }

      alert(status === 'approved' ? 'Solicitacao aprovada!' : 'Solicitacao recusada.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel concluir a acao.'
      alert(message)
    }
  }

  const handleDeleteRole = async (roleRecord: ActiveRoleRecord) => {
    const isCurrentActiveRole =
      roleRecord.user_id === user?.id &&
      roleRecord.role === role &&
      roleRecord.clinic_id === clinicId

    const confirmationMessage = isCurrentActiveRole
      ? 'Voce esta revogando o vinculo ativo desta sessao. Deseja continuar e voltar para a selecao de vinculos?'
      : 'Tem certeza que deseja excluir e revogar o acesso deste usuario?'

    if (!window.confirm(confirmationMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/roles/${roleRecord.id}`, {
        method: 'DELETE',
      })

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Nao foi possivel excluir o vinculo.')
      }

      setActiveRoles((current) => current.filter((item) => item.id !== roleRecord.id))
      alert('Vinculo revogado com sucesso!')

      if (isCurrentActiveRole) {
        setClinicId(null)
        router.push('/role-selection')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel excluir o vinculo.'
      alert(message)
    }
  }

  if (role !== 'admin') {
    return <div className="p-8 text-center font-bold text-red-500">Acesso negado. Apenas gestores e administradores.</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1514]">Gestao de Vinculos</h1>
          <p className="mt-1 text-[#6B5C59]">Gerencie acessos e solicitacoes das unidades.</p>
        </div>
        <div className="rounded-2xl border border-[#A58079]/20 bg-[#A58079]/10 p-3">
          <Shield className="h-6 w-6 text-[#A58079]" />
        </div>
      </div>

      <div className="flex gap-8 border-b border-[#A58079]/20">
        <button
          onClick={() => setActiveTab('pending')}
          className={`relative pb-4 text-sm font-bold transition-all ${
            activeTab === 'pending' ? 'text-[#2D2422]' : 'text-[#6B5C59] hover:text-[#A58079]'
          }`}
        >
          <div className="flex items-center gap-2">
            Solicitacoes Pendentes
            {requests.length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">{requests.length}</span>
            )}
          </div>
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[#A58079]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`relative pb-4 text-sm font-bold transition-all ${
            activeTab === 'active' ? 'text-[#2D2422]' : 'text-[#6B5C59] hover:text-[#A58079]'
          }`}
        >
          <div className="flex items-center gap-2">Vinculos Ativos</div>
          {activeTab === 'active' && (
            <div className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[#A58079]" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Activity className="h-8 w-8 animate-spin text-[#A58079]" />
        </div>
      ) : activeTab === 'pending' ? (
        requests.length === 0 ? (
          <div className="rounded-[40px] border border-[#A58079]/10 bg-white p-16 text-center shadow-sm">
            <Clock className="mx-auto mb-4 h-12 w-12 text-[#A58079]/20" />
            <h2 className="text-xl font-bold text-[#2D2422]">Nenhuma solicitacao pendente</h2>
            <p className="mt-2 text-[#6B5C59]">Tudo em dia! Novos pedidos aparecerao aqui.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#A58079]/20 bg-white p-6 shadow-md transition-all md:flex-row md:p-8">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#A58079]/10 bg-[#F9F7F6] text-[#A58079] shadow-inner">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2D2422]">{getUserName(request.user_id)}</h3>
                    <p className="text-sm text-[#6B5C59]">
                      Solicita: <span className="font-bold text-[#A58079]">{getRoleLabel(request.role)}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-[#F9F7F6] px-3 py-1 text-xs font-bold text-[#6B5C59]">
                        <Building2 className="h-3 w-3" /> {getClinicName(request.clinics)}
                      </span>
                      {request.coren && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          COREN: {request.coren}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
                  <button
                    onClick={() => handleAction(request.id, 'rejected', request.user_id, request.clinic_id, request.role, request.coren)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 sm:w-auto"
                  >
                    <X className="h-4 w-4" /> Recusar
                  </button>
                  <button
                    onClick={() => handleAction(request.id, 'approved', request.user_id, request.clinic_id, request.role, request.coren)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#A58079] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#A58079]/30 transition-all hover:shadow-none sm:w-auto"
                  >
                    <Check className="h-4 w-4" /> Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeRoles.length === 0 ? (
        <div className="rounded-[40px] border border-[#A58079]/10 bg-white p-16 text-center shadow-sm">
          <User className="mx-auto mb-4 h-12 w-12 text-[#A58079]/20" />
          <h2 className="text-xl font-bold text-[#2D2422]">Nenhum vinculo ativo</h2>
          <p className="mt-2 text-[#6B5C59]">Os vinculos homologados aparecerao aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeRoles.map((roleRecord) => {
            const isCurrentUserRole = roleRecord.user_id === user?.id

            return (
              <div key={roleRecord.id} className="group flex h-full flex-col rounded-3xl border border-[#A58079]/20 bg-white p-6 shadow-md transition-all hover:border-[#A58079]/40 hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className={`rounded-2xl p-3 shadow-inner ${
                    roleRecord.role === 'admin'
                      ? 'bg-amber-100 text-amber-700'
                      : roleRecord.role === 'nurse'
                        ? 'bg-[#A58079]/10 text-[#A58079]'
                        : 'bg-[#6B5C59]/10 text-[#6B5C59]'
                  }`}>
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> Ativo
                    </span>
                    <button
                      onClick={() => handleDeleteRole(roleRecord)}
                      title={isCurrentUserRole ? 'Revogar meu vinculo' : 'Revogar vinculo'}
                      className="pointer-events-none inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 opacity-0 shadow-sm transition-all duration-200 active:scale-90 group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-red-50 focus:pointer-events-auto focus:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="mb-1 text-lg font-bold text-[#2D2422]">{getUserName(roleRecord.user_id)}</h3>
                <p className="mb-2 text-sm font-bold text-[#A58079]">{getRoleLabel(roleRecord.role)}</p>

                <div className="mb-4 flex-1 space-y-2">
                  <p className="flex items-center gap-1 text-sm font-medium text-[#6B5C59]">
                    <Building2 className="h-4 w-4" /> {getClinicName(roleRecord.clinics)}
                  </p>
                  {roleRecord.coren && (
                    <p className="flex w-fit items-center gap-1 rounded-md bg-[#F9F7F6] px-2 py-1 text-xs font-bold text-[#6B5C59]">
                      COREN: {roleRecord.coren}
                    </p>
                  )}
                  {isCurrentUserRole && (
                    <p className="w-fit rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                      Vinculo atual
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/layout/RoleContext'
import { Check, X, Clock, User, Building2, Shield, Activity, Trash2, CheckCircle2 } from 'lucide-react'

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending')
  const [requests, setRequests] = useState<any[]>([])
  const [activeRoles, setActiveRoles] = useState<any[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const { user, role, clinicId } = useRole()
  const supabase = createClient()

  const fetchUserNames = async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)]
    if (uniqueIds.length === 0) return {}

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', uniqueIds)

    const names: Record<string, string> = {}
    for (const profile of data || []) {
      names[profile.id] = profile.full_name || 'Sem nome'
    }
    return names
  }

  useEffect(() => {
    if (role !== 'admin') return

    const fetchData = async () => {
      setLoading(true)

      const [pendingRes, activeRes] = await Promise.all([
        supabase
          .from('role_requests')
          .select('id, role, status, created_at, user_id, clinic_id, coren, clinics (name)')
          .eq('status', 'pending'),
        supabase
          .from('user_clinic_roles')
          .select('id, role, created_at, user_id, clinic_id, coren, clinics (name)')
      ])

      const allRequests = pendingRes.data || []
      const allRoles = activeRes.data || []

      setRequests(allRequests)
      setActiveRoles(allRoles)

      // Fetch user names for all user_ids
      const allUserIds = [
        ...allRequests.map((r: any) => r.user_id),
        ...allRoles.map((r: any) => r.user_id)
      ]
      const names = await fetchUserNames(allUserIds)
      setUserNames(names)

      setLoading(false)
    }

    fetchData()
  }, [role, clinicId, supabase])

  const getUserName = (userId: string) => userNames[userId] || `Usuário ${userId.slice(0, 5)}...`

  const handleAction = async (requestId: string, status: 'approved' | 'rejected', user_id: string, clinic_id: string, roleRequested: string, coren: string | null) => {
    try {
      if (status === 'approved') {
        const { error: roleError } = await supabase.from('user_clinic_roles').insert({
          user_id,
          clinic_id,
          role: roleRequested,
          coren: coren
        })
        if (roleError) throw roleError
      }

      const { error: reqError } = await supabase
        .from('role_requests')
        .update({ status })
        .eq('id', requestId)
      
      if (reqError) throw reqError

      setRequests(requests.filter(r => r.id !== requestId))

      if (status === 'approved') {
        const { data } = await supabase.from('user_clinic_roles').select('id, role, created_at, user_id, clinic_id, coren, clinics (name)')
        setActiveRoles(data || [])
      }

      alert(status === 'approved' ? 'Solicitação aprovada!' : 'Solicitação recusada.')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir e revogar o acesso deste usuário?')) return

    try {
      const { error } = await supabase.from('user_clinic_roles').delete().eq('id', roleId)
      if (error) throw error
      setActiveRoles(activeRoles.filter(r => r.id !== roleId))
      alert('Vínculo revogado com sucesso!')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Acesso negado. Apenas Gestores e Administradores.</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1514]">Gestão de Vínculos</h1>
          <p className="text-[#6B5C59] mt-1">Gerencie acessos e solicitações das unidades.</p>
        </div>
        <div className="p-3 rounded-2xl bg-[#A58079]/10 border border-[#A58079]/20">
          <Shield className="w-6 h-6 text-[#A58079]" />
        </div>
      </div>

      <div className="flex border-b border-[#A58079]/20 gap-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'pending' ? 'text-[#2D2422]' : 'text-[#6B5C59] hover:text-[#A58079]'
          }`}
        >
          <div className="flex items-center gap-2">
            Solicitações Pendentes
            {requests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>
            )}
          </div>
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#A58079] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'active' ? 'text-[#2D2422]' : 'text-[#6B5C59] hover:text-[#A58079]'
          }`}
        >
          <div className="flex items-center gap-2">
            Vínculos Ativos
          </div>
          {activeTab === 'active' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#A58079] rounded-t-full" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Activity className="w-8 h-8 text-[#A58079] animate-spin" />
        </div>
      ) : activeTab === 'pending' ? (
        requests.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center border border-[#A58079]/10 shadow-sm">
            <Clock className="w-12 h-12 text-[#A58079]/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#2D2422]">Nenhuma solicitação pendente</h2>
            <p className="text-[#6B5C59] mt-2">Tudo em dia! Novos pedidos aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-3xl p-6 md:p-8 border border-[#A58079]/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#F9F7F6] flex items-center justify-center text-[#A58079] border border-[#A58079]/10 shadow-inner">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2D2422]">{getUserName(req.user_id)}</h3>
                    <p className="text-sm text-[#6B5C59]">Solicita: <span className="font-bold text-[#A58079]">{req.role === 'admin' ? 'Gestor' : req.role === 'nurse' ? 'Enfermeiro(a)' : 'Recepção'}</span></p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 px-3 py-1 bg-[#F9F7F6] rounded-full text-xs font-bold text-[#6B5C59]">
                        <Building2 className="w-3 h-3" /> {req.clinics?.name}
                      </span>
                      {req.coren && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-700">
                          COREN: {req.coren}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleAction(req.id, 'rejected', req.user_id, req.clinic_id, req.role, req.coren)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm transition-colors"
                  >
                    <X className="w-4 h-4" /> Recusar
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'approved', req.user_id, req.clinic_id, req.role, req.coren)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#A58079] text-white font-bold text-sm shadow-lg shadow-[#A58079]/30 hover:shadow-none transition-all"
                  >
                    <Check className="w-4 h-4" /> Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        activeRoles.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center border border-[#A58079]/10 shadow-sm">
            <User className="w-12 h-12 text-[#A58079]/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#2D2422]">Nenhum vínculo ativo</h2>
            <p className="text-[#6B5C59] mt-2">Os vínculos homologados aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRoles.map((roleRecord) => (
              <div key={roleRecord.id} className="bg-white rounded-3xl p-6 border border-[#A58079]/20 shadow-md flex flex-col h-full relative group transition-all hover:border-[#A58079]/40 hover:shadow-lg">
                {roleRecord.user_id !== user?.id && (
                  <button 
                    onClick={() => handleDeleteRole(roleRecord.id)}
                    title="Revogar Vínculo"
                    className="absolute top-4 right-4 p-2.5 bg-red-50 text-red-500 rounded-full transition-all hover:bg-red-100 shadow-sm border border-red-100 active:scale-90"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl shadow-inner ${roleRecord.role === 'admin' ? 'bg-amber-100 text-amber-700' : roleRecord.role === 'nurse' ? 'bg-[#A58079]/10 text-[#A58079]' : 'bg-[#6B5C59]/10 text-[#6B5C59]'}`}>
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Ativo
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-[#2D2422] mb-1">{getUserName(roleRecord.user_id)}</h3>
                <p className="text-sm text-[#A58079] font-bold mb-2">
                  {roleRecord.role === 'admin' ? 'Gestor' : roleRecord.role === 'nurse' ? 'Enfermeiro(a)' : 'Recepção'}
                </p>
                
                <div className="space-y-2 mb-4 flex-1">
                  <p className="text-[#6B5C59] font-medium text-sm flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> {roleRecord.clinics?.name}
                  </p>
                  {roleRecord.coren && (
                    <p className="text-xs font-bold text-[#6B5C59] flex items-center gap-1 bg-[#F9F7F6] px-2 py-1 rounded-md w-fit">
                      COREN: {roleRecord.coren}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

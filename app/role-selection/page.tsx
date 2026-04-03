"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole, Role } from '@/components/layout/RoleContext'
import { createClient } from '@/lib/supabase/client'
import { Shield, Stethoscope, ClipboardList, Activity, Building2, Clock, LogOut, Plus, X } from 'lucide-react'

const roleDefinitions = [
  {
    id: 'admin' as Role,
    title: 'Administrador / Gestor',
    description: 'Acesso completo ao sistema e gerenciamento.',
    icon: Shield,
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'nurse' as Role,
    title: 'Enfermeiro(a)',
    description: 'Prontuários e evolução de feridas.',
    icon: Stethoscope,
    iconBg: 'bg-[#A58079]/10 text-[#A58079]',
  },
  {
    id: 'receptionist' as Role,
    title: 'Recepção',
    description: 'Agendamentos e cadastro de pacientes.',
    icon: ClipboardList,
    iconBg: 'bg-[#6B5C59]/10 text-[#6B5C59]',
  },
]

export default function RoleSelectionPage() {
  const router = useRouter()
  const { setRole, setClinicId, user } = useRole()
  const supabase = createClient()

  const [clinics, setClinics] = useState<any[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<boolean>(false)

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [formClinic, setFormClinic] = useState<string>('')
  const [formRole, setFormRole] = useState<Role | ''>('')
  const [formCoren, setFormCoren] = useState<string>('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      const [clinicsRes, rolesRes, requestsRes] = await Promise.all([
        supabase.from('clinics').select('*'),
        supabase.from('user_clinic_roles').select('*, clinics(name)').eq('user_id', user.id),
        supabase.from('role_requests').select('*, clinics(name)').eq('user_id', user.id).eq('status', 'pending')
      ])

      setClinics(clinicsRes.data || [])
      setUserRoles(rolesRes.data || [])
      setPendingRequests(requestsRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [user, router, supabase])

  const handleRequestRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formClinic || !formRole) return
    if (formRole === 'nurse' && !formCoren.trim()) {
      alert('Por favor, informe seu COREN.')
      return
    }

    setRequesting(true)
    
    try {
      const { error } = await supabase.from('role_requests').insert({
        user_id: user.id,
        clinic_id: formClinic,
        role: formRole,
        coren: formRole === 'nurse' ? formCoren : null,
        status: 'pending'
      })
      
      if (error) throw error
      
      // Refresh requests
      const { data } = await supabase.from('role_requests').select('*, clinics(name)').eq('user_id', user.id).eq('status', 'pending')
      setPendingRequests(data || [])
      setShowForm(false)
      setFormClinic('')
      setFormRole('')
      setFormCoren('')
      alert('Solicitação enviada com sucesso! Aguarde a homologação do administrador.')
    } catch (err: any) {
      alert(err.message)
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
      <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
        <Activity className="w-12 h-10 text-[#A58079] animate-pulse" />
        <p className="text-[#6B5C59] font-medium">Carregando seus vínculos...</p>
      </div>
    )
  }

  const getRoleDef = (roleId: string) => roleDefinitions.find(r => r.id === roleId)

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-start mb-12">
        <div className="text-left flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white border border-[#A58079]/20 shadow-sm">
              <Activity className="w-8 h-8 text-[#A58079]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1A1514] tracking-tight">
                Vitória <span className="text-[#A58079]">Luz</span>
              </h1>
              <p className="text-[#6B5C59] text-sm italic">Gestão Dermatológica Especializada</p>
            </div>
          </div>
          <p className="text-[#6B5C59] mt-2 text-sm md:text-base max-w-md">
            Olá, <span className="font-bold text-[#2D2422]">{user.user_metadata?.full_name || user.email}</span>. 
            Meus Vínculos:
          </p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-colors shadow-sm"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {!showForm ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2D2422]">Meus Vínculos</h2>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#A58079] text-white font-bold shadow-lg hover:shadow-none transition-all"
            >
              <Plus className="w-5 h-5" /> Novo Vínculo
            </button>
          </div>

          {userRoles.length === 0 && pendingRequests.length === 0 ? (
            <div className="bg-white rounded-[40px] border border-[#A58079]/10 p-12 text-center">
              <Building2 className="w-12 h-12 text-[#A58079]/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#2D2422]">Nenhum vínculo encontrado</h3>
              <p className="text-[#6B5C59] mt-2">Clique no botão "Novo Vínculo" para solicitar acesso a uma clínica.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Approved Roles */}
              {userRoles.map((ur) => {
                const roleDef = getRoleDef(ur.role)
                if (!roleDef) return null
                return (
                  <div key={ur.id} className="bg-white rounded-3xl p-6 border border-[#A58079]/20 shadow-md flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${roleDef.iconBg}`}>
                        <roleDef.icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Ativo</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2422] mb-1">{roleDef.title}</h3>
                    <p className="text-[#A58079] font-medium text-sm flex items-center gap-1 mb-4 flex-1">
                      <Building2 className="w-4 h-4" /> {ur.clinics?.name}
                    </p>
                    <button
                      onClick={() => handleEnter(ur.role, ur.clinic_id)}
                      className="w-full py-3 rounded-2xl bg-[#2D2422] text-[#F9F7F6] font-bold hover:bg-[#1A1514] transition-colors mt-auto"
                    >
                      Acessar Unidade
                    </button>
                  </div>
                )
              })}

              {/* Pending Roles */}
              {pendingRequests.map((req) => {
                const roleDef = getRoleDef(req.role)
                if (!roleDef) return null
                return (
                  <div key={req.id} className="bg-[#F9F7F6] rounded-3xl p-6 border border-[#A58079]/10 border-dashed flex flex-col h-full opacity-70 cursor-not-allowed">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gray-200 text-gray-500`}>
                        <roleDef.icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2422] mb-1">{roleDef.title}</h3>
                    <p className="text-[#A58079] font-medium text-sm flex items-center gap-1 mb-4 flex-1">
                      <Building2 className="w-4 h-4" /> {req.clinics?.name}
                    </p>
                    <div className="w-full py-3 rounded-2xl bg-white border border-[#A58079]/10 text-center text-sm font-medium text-[#6B5C59] mt-auto">
                      Aguardando Homologação...
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* NOVO VÍNCULO FORM */
        <div className="bg-white rounded-[40px] border border-[#A58079]/20 p-8 md:p-12 shadow-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#2D2422]">Solicitar Novo Vínculo</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-2 text-[#6B5C59] hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleRequestRole} className="space-y-6 max-w-xl mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#2D2422] ml-4">Selecione a Clínica</label>
              <select
                value={formClinic}
                onChange={(e) => setFormClinic(e.target.value)}
                className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-[28px] px-6 py-4 text-[#2D2422] focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans appearance-none font-bold"
                required
              >
                <option value="" disabled>Selecione uma clínica...</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-sm font-bold text-[#2D2422] ml-4">Selecione o seu Perfil</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as Role)}
                className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-[28px] px-6 py-4 text-[#2D2422] focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans appearance-none font-bold"
                required
              >
                <option value="" disabled>Selecione um perfil...</option>
                {roleDefinitions.map((roleDef) => (
                  <option key={roleDef.id} value={roleDef.id}>
                    {roleDef.title}
                  </option>
                ))}
              </select>
            </div>

            {formRole === 'nurse' && (
              <div className="space-y-2 pt-4 animate-in slide-in-from-top-2">
                <label className="text-sm font-bold text-[#2D2422] ml-4">COREN (Obrigatório)</label>
                <input 
                  type="text" 
                  value={formCoren}
                  onChange={(e) => setFormCoren(e.target.value)}
                  placeholder="Digite seu nº do COREN..."
                  className="w-full bg-[#F9F7F6] border border-[#A58079]/20 rounded-[28px] px-6 py-4 text-[#2D2422] focus:border-[#A58079] focus:ring-2 focus:ring-[#A58079]/10 transition-all font-sans"
                  required
                />
              </div>
            )}

            <div className="pt-8">
              <button
                type="submit"
                disabled={!formClinic || !formRole || (formRole === 'nurse' && !formCoren.trim()) || requesting}
                className="w-full py-4 rounded-full bg-[#2D2422] text-[#F9F7F6] font-bold hover:bg-[#1A1514] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {requesting ? 'Enviando...' : 'Confirmar Solicitação'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
